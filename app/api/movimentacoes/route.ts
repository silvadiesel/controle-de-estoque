import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { requireRoutePermission } from '@/lib/server/access-control';

import { parseMovimentacoesPagination } from './_lib/pagination';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(
    request,
    'view_movimentacoes'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  try {
    const pagination = parseMovimentacoesPagination(request.url);

    const baseQuery = () =>
      db
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
        .leftJoin(
          schema.user,
          eq(schema.movimentacoes.usuario_id, schema.user.id)
        )
        .orderBy(desc(schema.movimentacoes.created_at));

    if (!pagination.isPaginatedRequest) {
      const movs = await baseQuery();
      return NextResponse.json(movs);
    }

    const [data, total] = await Promise.all([
      baseQuery().limit(pagination.pageSize).offset(pagination.offset),
      db.$count(schema.movimentacoes)
    ]);

    return NextResponse.json({
      data,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize
    });
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar movimentações' },
      { status: 500 }
    );
  }
}
