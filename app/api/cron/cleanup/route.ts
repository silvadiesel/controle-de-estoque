import { NextResponse } from 'next/server';

import { db } from '@/db';
import { heartbeat } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const result = await db.delete(heartbeat).returning({ id: heartbeat.id });
  return NextResponse.json({ ok: true, deleted: result.length });
}
