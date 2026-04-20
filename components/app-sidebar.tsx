'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import { sidebarSections } from '@/components/sidebar-items';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { useAlertaCountCtx } from '@/hooks/useAlertaContext';
import { useUser } from '@/hooks/useUser';
import { signOut } from '@/lib/auth-client';

import { LogOut } from 'lucide-react';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalAlertas } = useAlertaCountCtx();
  const { hasPermission, user, isPending } = useUser();

  const visibleGroups = isPending
    ? sidebarSections
    : sidebarSections
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => hasPermission(item.permission))
        }))
        .filter((group) => group.items.length > 0);

  const handleLogout = async () => {
    // Garante que o usuário vá para /login mesmo se a request de signOut falhar
    // (rede intermitente, servidor indisponível, etc). A intenção de sair é soberana.
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/login');
            router.refresh();
          }
        }
      });
    } catch {
      window.location.href = '/login';
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className='border-b border-sidebar-border bg-sidebar px-4 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex size-9 items-center justify-center '>
            <Image
              src='/img/main_icon.svg'
              alt='Logo do Core Controler'
              width={40}
              height={40}
              className='h-full w-full object-contain'
              priority
            />
          </div>
          <div className='min-w-0'>
            <h1 className='truncate text-sm font-semibold text-sidebar-foreground'>
              Core Controler
            </h1>
            <p className='truncate text-xs text-muted-foreground'>
              Gestão tecnica de estoque
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent
        className={isPending ? 'pointer-events-none opacity-50' : undefined}>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className='h-9 text-muted-foreground data-[active=true]:bg-primary data-[active=true]:text-primary'
                        tooltip={item.label}>
                        <a href={item.href}>
                          <Icon className='size-4' />
                          <span>{item.label}</span>
                          {item.id === 'alertas' && totalAlertas > 0 && (
                            <span className='ml-auto flex h-5 min-w-5 items-center justify-center rounded-[10px] bg-primary px-1 text-xs font-semibold text-primary-foreground'>
                              {totalAlertas > 99 ? '99+' : totalAlertas}
                            </span>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className='p-4'>
        <div className='flex items-center gap-3 px-3 py-2'>
          <Avatar className='size-[30px]'>
            <AvatarFallback className='bg-secondary text-text-tertiary text-xs font-bold'>
              {user?.name ? getInitials(user.name) : '??'}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-foreground'>
              {user?.name || 'Usuario'}
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              {user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className='text-muted-foreground transition-colors hover:text-text-tertiary hover:cursor-pointer'
            title='Sair do sistema'
            type='button'>
            <LogOut className='size-4' />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
