import type { ReactNode } from 'react';

import { requirePagePermission } from '@/lib/server/access-control';

export default async function AlertasLayout({
  children
}: {
  children: ReactNode;
}) {
  await requirePagePermission('view_alertas');

  return children;
}
