import { NextResponse } from 'next/server';

import { db } from '@/db';
import { heartbeat } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const result = await db.delete(heartbeat).returning({ id: heartbeat.id });
  return NextResponse.json({ ok: true, deleted: result.length });
}
