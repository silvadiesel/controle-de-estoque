import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';

import { asc, eq } from 'drizzle-orm';

export async function GET() {
  const fornecedores = await db
    .select()
    .from(schema.fornecedor)
    .orderBy(asc(schema.fornecedor.id));
  return new Response(JSON.stringify(fornecedores));
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.name_empresa?.trim()) {
      return NextResponse.json({ error: 'Nome da empresa é obrigatório' }, { status: 400 });
    }
    if (!data.cnpj?.trim()) {
      return NextResponse.json({ error: 'CNPJ é obrigatório' }, { status: 400 });
    }
    if (!data.telefone?.trim()) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 });
    }

    const cnpjNormalizado = data.cnpj.replace(/\D/g, '');
    const existing = await db
      .select()
      .from(schema.fornecedor)
      .where(eq(schema.fornecedor.cnpj, cnpjNormalizado))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um fornecedor cadastrado com este CNPJ' },
        { status: 409 }
      );
    }

    const newFornecedor = await db
      .insert(schema.fornecedor)
      .values({
        name_empresa: data.name_empresa,
        cnpj: data.cnpj,
        telefone: data.telefone,
        email: data.email,
        status: data.status
      })
      .returning();

    await logAction(request, 'criacao', 'fornecedor', String(newFornecedor[0].id), `Fornecedor '${newFornecedor[0].name_empresa}' criado`);
    return NextResponse.json(newFornecedor, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    return NextResponse.json({ error: 'Erro ao criar fornecedor' }, { status: 500 });
  }
}
