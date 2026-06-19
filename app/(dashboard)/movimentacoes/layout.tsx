import type { ReactNode } from 'react';

import { requirePagePermission } from '@/lib/server/access-control';

export default async function MovimentacoesLayout({
  children
}: {
  children: ReactNode;
}) {
  await requirePagePermission('view_movimentacoes');

  return children;
}
