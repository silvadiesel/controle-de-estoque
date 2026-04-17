import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';

import { asc } from 'drizzle-orm';

export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(request, 'view_mao_obra');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const itens = await db
    .select()
    .from(schema.maoObra)
    .orderBy(asc(schema.maoObra.nome));

  return new Response(JSON.stringify(itens));
}

export async function POST(request: Request) {
  const permissionCheck = await requireRoutePermission(request, 'manage_mao_obra');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  try {
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

    const novo = await db
      .insert(schema.maoObra)
      .values({
        nome: data.nome.trim(),
        valor,
        descricao: descricao.length > 0 ? descricao : null
      })
      .returning();

    await logAction(
      request,
      'criacao',
      'mao_obra',
      String(novo[0].id),
      `Mão de obra '${novo[0].nome}' criada`
    );

    return NextResponse.json(novo, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar mão de obra:', error);
    return NextResponse.json({ error: 'Erro ao criar mão de obra' }, { status: 500 });
  }
}
