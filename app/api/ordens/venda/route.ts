import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';
import { validateAndDecrementStock } from '@/lib/stock';

import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(request, 'view_ordens');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const ordens = await db
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
    .orderBy(desc(schema.ordemVenda.data_criacao));

  const ordensComPecas = await Promise.all(
    ordens.map(async (ordem) => {
      const pecas = await db
        .select({
          id: schema.ordemVendaPecas.id,
          peca_id: schema.ordemVendaPecas.peca_id,
          quantidade: schema.ordemVendaPecas.quantidade,
          peca: {
            id: schema.pecas.id,
            name_peca: schema.pecas.name_peca,
            codigo: schema.pecas.codigo,
            preco: schema.pecas.preco
          }
        })
        .from(schema.ordemVendaPecas)
        .leftJoin(
          schema.pecas,
          eq(schema.ordemVendaPecas.peca_id, schema.pecas.id)
        )
        .where(eq(schema.ordemVendaPecas.ordem_venda_id, ordem.id));

      return { ...ordem, pecas };
    })
  );

  return new Response(JSON.stringify(ordensComPecas));
}

export async function POST(request: Request) {
  const data = await request.json();

  // Validação de campos obrigatórios
  if (!data.cliente_id) {
    return new Response(
      JSON.stringify({ error: 'Cliente é obrigatório' }),
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
        .insert(schema.ordemVenda)
        .values({
          data_pagamento: data.data_pagamento
            ? new Date(data.data_pagamento)
            : null,
          data_previsao_pagamento: data.data_previsao_pagamento
            ? new Date(data.data_previsao_pagamento)
            : null,
          status: data.status || 'ativa',
          cliente_id: data.cliente_id,
          observacao: data.observacao || null,
          valor_total: data.valor_total || 0,
          metodo_pagamento: data.metodo_pagamento || null
        })
        .returning();

      const ordemId = novaOrdem[0].id;

      // Inserir peças na tabela de junção
      if (data.pecas && data.pecas.length > 0) {
        await tx.insert(schema.ordemVendaPecas).values(
          data.pecas.map((peca: { peca_id: number; quantidade: number }) => ({
            ordem_venda_id: ordemId,
            peca_id: peca.peca_id,
            quantidade: peca.quantidade
          }))
        );
      }

      return novaOrdem[0];
    });

    await logAction(request, 'criacao', 'ordem_venda', String(result.id), `Ordem de venda #${result.id} criada`);
    return new Response(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar ordem de venda';
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}
