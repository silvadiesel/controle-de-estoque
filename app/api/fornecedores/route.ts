import { db, schema } from '@/db';

import { asc } from 'drizzle-orm';

export async function GET() {
  const fornecedores = await db
    .select()
    .from(schema.fornecedor)
    .orderBy(asc(schema.fornecedor.id));
  return new Response(JSON.stringify(fornecedores));
}

export async function POST(request: Request) {
  const data = await request.json();

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

  return new Response(JSON.stringify(newFornecedor));
}
