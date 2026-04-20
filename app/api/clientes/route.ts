import { NextResponse } from 'next/server';

import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';

import { asc, eq, or } from 'drizzle-orm';

export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(request, 'view_clientes');

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  const clientes = await db
    .select()
    .from(schema.cliente)
    .orderBy(asc(schema.cliente.id));
  return new Response(JSON.stringify(clientes));
}

export async function POST(request: Request) {
  const permissionCheck = await requireRoutePermission(request, 'view_clientes');
  if (permissionCheck instanceof Response) return permissionCheck;

  try {
    const data = await request.json();

    if (!data.name_cliente?.trim()) {
      return NextResponse.json({ error: 'Nome do cliente é obrigatório' }, { status: 400 });
    }
    if (!data.telefone?.trim()) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 });
    }

    const cpfNormalizado = data.cpf?.replace(/\D/g, '') || '';
    const cnpjNormalizado = data.cnpj?.replace(/\D/g, '') || '';

    if (!cpfNormalizado && !cnpjNormalizado) {
      return NextResponse.json({ error: 'CPF ou CNPJ é obrigatório' }, { status: 400 });
    }

    const conditions = [];
    if (cpfNormalizado) conditions.push(eq(schema.cliente.cpf, cpfNormalizado));
    if (cnpjNormalizado) conditions.push(eq(schema.cliente.cnpj, cnpjNormalizado));

    const existing = await db
      .select()
      .from(schema.cliente)
      .where(conditions.length === 2 ? or(...conditions) : conditions[0])
      .limit(1);

    if (existing.length > 0) {
      const conflito = existing[0];
      if (cpfNormalizado && conflito.cpf?.replace(/\D/g, '') === cpfNormalizado) {
        return NextResponse.json(
          { error: 'Já existe um cliente cadastrado com este CPF' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Já existe um cliente cadastrado com este CNPJ' },
        { status: 409 }
      );
    }

    const newCliente = await db
      .insert(schema.cliente)
      .values({
        name_cliente: data.name_cliente,
        nome_empresa: data.nome_empresa || '',
        cnpj: data.cnpj || '',
        cpf: data.cpf,
        telefone: data.telefone,
        status: data.status ?? true,
        rua: data.rua ?? null,
        numero: data.numero ?? null,
        bairro: data.bairro ?? null,
        cidade: data.cidade ?? null,
        estado: data.estado ?? null,
        cep: data.cep ?? null
      })
      .returning();

    await logAction(request, 'criacao', 'cliente', String(newCliente[0].id), `Cliente '${newCliente[0].name_cliente}' criado`);
    return NextResponse.json(newCliente, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}
