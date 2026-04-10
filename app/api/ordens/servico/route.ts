import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';
import { validateAndDecrementStock } from '@/lib/stock';

import { aliasedTable, desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(request, 'view_ordens');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const funcionarioResponsavel = aliasedTable(schema.user, 'funcionario_responsavel');

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
      funcionario_responsavel_id: schema.ordemServico.funcionario_responsavel_id,
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
      },
      funcionario_responsavel: {
        id: funcionarioResponsavel.id,
        name: funcionarioResponsavel.name
      }
    })
    .from(schema.ordemServico)
    .leftJoin(schema.cliente, eq(schema.ordemServico.cliente_id, schema.cliente.id))
    .leftJoin(schema.veiculo, eq(schema.ordemServico.veiculo_id, schema.veiculo.id))
    .leftJoin(schema.user, eq(schema.ordemServico.funcionario_id, schema.user.id))
    .leftJoin(funcionarioResponsavel, eq(schema.ordemServico.funcionario_responsavel_id, funcionarioResponsavel.id))
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

  // Validação de campos obrigatórios
  if (!data.funcionario_id || !data.funcionario_responsavel_id || !data.cliente_id || !data.veiculo_id || !data.data_chegada) {
    return new Response(
      JSON.stringify({ error: 'Campos obrigatórios faltando (cliente, veículo, funcionários ou data de chegada)' }),
      { status: 400 }
    );
  }

  // Validar que veículo pertence ao cliente
  const [veiculo] = await db
    .select({ cliente_id: schema.veiculo.cliente_id })
    .from(schema.veiculo)
    .where(eq(schema.veiculo.id, data.veiculo_id))
    .limit(1);

  if (!veiculo || veiculo.cliente_id !== data.cliente_id) {
    return new Response(
      JSON.stringify({ error: 'Veículo não pertence ao cliente selecionado' }),
      { status: 400 }
    );
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Validar e decrementar estoque
      if (data.pecas && data.pecas.length > 0) {
        await validateAndDecrementStock(tx, data.pecas);
      }

      // Criar ordem
      const novaOrdem = await tx
        .insert(schema.ordemServico)
        .values({
          data_chegada: new Date(data.data_chegada),
          data_saida: data.data_saida ? new Date(data.data_saida) : null,
          status: data.status || 'ativa',
          cliente_id: data.cliente_id,
          veiculo_id: data.veiculo_id,
          funcionario_id: data.funcionario_id,
          funcionario_responsavel_id: data.funcionario_responsavel_id,
          observacao: data.observacao || null,
          valor_total: data.valor_total || 0
        })
        .returning();

      const ordemId = novaOrdem[0].id;

      // Inserir peças na tabela de junção
      if (data.pecas && data.pecas.length > 0) {
        await tx.insert(schema.ordemServicoPecas).values(
          data.pecas.map((peca: { peca_id: number; quantidade: number }) => ({
            ordem_servico_id: ordemId,
            peca_id: peca.peca_id,
            quantidade: peca.quantidade
          }))
        );
      }

      return novaOrdem[0];
    });

    await logAction(request, 'criacao', 'ordem_servico', String(result.id), `Ordem de serviço #${result.id} criada`);
    return new Response(JSON.stringify(result));
  } catch (error: unknown) {
    console.error('Erro ao criar ordem de serviço:', error);
    const pgError = error as { message?: string; detail?: string; code?: string; severity?: string };
    const message = pgError.detail || pgError.message || 'Erro ao criar ordem de serviço';
    return new Response(JSON.stringify({ error: message, code: pgError.code }), { status: 400 });
  }
}
