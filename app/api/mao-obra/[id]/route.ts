import { NextResponse } from 'next/server';

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
  const permissionCheck = await requireRoutePermission(request, 'view_mao_obra');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);

  const item = await db
    .select()
    .from(schema.maoObra)
    .where(eq(schema.maoObra.id, id));

  return new Response(JSON.stringify(item));
}

export async function PUT(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'manage_mao_obra');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  const data = await request.json();

  if (!data.nome?.trim()) {
    return NextResponse.json(
      { error: 'Nome da mão de obra é obrigatório' },
      { status: 400 }
    );
  }

  const valor = Number(data.valor);
  if (!Number.isFinite(valor) || valor <= 0) {
    return NextResponse.json(
      { error: 'Valor da mão de obra deve ser maior que zero' },
      { status: 400 }
    );
  }

  const descricao = typeof data.descricao === 'string' ? data.descricao.trim() : '';

  const updated = await db
    .update(schema.maoObra)
    .set({
      nome: data.nome.trim(),
      valor,
      descricao: descricao.length > 0 ? descricao : null
    })
    .where(eq(schema.maoObra.id, id))
    .returning();

  await logAction(
    request,
    'edicao',
    'mao_obra',
    String(id),
    `Mão de obra '${updated[0]?.nome}' atualizada`
  );

  return new Response(JSON.stringify(updated));
}

export async function DELETE(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(request, 'manage_mao_obra');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);

  try {
    await db.delete(schema.maoObra).where(eq(schema.maoObra.id, id));

    await logAction(
      request,
      'exclusao',
      'mao_obra',
      String(id),
      `Mão de obra #${id} excluída`
    );

    return new Response(
      JSON.stringify({ message: 'Mão de obra excluída com sucesso' })
    );
  } catch (error: unknown) {
    if (error instanceof Error && 'cause' in error) {
      const cause = (error as { cause?: { code?: string } }).cause;
      if (cause?.code === '23503') {
        return new Response(
          JSON.stringify({
            error:
              'Não é possível excluir esta mão de obra pois ela está em uso em uma ou mais ordens de serviço.'
          }),
          { status: 409 }
        );
      }
    }
    return new Response(
      JSON.stringify({ error: 'Erro ao excluir mão de obra' }),
      { status: 500 }
    );
  }
}
