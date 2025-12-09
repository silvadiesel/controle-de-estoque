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
        id: 'products',
        label: 'Produtos',
        icon: Package,
        href: '/dashboard/produtos'
      },
      {
        id: 'movements',
        label: 'Movimentações',
        icon: ArrowUpDown,
        href: '/dashboard/movimentacoes'
      }
    ]
  },
  {
    title: 'Gestão',
    items: [
      {
        id: 'orders',
        label: 'Ordens',
        icon: ClipboardList,
        href: '/dashboard/ordens'
      },
      {
        id: 'clients',
        label: 'Clientes',
        icon: Users,
        href: '/dashboard/clientes'
      },
      {
        id: 'suppliers',
        label: 'Fornecedores',
        icon: Factory,
        href: '/dashboard/fornecedores'
      }
    ]
  },
  {
    title: 'Sistema',
    items: [
      {
        id: 'alerts',
        label: 'Alertas',
        icon: AlertTriangle,
        href: '/dashboard/alertas'
      },
      {
        id: 'settings',
        label: 'Configurações',
        icon: Settings,
        href: '/dashboard/configuracoes'
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

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Sidebar>
      {/* Header com Logo */}
      <SidebarHeader className='border-b border-border px-4 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
            <Truck className='h-6 w-6 text-primary-foreground' />
          </div>
          <div>
            <h1 className='text-lg font-bold text-foreground'>StockTruck</h1>
            <p className='text-xs text-muted-foreground'>
              Oficina de Caminhões
            </p>
          </div>
        </div>
      </SidebarHeader>

      {/* Menu de Navegação */}
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
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
                        tooltip={item.label}>
                        <a href={item.href}>
                          <Icon className='h-4 w-4' />
                          <span>{item.label}</span>
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

      {/* Footer com usuário */}
      <SidebarFooter className='p-4'>
        <div className='flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='bg-primary/20 text-primary text-xs font-bold'>
              {session?.user?.name ? getInitials(session.user.name) : '??'}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-foreground truncate'>
              {session?.user?.name || 'Usuário'}
            </p>
            <p className='text-xs text-muted-foreground truncate'>
              {session?.user?.email || ''}
            </p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive'>
              <LogOut className='h-4 w-4' />
              <span>Sair do sistema</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
