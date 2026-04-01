import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AlertToast } from '@/components/alert-toast';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Verificação adicional no servidor
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('better-auth.session_token');

  if (!sessionCookie) {
    redirect('/login');
  }

  // Ler estado da sidebar dos cookies
  const sidebarState = cookieStore.get('sidebar_state');
  const defaultOpen = sidebarState?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <AlertToast />
        <main id='main-content'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
