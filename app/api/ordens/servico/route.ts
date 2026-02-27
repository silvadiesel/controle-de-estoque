import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';

import { desc, eq } from 'drizzle-orm';

export async function GET() {
  const ordens = await db
    .select({
      id: schema.ordemServico.id,
      data_criacao: schema.ordemServico.data_criacao,
      data_chegada: schema.ordemServico.data_chegada,
      data_saida: schema.ordemServico.data_saida,
      status: schema.ordemServico.status,
      cliente_id: schema.ordemServico.cliente_id,
      veiculo_id: schema.ordemServico.veiculo_id,
      funcionario_id: schema.ordemServico.funcionario_id,
      observacao: schema.ordemServico.observacao,
      valor_total: schema.ordemServico.valor_total,
      cliente: {
        id: schema.cliente.id,
        name_cliente: schema.cliente.name_cliente,
        nome_empresa: schema.cliente.nome_empresa
      },
      veiculo: {
        id: schema.veiculo.id,
        placa: schema.veiculo.placa,
        modelo: schema.veiculo.modelo
      },
      funcionario: {
        id: schema.user.id,
        name: schema.user.name
      }
    })
    .from(schema.ordemServico)
    .leftJoin(schema.cliente, eq(schema.ordemServico.cliente_id, schema.cliente.id))
    .leftJoin(schema.veiculo, eq(schema.ordemServico.veiculo_id, schema.veiculo.id))
    .leftJoin(schema.user, eq(schema.ordemServico.funcionario_id, schema.user.id))
    .orderBy(desc(schema.ordemServico.data_criacao));

  const ordensComPecas = await Promise.all(
    ordens.map(async (ordem) => {
      const pecas = await db
        .select({
          id: schema.ordemServicoPecas.id,
          peca_id: schema.ordemServicoPecas.peca_id,
          quantidade: schema.ordemServicoPecas.quantidade,
          peca: {
            id: schema.pecas.id,
            name_peca: schema.pecas.name_peca,
            codigo: schema.pecas.codigo,
            preco: schema.pecas.preco
          }
        })
        .from(schema.ordemServicoPecas)
        .leftJoin(schema.pecas, eq(schema.ordemServicoPecas.peca_id, schema.pecas.id))
        .where(eq(schema.ordemServicoPecas.ordem_servico_id, ordem.id));

      return { ...ordem, pecas };
    })
  );

  return new Response(JSON.stringify(ordensComPecas));
}

export async function POST(request: Request) {
  const data = await request.json();

  const novaOrdem = await db
    .insert(schema.ordemServico)
    .values({
      data_chegada: new Date(data.data_chegada),
      data_saida: data.data_saida ? new Date(data.data_saida) : null,
      status: data.status || 'ativa',
      cliente_id: data.cliente_id,
      veiculo_id: data.veiculo_id,
      funcionario_id: data.funcionario_id,
      observacao: data.observacao || null,
      valor_total: data.valor_total || 0
    })
    .returning();

  const ordemId = novaOrdem[0].id;

  if (data.pecas && data.pecas.length > 0) {
    await db.insert(schema.ordemServicoPecas).values(
      data.pecas.map((peca: { peca_id: number; quantidade: number }) => ({
        ordem_servico_id: ordemId,
        peca_id: peca.peca_id,
        quantidade: peca.quantidade
      }))
    );
  }

  await logAction(request, 'criacao', 'ordem_servico', String(ordemId), `Ordem de serviço #${ordemId} criada`);
  return new Response(JSON.stringify(novaOrdem[0]));
}
