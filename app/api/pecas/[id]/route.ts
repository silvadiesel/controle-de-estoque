import { db, schema } from '@/db';

import { eq } from 'drizzle-orm';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const peca = await db
    .select()
    .from(schema.pecas)
    .where(eq(schema.pecas.id, id));
  return new Response(JSON.stringify(peca));
}

export async function PUT(request: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const data = await request.json();

  const updatedPeca = await db
    .update(schema.pecas)
    .set({
      name_peca: data.name_peca,
      codigo: data.codigo,
      categoria_id: data.categoria_id,
      quantidade: data.quantidade,
      preco: data.preco,
      fornecedor_id: data.fornecedor_id,
      localizacao: data.localizacao,
      imagem: data.imagem
    })
    .where(eq(schema.pecas.id, id))
    .returning();

  return new Response(JSON.stringify(updatedPeca));
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  await db.delete(schema.pecas).where(eq(schema.pecas.id, id));

  return new Response(JSON.stringify({ message: 'Peca deleted successfully' }));
}
