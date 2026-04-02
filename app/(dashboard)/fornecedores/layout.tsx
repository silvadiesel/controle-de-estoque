import type { ReactNode } from 'react';

import { requirePagePermission } from '@/lib/server/access-control';

export default async function FornecedoresLayout({
  children
}: {
  children: ReactNode;
}) {
  await requirePagePermission('view_fornecedores_page');

  return children;
}
