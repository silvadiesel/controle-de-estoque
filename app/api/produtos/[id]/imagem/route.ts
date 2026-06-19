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

// PATCH: Atualiza apenas a imagem da peça (permitido também ao atendente)
export async function PATCH(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_produto_imagem'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const data = await request.json();

  if (data.imagem !== null && typeof data.imagem !== 'string') {
    return NextResponse.json(
      { error: 'Imagem inválida' },
      { status: 400 }
    );
  }

  const updatedPeca = await db
    .update(schema.pecas)
    .set({ imagem: data.imagem })
    .where(eq(schema.pecas.id, id))
    .returning();

  if (updatedPeca.length === 0) {
    return NextResponse.json({ error: 'Peça não encontrada' }, { status: 404 });
  }

  await logAction(
    request,
    'edicao',
    'produto',
    String(id),
    `Imagem da peça '${updatedPeca[0]?.name_peca}' atualizada`
  );
  return new Response(JSON.stringify(updatedPeca));
}
