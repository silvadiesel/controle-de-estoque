import { db, schema } from '@/db';

import { asc } from 'drizzle-orm';

export async function GET() {
  const peca = await db
    .select()
    .from(schema.pecas)
    .orderBy(asc(schema.fornecedor.id));
  return new Response(JSON.stringify(peca));
}

export async function POST(request: Request) {
  const data = await request.json();

  const newPeca = await db
    .insert(schema.pecas)
    .values({
      name_peca: data.name_peca,
      codigo: data.codigo,
      categoria_id: data.categoria_id,
      quantidade: data.quantidade,
      preco: data.preco,
      fornecedor_id: data.fornecedor_id,
      localizacao: data.localizacao
    })
    .returning();

  return new Response(JSON.stringify(newPeca));
}
