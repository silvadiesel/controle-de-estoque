import { db, schema } from '@/db';
import { requireRoutePermission } from '@/lib/server/access-control';

import { and, gte, ne, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(request, 'view_mao_obra');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

  const [row] = await db
    .select({
      faturamento_mes: sql<number>`COALESCE(SUM(${schema.ordemServico.valor_mao_obra}), 0)`
    })
    .from(schema.ordemServico)
    .where(
      and(
        gte(schema.ordemServico.data_criacao, inicioMes),
        ne(schema.ordemServico.status, 'cancelada')
      )
    );

  return new Response(
    JSON.stringify({ faturamento_mes: Number(row?.faturamento_mes ?? 0) })
  );
}
