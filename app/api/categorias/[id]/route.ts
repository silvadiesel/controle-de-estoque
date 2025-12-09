/**
 * Route Handler para Categoria Individual
 * ========================================
 *
 * Este arquivo lida com operações em uma categoria específica.
 *
 * Rotas Dinâmicas no Next.js:
 * ---------------------------
 * O nome da pasta [id] cria uma rota dinâmica.
 * Ex: /api/categorias/5 → id = "5"
 *
 * Como acessar o parâmetro dinâmico:
 * - O segundo argumento da função contém { params } com os parâmetros da rota
 * - No Next.js 15, params é uma Promise, então precisamos usar await
 */
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { categorias } from '@/db/schema';

import { eq } from 'drizzle-orm';

/**
 * Tipo dos parâmetros da rota
 *
 * No Next.js 15+, os params são assíncronos (Promise).
 * Isso permite que o Next.js otimize o carregamento dos parâmetros.
 */
type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/categorias/[id]
 *
 * Busca uma categoria específica pelo ID.
 * Útil para: preencher formulário de edição, validações, etc.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Aguarda os parâmetros (Next.js 15+ requirement)
    const { id } = await params;

    // Converte o ID para número (o schema usa serial/integer)
    const numericId = Number(id);

    // Valida se o ID é um número válido
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Busca a categoria usando o operador eq (equals) do Drizzle
    // .where() filtra os resultados
    const [category] = await db
      .select()
      .from(categorias)
      .where(eq(categorias.id, numericId));

    // Se não encontrou, retorna 404
    if (!category) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categoria' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/categorias/[id]
 *
 * Atualiza uma categoria existente.
 *
 * Por que PUT e não PATCH?
 * ------------------------
 * - PUT: substitui o recurso inteiro (todas as propriedades)
 * - PATCH: atualiza parcialmente (apenas propriedades enviadas)
 *
 * Para simplificar, usamos PUT aqui. Em APIs maiores, considere usar PATCH
 * para atualizações parciais.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Validação do nome
    if (
      !body.name ||
      typeof body.name !== 'string' ||
      body.name.trim() === ''
    ) {
      return NextResponse.json(
        { error: 'O nome da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Atualiza a categoria
    // .set() define os novos valores
    // .returning() retorna o registro atualizado
    const [updatedCategory] = await db
      .update(categorias)
      .set({ name: body.name.trim() })
      .where(eq(categorias.id, numericId))
      .returning();

    // Se não retornou nada, a categoria não existe
    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categorias/[id]
 *
 * Remove uma categoria do banco de dados.
 *
 * Considerações de Segurança:
 * ---------------------------
 * Em produção, você pode querer:
 * 1. Verificar se há produtos usando esta categoria antes de deletar
 * 2. Fazer "soft delete" (marcar como inativo) ao invés de deletar
 * 3. Verificar permissões do usuário
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Primeiro, verifica se a categoria existe
    const [existing] = await db
      .select()
      .from(categorias)
      .where(eq(categorias.id, numericId));

    if (!existing) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Deleta a categoria
    await db.delete(categorias).where(eq(categorias.id, numericId));

    // Retorna sucesso (204 No Content é comum para DELETE)
    // Mas retornamos 200 com mensagem para facilitar debug
    return NextResponse.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar categoria' },
      { status: 500 }
    );
  }
}
