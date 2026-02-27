import type { NextRequest } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';

import { asc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clienteId = searchParams.get('cliente_id');

  const query = db.select().from(schema.veiculo);

  if (clienteId) {
    const veiculos = await query
      .where(eq(schema.veiculo.cliente_id, Number(clienteId)))
      .orderBy(asc(schema.veiculo.id));
    return new Response(JSON.stringify(veiculos));
  }

  const veiculos = await query.orderBy(asc(schema.veiculo.id));
  return new Response(JSON.stringify(veiculos));
}

export async function POST(request: Request) {
  const data = await request.json();

  const newVeiculo = await db
    .insert(schema.veiculo)
    .values({
      placa: data.placa,
      modelo: data.modelo,
      status: data.status ?? true,
      cliente_id: data.cliente_id
    })
    .returning();

  await logAction(request, 'criacao', 'veiculo', String(newVeiculo[0].id), `Veículo '${newVeiculo[0].placa} - ${newVeiculo[0].modelo}' criado`);
  return new Response(JSON.stringify(newVeiculo));
}
