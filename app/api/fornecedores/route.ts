import { db, schema } from '@/db';
import { logAction } from '@/lib/log-action';

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

  await logAction(request, 'criacao', 'fornecedor', String(newFornecedor[0].id), `Fornecedor '${newFornecedor[0].name_empresa}' criado`);
  return new Response(JSON.stringify(newFornecedor));
}
