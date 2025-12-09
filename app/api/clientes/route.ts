import { db, schema } from '@/db';

import { asc } from 'drizzle-orm';

export async function GET() {
  const clientes = await db
    .select()
    .from(schema.cliente)
    .orderBy(asc(schema.cliente.id));
  return new Response(JSON.stringify(clientes));
}

export async function POST(request: Request) {
  const data = await request.json();

  const newCliente = await db
    .insert(schema.cliente)
    .values({
      name_cliente: data.name_cliente,
      nome_empresa: data.nome_empresa,
      cnpj: data.cnpj || '',
      cpf: data.cpf,
      telefone: data.telefone,
      status: data.status ?? true
    })
    .returning();

  return new Response(JSON.stringify(newCliente));
}
