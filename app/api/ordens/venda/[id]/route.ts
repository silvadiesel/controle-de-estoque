import { db, schema } from '@/db';

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
        preco: schema.pecas.preco
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

  const ordemAtualizada = await db
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

  if (data.pecas !== undefined) {
    await db
      .delete(schema.ordemVendaPecas)
      .where(eq(schema.ordemVendaPecas.ordem_venda_id, ordemId));

    if (data.pecas.length > 0) {
      await db.insert(schema.ordemVendaPecas).values(
        data.pecas.map((peca: { peca_id: number; quantidade: number }) => ({
          ordem_venda_id: ordemId,
          peca_id: peca.peca_id,
          quantidade: peca.quantidade
        }))
      );
    }
  }

  return new Response(JSON.stringify(ordemAtualizada[0]));
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ordemId = parseInt(id);

  await db.delete(schema.ordemVenda).where(eq(schema.ordemVenda.id, ordemId));

  return new Response(
    JSON.stringify({ message: 'Ordem de venda excluída com sucesso' })
  );
}
