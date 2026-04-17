import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AlertToast } from '@/components/alert-toast';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileHeader } from '@/components/mobile-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getServerSession } from '@/lib/server/access-control';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Valida a sessão contra o banco (não apenas a existência do cookie).
  // Um cookie persistente com sessão expirada/revogada precisa cair para /login.
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  // Ler estado da sidebar dos cookies
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get('sidebar_state');
  const defaultOpen = sidebarState?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className='hidden md:contents'>
        <AppSidebar />
      </div>
      <SidebarInset>
        <AlertToast />
        <MobileHeader />
        <main id='main-content'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
