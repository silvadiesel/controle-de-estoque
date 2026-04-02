import type { ReactNode } from 'react';

import { requirePagePermission } from '@/lib/server/access-control';

export default async function ConfiguracoesLayout({
  children
}: {
  children: ReactNode;
}) {
  await requirePagePermission('view_configuracoes');

  return children;
}
