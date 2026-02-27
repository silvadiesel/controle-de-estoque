import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';

import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const peca = await db
      .select()
      .from(schema.pecas)
      .orderBy(asc(schema.pecas.id));
    return NextResponse.json(peca);
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
