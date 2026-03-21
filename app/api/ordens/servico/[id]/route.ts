import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';

import { eq } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);

  const ordem = await db
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
    .where(eq(schema.ordemServico.id, ordemId))
    .limit(1);

  if (ordem.length === 0) {
    return new Response(JSON.stringify({ error: 'Ordem não encontrada' }), { status: 404 });
  }

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
    .where(eq(schema.ordemServicoPecas.ordem_servico_id, ordemId));

  return new Response(JSON.stringify({ ...ordem[0], pecas }));
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);
  const data = await request.json();

  const ordemAtualizada = await db
    .update(schema.ordemServico)
    .set({
      data_chegada: data.data_chegada ? new Date(data.data_chegada) : undefined,
      data_saida: data.data_saida ? new Date(data.data_saida) : null,
      status: data.status,
      cliente_id: data.cliente_id,
      veiculo_id: data.veiculo_id,
      funcionario_id: data.funcionario_id,
      observacao: data.observacao,
      valor_total: data.valor_total
    })
    .where(eq(schema.ordemServico.id, ordemId))
    .returning();

  if (data.pecas !== undefined) {
    await db
      .delete(schema.ordemServicoPecas)
      .where(eq(schema.ordemServicoPecas.ordem_servico_id, ordemId));

    if (data.pecas.length > 0) {
      await db.insert(schema.ordemServicoPecas).values(
        data.pecas.map((peca: { peca_id: number; quantidade: number }) => ({
          ordem_servico_id: ordemId,
          peca_id: peca.peca_id,
          quantidade: peca.quantidade
        }))
      );
    }
  }

  await logAction(request, 'edicao', 'ordem_servico', String(ordemId), `Ordem de serviço #${ordemId} atualizada`);
  return new Response(JSON.stringify(ordemAtualizada[0]));
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);

  await db.delete(schema.ordemServico).where(eq(schema.ordemServico.id, ordemId));

  await logAction(request, 'exclusao', 'ordem_servico', String(ordemId), `Ordem de serviço #${ordemId} excluída`);
  return new Response(JSON.stringify({ message: 'Ordem de serviço excluída com sucesso' }));
}
