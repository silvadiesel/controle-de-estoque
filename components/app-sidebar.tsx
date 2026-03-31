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
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-sidebar-border bg-elevated text-primary">
            <Truck className="size-4" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-sidebar-foreground">
              Igne System
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Controle tecnico do estoque
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
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
                        className="h-9 text-muted-foreground"
                        tooltip={item.label}
                      >
                        <a href={item.href}>
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                          {item.id === 'alertas' && totalAlertas > 0 && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-[10px] bg-primary px-1 text-xs font-semibold text-primary-foreground">
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

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="size-[30px]">
            <AvatarFallback className="bg-secondary text-text-tertiary text-xs font-bold">
              {session?.user?.name ? getInitials(session.user.name) : '??'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {session?.user?.name || 'Usuario'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {session?.user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground transition-colors hover:text-text-tertiary"
            title="Sair do sistema"
            type="button"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
