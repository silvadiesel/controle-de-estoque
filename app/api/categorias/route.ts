/**
 * Route Handler para Categorias
 * =============================
 *
 * Este arquivo implementa a API RESTful para gerenciar categorias de produtos.
 *
 * O que são Route Handlers?
 * -------------------------
 * Route Handlers são a forma moderna do Next.js (App Router) para criar APIs.
 * Eles substituem as antigas "API Routes" do Pages Router.
 *
 * Convenções:
 * - O arquivo DEVE se chamar `route.ts` (ou route.js)
 * - Cada função exportada corresponde a um método HTTP (GET, POST, PUT, DELETE, etc.)
 * - O caminho da API é definido pela pasta onde o arquivo está
 *   Ex: app/api/categorias/route.ts → /api/categorias
 *
 * Por que usar Route Handlers ao invés de chamar o DB direto no componente?
 * -------------------------------------------------------------------------
 * 1. Separação de responsabilidades: a lógica de banco fica centralizada
 * 2. Segurança: credenciais do banco não vazam para o cliente
 * 3. Reutilização: a mesma API pode ser usada por múltiplos clientes
 * 4. Testabilidade: mais fácil testar APIs isoladamente
 */
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { categorias } from '@/db/schema';
import { logAction } from '@/lib/log-action';
import { requireRoutePermission } from '@/lib/server/access-control';

import { sql } from 'drizzle-orm';

/**
 * GET /api/categorias
 *
 * Lista todas as categorias do banco de dados.
 *
 * Por que usar NextResponse.json() ao invés de Response.json()?
 * ------------------------------------------------------------
 * NextResponse é uma extensão do Response nativo com funcionalidades extras
 * do Next.js, como manipulação de cookies e headers de forma mais fácil.
 * Para respostas simples, ambos funcionam igual.
 */
export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(
    request,
    'read_categoria_context'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  try {
    // Busca todas as categorias ordenadas pelo ID
    // O método .select() sem argumentos retorna todas as colunas
    const result = await db.select().from(categorias);

    // Retorna os dados como JSON com status 200 (padrão)
    return NextResponse.json(result);
  } catch (error) {
    // Log do erro no servidor (não expõe detalhes ao cliente)
    console.error('Erro ao buscar categorias:', error);

    // Retorna erro genérico ao cliente
    // Em produção, NUNCA exponha detalhes do erro interno
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categorias
 *
 * Cria uma nova categoria no banco de dados.
 *
 * O corpo da requisição (body) deve conter:
 * {
 *   "name": "Nome da Categoria"
 * }
 */
export async function POST(request: Request) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_categorias'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  try {
    // Extrai o JSON do corpo da requisição
    // request.json() é assíncrono, então usamos await
    const body = await request.json();

    // Validação básica: nome é obrigatório e não pode ser vazio
    // Em projetos maiores, use bibliotecas como Zod para validação
    if (
      !body.name ||
      typeof body.name !== 'string' ||
      body.name.trim() === ''
    ) {
      return NextResponse.json(
        { error: 'O nome da categoria é obrigatório' },
        { status: 400 } // 400 = Bad Request (erro do cliente)
      );
    }

    const existing = await db
      .select()
      .from(categorias)
      .where(sql`lower(${categorias.name}) = lower(${body.name.trim()})`)
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Já existe uma categoria com o nome '${body.name.trim()}'` },
        { status: 409 }
      );
    }

    const [newCategory] = await db
      .insert(categorias)
      .values({ name: body.name.trim() })
      .returning();

    await logAction(request, 'criacao', 'categoria', String(newCategory.id), `Categoria '${newCategory.name}' criada`);

    // Retorna a categoria criada com status 201 (Created)
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}
