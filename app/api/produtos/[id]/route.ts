import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';

import { and, eq, ne } from 'drizzle-orm';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(
    _request,
    'view_produtos'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);

  const peca = await db
    .select()
    .from(schema.pecas)
    .where(eq(schema.pecas.id, id));
  return new Response(JSON.stringify(peca));
}

export async function PUT(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_produtos'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  const data = await request.json();

  if (!data.name_peca?.trim()) {
    return NextResponse.json({ error: 'Nome da peça é obrigatório' }, { status: 400 });
  }
  if (!data.codigo?.trim()) {
    return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 });
  }

  const codigoNormalizado = data.codigo.trim().toUpperCase();

  const duplicado = await db
    .select({ id: schema.pecas.id })
    .from(schema.pecas)
    .where(
      and(eq(schema.pecas.codigo, codigoNormalizado), ne(schema.pecas.id, id))
    )
    .limit(1);

  if (duplicado.length > 0) {
    return NextResponse.json(
      { error: `Já existe outra peça cadastrada com o código '${data.codigo}'` },
      { status: 409 }
    );
  }

  const updatedPeca = await db
    .update(schema.pecas)
    .set({
      name_peca: data.name_peca.trim(),
      codigo: codigoNormalizado,
      categoria_id: data.categoria_id ?? null,
      quantidade: data.quantidade,
      preco: data.preco,
      fornecedor_id: data.fornecedor_id ?? null,
      localizacao: data.localizacao,
      imagem: data.imagem,
      alerta: data.alerta ?? 1
    })
    .where(eq(schema.pecas.id, id))
    .returning();

  await logAction(request, 'edicao', 'produto', String(id), `Peça '${updatedPeca[0]?.name_peca}' atualizada`);
  return new Response(JSON.stringify(updatedPeca));
}

export async function DELETE(request: Request, { params }: Params) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_produtos'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const { id: idParam } = await params;
  const id = Number(idParam);

  const referenciada = await db
    .select()
    .from(schema.ordemServicoPecas)
    .where(eq(schema.ordemServicoPecas.peca_id, id))
    .limit(1);

  if (referenciada.length > 0) {
    return new Response(
      JSON.stringify({ error: 'Não é possível excluir esta peça pois ela está vinculada a uma ou mais ordens de serviço.' }),
      { status: 409 }
    );
  }

  const peca = await db
    .select()
    .from(schema.pecas)
    .where(eq(schema.pecas.id, id))
    .limit(1);

  await db.delete(schema.pecas).where(eq(schema.pecas.id, id));

  await logAction(request, 'exclusao', 'produto', String(id), `Peça '${peca[0]?.name_peca}' excluída`);
  return new Response(JSON.stringify({ message: 'Peca deleted successfully' }));
}
