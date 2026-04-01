import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';

import { asc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fornecedorIdParam = searchParams.get('fornecedor_id');

    let pecas;
    if (fornecedorIdParam) {
      pecas = await db
        .select()
        .from(schema.pecas)
        .where(eq(schema.pecas.fornecedor_id, Number(fornecedorIdParam)))
        .orderBy(asc(schema.pecas.id));
    } else {
      pecas = await db
        .select()
        .from(schema.pecas)
        .orderBy(asc(schema.pecas.id));
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
  try {
    const data = await request.json();

    if (!data.name_peca?.trim()) {
      return NextResponse.json({ error: 'Nome da peça é obrigatório' }, { status: 400 });
    }
    if (!data.codigo?.trim()) {
      return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 });
    }
    if (!data.categoria_id) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 });
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
        categoria_id: data.categoria_id,
        quantidade: data.quantidade,
        preco: data.preco,
        fornecedor_id: data.fornecedor_id,
        localizacao: data.localizacao,
        imagem: data.imagem || null,
        alerta: data.alerta ?? 1
      })
      .returning();

    await logAction(request, 'criacao', 'produto', String(newPeca[0].id), `Produto '${newPeca[0].name_peca}' criado`);
    return NextResponse.json(newPeca, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar peça:', error);
    return NextResponse.json({ error: 'Erro ao criar peça' }, { status: 500 });
  }
}
