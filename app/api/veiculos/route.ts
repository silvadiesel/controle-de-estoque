import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';

import { asc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const permissionCheck = await requireRoutePermission(request, 'view_clientes');
  if (permissionCheck instanceof Response) return permissionCheck;

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
  const permissionCheck = await requireRoutePermission(request, 'manage_clientes');
  if (permissionCheck instanceof Response) return permissionCheck;

  try {
    const data = await request.json();

    if (!data.placa?.trim()) {
      return NextResponse.json({ error: 'Placa é obrigatória' }, { status: 400 });
    }
    if (!data.modelo?.trim()) {
      return NextResponse.json({ error: 'Modelo é obrigatório' }, { status: 400 });
    }

    const placaNormalizada = data.placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const existing = await db
      .select()
      .from(schema.veiculo)
      .where(eq(schema.veiculo.placa, placaNormalizada))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Já existe um veículo cadastrado com a placa '${data.placa}'` },
        { status: 409 }
      );
    }

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
    return NextResponse.json(newVeiculo, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return NextResponse.json({ error: 'Erro ao criar veículo' }, { status: 500 });
  }
}
