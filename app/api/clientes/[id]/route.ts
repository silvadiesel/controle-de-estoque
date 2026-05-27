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

  const cliente = await db
    .select()
    .from(schema.cliente)
    .where(eq(schema.cliente.id, id));
  return new Response(JSON.stringify(cliente));
}

export async function PUT(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'manage_clientes');
  if (permissionCheck instanceof Response) return permissionCheck;

  const { id: idParam } = await params;
  const id = Number(idParam);
  const data = await request.json();

  if (!data.nome_empresa?.trim()) {
    return new Response(
      JSON.stringify({ error: 'Nome da empresa é obrigatório' }),
      { status: 400 }
    );
  }

  const updatedCliente = await db
    .update(schema.cliente)
    .set({
      nome_empresa: data.nome_empresa,
      cnpj: data.cnpj || '',
      cpf: data.cpf,
      telefone: data.telefone?.trim() ? data.telefone : null,
      status: data.status,
      rua: data.rua ?? null,
      numero: data.numero ?? null,
      bairro: data.bairro ?? null,
      cidade: data.cidade ?? null,
      estado: data.estado ?? null,
      cep: data.cep ?? null
    })
    .where(eq(schema.cliente.id, id))
    .returning();

  await logAction(request, 'edicao', 'cliente', String(id), `Cliente '${updatedCliente[0]?.nome_empresa}' atualizado`);
  return new Response(JSON.stringify(updatedCliente));
}

export async function DELETE(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'manage_clientes');
  if (permissionCheck instanceof Response) return permissionCheck;

  const { id: idParam } = await params;
  const id = Number(idParam);

  try {
    await db.delete(schema.veiculo).where(eq(schema.veiculo.cliente_id, id));
    await db.delete(schema.cliente).where(eq(schema.cliente.id, id));

    await logAction(request, 'exclusao', 'cliente', String(id), `Cliente #${id} excluído`);
    return new Response(
      JSON.stringify({ message: 'Cliente deleted successfully' })
    );
  } catch (error: unknown) {
    if (error instanceof Error && 'cause' in error) {
      const cause = (error as { cause?: { code?: string } }).cause;
      if (cause?.code === '23503') {
        return new Response(
          JSON.stringify({
            error: 'Não é possível excluir este cliente pois existem ordens de serviço vinculadas aos seus veículos. Remova as ordens de serviço primeiro.',
          }),
          { status: 409 }
        );
      }
    }
    return new Response(
      JSON.stringify({ error: 'Erro ao excluir cliente' }),
      { status: 500 }
    );
  }
}
