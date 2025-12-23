import { db, schema } from '@/db';

import { asc } from 'drizzle-orm';

export async function GET() {
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
