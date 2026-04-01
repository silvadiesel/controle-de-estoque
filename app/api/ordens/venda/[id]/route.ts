import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { adjustStock, restoreStock, validateAndDecrementStock } from '@/lib/stock';

import { eq } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);

  const ordem = await db
    .select({
      id: schema.ordemVenda.id,
      data_criacao: schema.ordemVenda.data_criacao,
      data_pagamento: schema.ordemVenda.data_pagamento,
      data_previsao_pagamento: schema.ordemVenda.data_previsao_pagamento,
      status: schema.ordemVenda.status,
      cliente_id: schema.ordemVenda.cliente_id,
      observacao: schema.ordemVenda.observacao,
      valor_total: schema.ordemVenda.valor_total,
      metodo_pagamento: schema.ordemVenda.metodo_pagamento,
      cliente: {
        id: schema.cliente.id,
        name_cliente: schema.cliente.name_cliente,
        nome_empresa: schema.cliente.nome_empresa
      }
    })
    .from(schema.ordemVenda)
    .leftJoin(
      schema.cliente,
      eq(schema.ordemVenda.cliente_id, schema.cliente.id)
    )
    .where(eq(schema.ordemVenda.id, ordemId))
    .limit(1);

  if (ordem.length === 0) {
    return new Response(JSON.stringify({ error: 'Ordem não encontrada' }), {
      status: 404
    });
  }

  const pecas = await db
    .select({
      id: schema.ordemVendaPecas.id,
      peca_id: schema.ordemVendaPecas.peca_id,
      quantidade: schema.ordemVendaPecas.quantidade,
      peca: {
        id: schema.pecas.id,
        name_peca: schema.pecas.name_peca,
        codigo: schema.pecas.codigo,
        preco: schema.pecas.preco,
        quantidade: schema.pecas.quantidade
      }
    })
    .from(schema.ordemVendaPecas)
    .leftJoin(schema.pecas, eq(schema.ordemVendaPecas.peca_id, schema.pecas.id))
    .where(eq(schema.ordemVendaPecas.ordem_venda_id, ordemId));

  return new Response(JSON.stringify({ ...ordem[0], pecas }));
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);
  const data = await request.json();

  try {
    // Buscar estado atual da ordem e suas peças
    const [ordemAtual] = await db
      .select({ status: schema.ordemVenda.status })
      .from(schema.ordemVenda)
      .where(eq(schema.ordemVenda.id, ordemId));

    if (!ordemAtual) {
      return new Response(JSON.stringify({ error: 'Ordem não encontrada' }), { status: 404 });
    }

    const pecasAtuais = await db
      .select({
        peca_id: schema.ordemVendaPecas.peca_id,
        quantidade: schema.ordemVendaPecas.quantidade
      })
      .from(schema.ordemVendaPecas)
      .where(eq(schema.ordemVendaPecas.ordem_venda_id, ordemId));

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
        const pecasParaDecrementar = data.pecas !== undefined ? data.pecas : pecasAtuais;
        if (pecasParaDecrementar.length > 0) {
          await validateAndDecrementStock(tx, pecasParaDecrementar);
        }
      } else if (oldStatus !== 'cancelada' && newStatus !== 'cancelada' && data.pecas !== undefined) {
        // Editando peças em ordem ativa: ajustar diferença
        await adjustStock(tx, pecasAtuais, data.pecas);
      }

      // Atualizar ordem
      const ordemAtualizada = await tx
        .update(schema.ordemVenda)
        .set({
          data_pagamento: data.data_pagamento
            ? new Date(data.data_pagamento)
            : null,
          data_previsao_pagamento: data.data_previsao_pagamento
            ? new Date(data.data_previsao_pagamento)
            : null,
          status: data.status,
          cliente_id: data.cliente_id,
          observacao: data.observacao,
          valor_total: data.valor_total,
          metodo_pagamento: data.metodo_pagamento
        })
        .where(eq(schema.ordemVenda.id, ordemId))
        .returning();

      // Atualizar peças se fornecidas
      if (data.pecas !== undefined) {
        await tx
          .delete(schema.ordemVendaPecas)
          .where(eq(schema.ordemVendaPecas.ordem_venda_id, ordemId));

        if (data.pecas.length > 0) {
          await tx.insert(schema.ordemVendaPecas).values(
            data.pecas.map((peca: { peca_id: number; quantidade: number }) => ({
              ordem_venda_id: ordemId,
              peca_id: peca.peca_id,
              quantidade: peca.quantidade
            }))
          );
        }
      }

      return ordemAtualizada[0];
    });

    await logAction(request, 'edicao', 'ordem_venda', String(ordemId), `Ordem de venda #${ordemId} atualizada`);
    return new Response(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar ordem de venda';
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);

  try {
    // Buscar status e peças antes de excluir
    const [ordem] = await db
      .select({ status: schema.ordemVenda.status })
      .from(schema.ordemVenda)
      .where(eq(schema.ordemVenda.id, ordemId));

    if (!ordem) {
      return new Response(JSON.stringify({ error: 'Ordem não encontrada' }), { status: 404 });
    }

    const pecas = await db
      .select({
        peca_id: schema.ordemVendaPecas.peca_id,
        quantidade: schema.ordemVendaPecas.quantidade
      })
      .from(schema.ordemVendaPecas)
      .where(eq(schema.ordemVendaPecas.ordem_venda_id, ordemId));

    await db.transaction(async (tx) => {
      // Se a ordem não estava cancelada, restaurar estoque
      if (ordem.status !== 'cancelada' && pecas.length > 0) {
        await restoreStock(tx, pecas);
      }

      await tx.delete(schema.ordemVenda).where(eq(schema.ordemVenda.id, ordemId));
    });

    await logAction(request, 'exclusao', 'ordem_venda', String(ordemId), `Ordem de venda #${ordemId} excluída`);
    return new Response(JSON.stringify({ message: 'Ordem de venda excluída com sucesso' }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao excluir ordem de venda';
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}
