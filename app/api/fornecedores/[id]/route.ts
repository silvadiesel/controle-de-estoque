import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';

import { eq } from 'drizzle-orm';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(
    _request,
    'read_fornecedor_context'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);

  const fornecedor = await db
    .select()
    .from(schema.fornecedor)
    .where(eq(schema.fornecedor.id, id));
  return new Response(JSON.stringify(fornecedor));
}

export async function PUT(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_fornecedores'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

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

  await logAction(request, 'edicao', 'fornecedor', String(id), `Fornecedor '${updatedFornecedor[0]?.name_empresa}' atualizado`);
  return new Response(JSON.stringify(updatedFornecedor));
}

export async function DELETE(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_fornecedores'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);

  await db.delete(schema.fornecedor).where(eq(schema.fornecedor.id, id));

  await logAction(request, 'exclusao', 'fornecedor', String(id), `Fornecedor #${id} excluído`);
  return new Response(
    JSON.stringify({ message: 'Fornecedor deleted successfully' })
  );
}
