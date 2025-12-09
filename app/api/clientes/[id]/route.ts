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

  const cliente = await db
    .select()
    .from(schema.cliente)
    .where(eq(schema.cliente.id, id));
  return new Response(JSON.stringify(cliente));
}

export async function PUT(request: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const data = await request.json();

  const updatedCliente = await db
    .update(schema.cliente)
    .set({
      name_cliente: data.name_cliente,
      nome_empresa: data.nome_empresa,
      cnpj: data.cnpj || '',
      cpf: data.cpf,
      telefone: data.telefone,
      status: data.status
    })
    .where(eq(schema.cliente.id, id))
    .returning();

  return new Response(JSON.stringify(updatedCliente));
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  // First delete all vehicles associated with this client
  await db.delete(schema.veiculo).where(eq(schema.veiculo.cliente_id, id));

  // Then delete the client
  await db.delete(schema.cliente).where(eq(schema.cliente.id, id));

  return new Response(
    JSON.stringify({ message: 'Cliente deleted successfully' })
  );
}
