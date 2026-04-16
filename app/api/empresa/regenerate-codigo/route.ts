import { NextResponse } from 'next/server';

import { db } from '@/db';
import { empresa, EMPRESA_SINGLETON_ID } from '@/db/schema';
import { requireRoutePermission } from '@/lib/server/access-control';

import { eq } from 'drizzle-orm';

function gerarCodigo(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * POST /api/empresa/regenerate-codigo
 *
 * Gera um novo código de verificação de 4 dígitos para a empresa.
 * Útil quando um funcionário desligado conhece o código antigo.
 * Protegido por `manage_empresa`.
 */
export async function POST(request: Request) {
  const permissionCheck = await requireRoutePermission(
    request,
    'manage_empresa'
  );

  if (permissionCheck instanceof Response) {
    return permissionCheck;
  }

  try {
    const [updated] = await db
      .update(empresa)
      .set({
        codigoVerificacao: gerarCodigo(),
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
    console.error('Erro ao regenerar código da empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao regenerar código' },
      { status: 500 }
    );
  }
}
