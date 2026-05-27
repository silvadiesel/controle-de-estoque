import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';

import { eq } from 'drizzle-orm';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'view_clientes');
  if (permissionCheck instanceof Response) return permissionCheck;

  const { id: idParam } = await params;
  const id = Number(idParam);

  const veiculo = await db
    .select()
    .from(schema.veiculo)
    .where(eq(schema.veiculo.id, id));
  return new Response(JSON.stringify(veiculo));
}

export async function PUT(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'manage_clientes');
  if (permissionCheck instanceof Response) return permissionCheck;

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

  await logAction(request, 'edicao', 'veiculo', String(id), `Veículo '${updatedVeiculo[0]?.placa} - ${updatedVeiculo[0]?.modelo}' atualizado`);
  return new Response(JSON.stringify(updatedVeiculo));
}

export async function DELETE(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'manage_clientes');
  if (permissionCheck instanceof Response) return permissionCheck;

  const { id: idParam } = await params;
  const id = Number(idParam);

  await db.delete(schema.veiculo).where(eq(schema.veiculo.id, id));

  await logAction(request, 'exclusao', 'veiculo', String(id), `Veículo #${id} excluído`);
  return new Response(
    JSON.stringify({ message: 'Veiculo deleted successfully' })
  );
}
