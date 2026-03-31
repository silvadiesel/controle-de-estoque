'use client';

import { usePathname, useRouter } from 'next/navigation';

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
import { useAlertaCount } from '@/hooks/useAlertaCount';
import { signOut, useSession } from '@/lib/auth-client';

import {
  AlertTriangle,
  ArrowUpDown,
  ClipboardList,
  Factory,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Truck,
  Users
} from 'lucide-react';

const menuItems = [
  {
    title: 'Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard'
      },
      {
        id: 'produtos',
        label: 'Produtos',
        icon: Package,
        href: '/produtos'
      },
      {
        id: 'clientes',
        label: 'Clientes',
        icon: Users,
        href: '/clientes'
      }
    ]
  },
  {
    title: 'Gestao',
    items: [
      {
        id: 'ordens',
        label: 'Ordens',
        icon: ClipboardList,
        href: '/ordens'
      },
      {
        id: 'movimentacoes',
        label: 'Movimentacoes',
        icon: ArrowUpDown,
        href: '/movimentacoes'
      },
      {
        id: 'fornecedores',
        label: 'Fornecedores',
        icon: Factory,
        href: '/fornecedores'
      }
    ]
  },
  {
    title: 'Sistema',
    items: [
      {
        id: 'alertas',
        label: 'Alertas',
        icon: AlertTriangle,
        href: '/alertas'
      },
      {
        id: 'configuracoes',
        label: 'Configuracoes',
        icon: Settings,
        href: '/configuracoes'
      }
    ]
  }
];

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
  const { data: session } = useSession();
  const { totalAlertas } = useAlertaCount();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Sidebar>
      {/* Header com Logo */}
      <SidebarHeader className='border-b border-border px-4 py-4 bg-background'>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#5b7fa5] to-[#4a6b8a]'>
            <Truck className='h-5 w-5 text-white' />
          </div>
          <div>
            <h1 className='text-[15px] font-semibold text-[#e4e4e7]'>
              Igne System
            </h1>
            <p className='text-[11px] text-[#52525b]'>Tudo em um so lugar</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Menu de Navegacao */}
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className='text-[10px] uppercase tracking-[1.2px] text-[#52525b] font-semibold'>
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
                        className={`h-9 ${
                          isActive
                            ? 'bg-[#18181b] text-[#e4e4e7] [&>svg]:text-[#94a8c2]'
                            : 'text-[#52525b] [&>svg]:text-[#52525b] hover:bg-[#18181b]/50'
                        }`}
                        tooltip={item.label}>
                        <a href={item.href}>
                          <Icon className='h-4 w-4' />
                          <span>{item.label}</span>
                          {item.id === 'alertas' && totalAlertas > 0 && (
                            <span className='ml-auto flex h-5 min-w-5 items-center justify-center rounded-[10px] bg-[#5b7fa5] px-1 text-[10px] font-bold text-[#09090B]'>
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

      {/* Footer com usuario */}
      <SidebarFooter className='p-4'>
        <div className='flex items-center gap-3 px-3 py-2'>
          <Avatar className='h-[30px] w-[30px]'>
            <AvatarFallback className='bg-[#27272a] text-[#a1a1aa] text-xs font-bold'>
              {session?.user?.name ? getInitials(session.user.name) : '??'}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-[13px] font-medium text-[#e4e4e7] truncate'>
              {session?.user?.name || 'Usuario'}
            </p>
            <p className='text-[11px] text-[#52525b] truncate'>
              {session?.user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className='text-[#52525b] hover:text-[#a1a1aa] transition-colors'
            title='Sair do sistema'>
            <LogOut className='h-4 w-4' />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
