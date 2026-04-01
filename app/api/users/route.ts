import { db, schema } from '@/db';
import { requireRoutePermission } from '@/lib/server/access-control';

import { asc } from 'drizzle-orm';

export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(
    request,
    'read_users_context'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const users = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      cargo: schema.user.cargo,
      status: schema.user.status,
      createdAt: schema.user.createdAt
    })
    .from(schema.user)
    .orderBy(asc(schema.user.createdAt));
  return new Response(JSON.stringify(users));
}
