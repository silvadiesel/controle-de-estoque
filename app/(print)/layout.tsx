import { redirect } from 'next/navigation';

import { getServerSession } from '@/lib/server/access-control';

export default async function PrintLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e5e5e5' }}>
      {children}
    </div>
  );
}
