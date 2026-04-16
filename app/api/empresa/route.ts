import { NextResponse } from 'next/server';

import { db } from '@/db';
import { empresa, EMPRESA_SINGLETON_ID } from '@/db/schema';
import { requireRoutePermission } from '@/lib/server/access-control';

import { eq } from 'drizzle-orm';

/**
 * GET /api/empresa
 *
 * Retorna os dados cadastrais da empresa dona desta instância (singleton).
 * Protegido por `view_configuracoes` — apenas admin acessa.
 */
export async function GET(request: Request) {
  const permissionCheck = await requireRoutePermission(
    request,
    'view_configuracoes'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  try {
    const [row] = await db
      .select()
      .from(empresa)
      .where(eq(empresa.id, EMPRESA_SINGLETON_ID));

    if (!row) {
      return NextResponse.json(
        { error: 'Empresa não cadastrada. Rode o seed.' },
        { status: 404 }
      );
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar empresa' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/empresa
 *
 * Atualiza os dados cadastrais da empresa. Protegido por `manage_empresa`.
 * Campos aceitos: nomeFantasia, cnpj, cidade, estado, codigoVerificacao.
 */
export async function PUT(request: Request) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_empresa'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  try {
    const body = await request.json();

    const nomeFantasia =
      typeof body.nomeFantasia === 'string' ? body.nomeFantasia.trim() : '';
    const cnpj = typeof body.cnpj === 'string' ? body.cnpj.trim() : '';
    const cidade = typeof body.cidade === 'string' ? body.cidade.trim() : '';
    const estado =
      typeof body.estado === 'string'
        ? body.estado.trim().toUpperCase().slice(0, 2)
        : '';
    const codigoVerificacao =
      typeof body.codigoVerificacao === 'string'
        ? body.codigoVerificacao.trim()
        : '';

    if (!nomeFantasia || !cnpj || !cidade || !estado || !codigoVerificacao) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (estado.length !== 2) {
      return NextResponse.json(
        { error: 'Estado deve ter 2 caracteres (UF)' },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(codigoVerificacao)) {
      return NextResponse.json(
        { error: 'Código de verificação deve ter 4 dígitos numéricos' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(empresa)
      .set({
        nomeFantasia,
        cnpj,
        cidade,
        estado,
        codigoVerificacao,
        updatedAt: new Date()
      })
      .where(eq(empresa.id, EMPRESA_SINGLETON_ID))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Empresa não cadastrada. Rode o seed.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar empresa' },
      { status: 500 }
    );
  }
}
