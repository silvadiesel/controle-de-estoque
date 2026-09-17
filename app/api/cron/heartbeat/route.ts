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

  const rest = await pingRest();
  if (!rest.ok) {
    return NextResponse.json(
      { ok: false, id: row.id, pingedAt: row.pingedAt, rest },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    id: row.id,
    pingedAt: row.pingedAt,
    rest
  });
}

type RestPing =
  | { ok: true; status: number }
  | { ok: false; status: number | null; error: string };

async function pingRest(): Promise<RestPing> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return {
      ok: false,
      status: null,
      error: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set'
    };
  }

  try {
    const res = await fetch(`${url}/rest/v1/heartbeat?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000)
    });
    if (!res.ok) {
      return { ok: false, status: res.status, error: await res.text() };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return {
      ok: false,
      status: null,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
