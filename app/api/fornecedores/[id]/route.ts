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

  const fornecedor = await db
    .select()
    .from(schema.fornecedor)
    .where(eq(schema.fornecedor.id, id));
  return new Response(JSON.stringify(fornecedor));
}

export async function PUT(request: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const data = await request.json();

  const updatedFornecedor = await db
    .update(schema.fornecedor)
    .set({
      name_empresa: data.name_empresa,
      cnpj: data.cnpj,
      telefone: data.telefone,
      email: data.email,
      status: data.status
    })
    .where(eq(schema.fornecedor.id, id))
    .returning();

  return new Response(JSON.stringify(updatedFornecedor));
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  await db.delete(schema.fornecedor).where(eq(schema.fornecedor.id, id));

  return new Response(
    JSON.stringify({ message: 'Fornecedor deleted successfully' })
  );
}
