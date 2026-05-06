import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';

import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(request, 'view_produtos');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  try {
    const { searchParams } = new URL(request.url);
    const fornecedorIdParam = searchParams.get('fornecedor_id');

    let pecas;
    if (fornecedorIdParam) {
      pecas = await db
        .select()
        .from(schema.pecas)
        .where(eq(schema.pecas.fornecedor_id, Number(fornecedorIdParam)))
        .orderBy(desc(schema.pecas.data_cadastro), desc(schema.pecas.id));
    } else {
      pecas = await db
        .select()
        .from(schema.pecas)
        .orderBy(desc(schema.pecas.data_cadastro), desc(schema.pecas.id));
    }
    return NextResponse.json(pecas);
  } catch (error) {
    console.error('Erro ao buscar peças:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar peças' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_produtos'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  try {
    const data = await request.json();

    if (!data.name_peca?.trim()) {
      return NextResponse.json({ error: 'Nome da peça é obrigatório' }, { status: 400 });
    }
    if (!data.codigo?.trim()) {
      return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(schema.pecas)
      .where(eq(schema.pecas.codigo, data.codigo.trim().toUpperCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Já existe uma peça cadastrada com o código '${data.codigo}'` },
        { status: 409 }
      );
    }

    const newPeca = await db
      .insert(schema.pecas)
      .values({
        name_peca: data.name_peca,
        codigo: data.codigo,
        categoria_id: data.categoria_id ?? null,
        quantidade: data.quantidade,
        preco: data.preco,
        fornecedor_id: data.fornecedor_id,
        localizacao: data.localizacao,
        imagem: data.imagem || null,
        alerta: data.alerta ?? 1
      })
      .returning();

    await logAction(request, 'criacao', 'produto', String(newPeca[0].id), `Peça '${newPeca[0].name_peca}' criada`);
    return NextResponse.json(newPeca, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar peça:', error);
    return NextResponse.json({ error: 'Erro ao criar peça' }, { status: 500 });
  }
}
