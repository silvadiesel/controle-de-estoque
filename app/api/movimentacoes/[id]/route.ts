import { NextResponse } from 'next/server';

import { db, schema } from '@/db';

import { eq } from 'drizzle-orm';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const [mov] = await db
      .select({
        id: schema.movimentacoes.id,
        tipo_acao: schema.movimentacoes.tipo_acao,
        entidade: schema.movimentacoes.entidade,
        entidade_id: schema.movimentacoes.entidade_id,
        descricao: schema.movimentacoes.descricao,
        created_at: schema.movimentacoes.created_at,
        usuario: {
          id: schema.user.id,
          name: schema.user.name
        }
      })
      .from(schema.movimentacoes)
      .leftJoin(schema.user, eq(schema.movimentacoes.usuario_id, schema.user.id))
      .where(eq(schema.movimentacoes.id, numericId));

    if (!mov) {
      return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 });
    }

    return NextResponse.json(mov);
  } catch (error) {
    console.error('Erro ao buscar movimentação:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar movimentação' },
      { status: 500 }
    );
  }
}
