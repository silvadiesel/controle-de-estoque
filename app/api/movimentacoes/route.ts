import { NextResponse } from 'next/server';

import { db, schema } from '@/db';

import { desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const movs = await db
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
      .orderBy(desc(schema.movimentacoes.created_at));

    return NextResponse.json(movs);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar movimentações' },
      { status: 500 }
    );
  }
}
