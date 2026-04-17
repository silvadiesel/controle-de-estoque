import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import {
  adjustStock,
  restoreStock,
  validateAndDecrementStock
} from '@/lib/stock';

import { aliasedTable, eq } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);

  const funcionarioResponsavel = aliasedTable(
    schema.user,
    'funcionario_responsavel'
  );

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
      funcionario_responsavel_id:
        schema.ordemServico.funcionario_responsavel_id,
      observacao: schema.ordemServico.observacao,
      valor_total: schema.ordemServico.valor_total,
      valor_mao_obra: schema.ordemServico.valor_mao_obra,
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
    .leftJoin(
      schema.cliente,
      eq(schema.ordemServico.cliente_id, schema.cliente.id)
    )
    .leftJoin(
      schema.veiculo,
      eq(schema.ordemServico.veiculo_id, schema.veiculo.id)
    )
    .leftJoin(
      schema.user,
      eq(schema.ordemServico.funcionario_id, schema.user.id)
    )
    .leftJoin(
      funcionarioResponsavel,
      eq(
        schema.ordemServico.funcionario_responsavel_id,
        funcionarioResponsavel.id
      )
    )
    .where(eq(schema.ordemServico.id, ordemId))
    .limit(1);

  if (ordem.length === 0) {
    return new Response(JSON.stringify({ error: 'Ordem não encontrada' }), {
      status: 404
    });
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
        preco: schema.pecas.preco,
        quantidade: schema.pecas.quantidade
      }
    })
    .from(schema.ordemServicoPecas)
    .leftJoin(
      schema.pecas,
      eq(schema.ordemServicoPecas.peca_id, schema.pecas.id)
    )
    .where(eq(schema.ordemServicoPecas.ordem_servico_id, ordemId));

  const maoObra = await db
    .select({
      id: schema.ordemServicoMaoObra.id,
      mao_obra_id: schema.ordemServicoMaoObra.mao_obra_id,
      descricao: schema.ordemServicoMaoObra.descricao,
      valor: schema.ordemServicoMaoObra.valor
    })
    .from(schema.ordemServicoMaoObra)
    .where(eq(schema.ordemServicoMaoObra.ordem_servico_id, ordemId));

  return new Response(
    JSON.stringify({ ...ordem[0], pecas, mao_obra: maoObra })
  );
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);
  const data = await request.json();

  try {
    // Buscar estado atual da ordem e suas peças
    const [ordemAtual] = await db
      .select({ status: schema.ordemServico.status })
      .from(schema.ordemServico)
      .where(eq(schema.ordemServico.id, ordemId));

    if (!ordemAtual) {
      return new Response(JSON.stringify({ error: 'Ordem não encontrada' }), {
        status: 404
      });
    }

    const pecasAtuais = await db
      .select({
        peca_id: schema.ordemServicoPecas.peca_id,
        quantidade: schema.ordemServicoPecas.quantidade
      })
      .from(schema.ordemServicoPecas)
      .where(eq(schema.ordemServicoPecas.ordem_servico_id, ordemId));

    const oldStatus = ordemAtual.status;
    const newStatus = data.status || oldStatus;

    const result = await db.transaction(async (tx) => {
      // Lógica de ajuste de estoque baseada na transição de status
      if (oldStatus !== 'cancelada' && newStatus === 'cancelada') {
        // Cancelando: restaurar estoque de todas as peças atuais
        if (pecasAtuais.length > 0) {
          await restoreStock(tx, pecasAtuais);
        }
      } else if (oldStatus === 'cancelada' && newStatus !== 'cancelada') {
        // Reativando ordem cancelada: decrementar estoque novamente
        const pecasParaDecrementar =
          data.pecas !== undefined ? data.pecas : pecasAtuais;
        if (pecasParaDecrementar.length > 0) {
          await validateAndDecrementStock(tx, pecasParaDecrementar);
        }
      } else if (
        oldStatus !== 'cancelada' &&
        newStatus !== 'cancelada' &&
        data.pecas !== undefined
      ) {
        // Editando peças em ordem ativa: ajustar diferença
        await adjustStock(tx, pecasAtuais, data.pecas);
      }

      // Atualizar ordem
      const ordemAtualizada = await tx
        .update(schema.ordemServico)
        .set({
          data_chegada: data.data_chegada
            ? new Date(data.data_chegada)
            : undefined,
          data_saida: data.data_saida ? new Date(data.data_saida) : null,
          status: data.status,
          cliente_id: data.cliente_id,
          veiculo_id: data.veiculo_id,
          funcionario_id: data.funcionario_id,
          funcionario_responsavel_id: data.funcionario_responsavel_id,
          observacao: data.observacao,
          valor_total: data.valor_total,
          valor_mao_obra: data.valor_mao_obra
        })
        .where(eq(schema.ordemServico.id, ordemId))
        .returning();

      // Atualizar mão de obra se fornecida
      if (data.mao_obra !== undefined) {
        await tx
          .delete(schema.ordemServicoMaoObra)
          .where(eq(schema.ordemServicoMaoObra.ordem_servico_id, ordemId));

        if (data.mao_obra.length > 0) {
          await tx.insert(schema.ordemServicoMaoObra).values(
            data.mao_obra.map(
              (item: {
                mao_obra_id?: number | null;
                descricao: string;
                valor: number;
              }) => ({
                ordem_servico_id: ordemId,
                mao_obra_id: item.mao_obra_id ?? null,
                descricao: item.descricao,
                valor: item.valor
              })
            )
          );
        }
      }

      // Atualizar peças se fornecidas
      if (data.pecas !== undefined) {
        await tx
          .delete(schema.ordemServicoPecas)
          .where(eq(schema.ordemServicoPecas.ordem_servico_id, ordemId));

        if (data.pecas.length > 0) {
          await tx.insert(schema.ordemServicoPecas).values(
            data.pecas.map((peca: { peca_id: number; quantidade: number }) => ({
              ordem_servico_id: ordemId,
              peca_id: peca.peca_id,
              quantidade: peca.quantidade
            }))
          );
        }
      }

      return ordemAtualizada[0];
    });

    await logAction(
      request,
      'edicao',
      'ordem_servico',
      String(ordemId),
      `Ordem de serviço #${ordemId} atualizada`
    );
    return new Response(JSON.stringify(result));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro ao atualizar ordem de serviço';
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);

  try {
    // Buscar status e peças antes de excluir
    const [ordem] = await db
      .select({ status: schema.ordemServico.status })
      .from(schema.ordemServico)
      .where(eq(schema.ordemServico.id, ordemId));

    if (!ordem) {
      return new Response(JSON.stringify({ error: 'Ordem não encontrada' }), {
        status: 404
      });
    }

    const pecas = await db
      .select({
        peca_id: schema.ordemServicoPecas.peca_id,
        quantidade: schema.ordemServicoPecas.quantidade
      })
      .from(schema.ordemServicoPecas)
      .where(eq(schema.ordemServicoPecas.ordem_servico_id, ordemId));

    await db.transaction(async (tx) => {
      // Se a ordem não estava cancelada, restaurar estoque
      if (ordem.status !== 'cancelada' && pecas.length > 0) {
        await restoreStock(tx, pecas);
      }

      await tx
        .delete(schema.ordemServico)
        .where(eq(schema.ordemServico.id, ordemId));
    });

    await logAction(
      request,
      'exclusao',
      'ordem_servico',
      String(ordemId),
      `Ordem de serviço #${ordemId} excluída`
    );
    return new Response(
      JSON.stringify({ message: 'Ordem de serviço excluída com sucesso' })
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erro ao excluir ordem de serviço';
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}
