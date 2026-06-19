import type { ReactNode } from 'react';

import { requirePagePermission } from '@/lib/server/access-control';

export default async function ClientesLayout({
  children
}: {
  children: ReactNode;
}) {
  await requirePagePermission('view_clientes');

  return children;
}
