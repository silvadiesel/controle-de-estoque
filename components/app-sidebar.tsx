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
        id: 'produtos',
        label: 'Produtos',
        icon: Package,
        href: '/produtos'
      },
      {
        id: 'movimentacoes',
        label: 'Movimentações',
        icon: ArrowUpDown,
        href: '/movimentacoes'
      }
    ]
  },
  {
    title: 'Gestão',
    items: [
      {
        id: 'ordens',
        label: 'Ordens',
        icon: ClipboardList,
        href: '/ordens'
      },
      {
        id: 'clientes',
        label: 'Clientes',
        icon: Users,
        href: '/clientes'
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
        label: 'Configurações',
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
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
            <Truck className='h-6 w-6 text-primary-foreground' />
          </div>
          <div>
            <h1 className='text-lg font-bold text-foreground'>Igne System</h1>
            <p className='text-xs text-muted-foreground'>Tudo em um só lugar</p>
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
                        className={`h-9 ${isActive ? 'bg-primary! text-white!' : ''}`}
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
