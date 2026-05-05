import { NextResponse } from 'next/server';

import { db } from '@/db';
import { heartbeat } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const [row] = await db.insert(heartbeat).values({}).returning();
  return NextResponse.json({ ok: true, id: row.id, pingedAt: row.pingedAt });
}
