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

  const veiculo = await db
    .select()
    .from(schema.veiculo)
    .where(eq(schema.veiculo.id, id));
  return new Response(JSON.stringify(veiculo));
}

export async function PUT(request: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const data = await request.json();

  const updatedVeiculo = await db
    .update(schema.veiculo)
    .set({
      placa: data.placa,
      modelo: data.modelo,
      status: data.status
    })
    .where(eq(schema.veiculo.id, id))
    .returning();

  return new Response(JSON.stringify(updatedVeiculo));
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  await db.delete(schema.veiculo).where(eq(schema.veiculo.id, id));

  return new Response(
    JSON.stringify({ message: 'Veiculo deleted successfully' })
  );
}
