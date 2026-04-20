import { db, schema } from '@/db';
import { requireRoutePermission } from '@/lib/server/access-control';

import { lte } from 'drizzle-orm';

export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(request, 'view_alertas');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const pecasEmAlerta = await db
    .select({
      id: schema.pecas.id,
      name_peca: schema.pecas.name_peca,
      codigo: schema.pecas.codigo,
      quantidade: schema.pecas.quantidade,
      alerta: schema.pecas.alerta
    })
    .from(schema.pecas)
    .where(lte(schema.pecas.quantidade, schema.pecas.alerta));

  return Response.json(pecasEmAlerta);
}
