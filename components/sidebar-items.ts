import {
  AlertTriangle,
  ArrowUpDown,
  ClipboardList,
  Factory,
  HardHat,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  type LucideIcon
} from 'lucide-react';

import type { AppPermission } from '@/lib/permissions';

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  permission: AppPermission;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export const sidebarSections: SidebarSection[] = [
  {
    title: 'Principal',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        permission: 'view_dashboard'
      },
      {
        id: 'produtos',
        label: 'Peças',
        icon: Package,
        href: '/pecas',
        permission: 'view_produtos'
      },
      {
        id: 'mao-obra',
        label: 'Mão de Obra',
        icon: HardHat,
        href: '/mao-obra',
        permission: 'view_mao_obra'
      },
      {
        id: 'clientes',
        label: 'Clientes',
        icon: Users,
        href: '/clientes',
        permission: 'view_clientes'
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
        href: '/ordens',
        permission: 'view_ordens'
      },
      {
        id: 'movimentacoes',
        label: 'Movimentacoes',
        icon: ArrowUpDown,
        href: '/movimentacoes',
        permission: 'view_movimentacoes'
      },
      {
        id: 'fornecedores',
        label: 'Fornecedores',
        icon: Factory,
        href: '/fornecedores',
        permission: 'view_fornecedores_page'
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
        href: '/alertas',
        permission: 'view_alertas'
      },
      {
        id: 'configuracoes',
        label: 'Configuracoes',
        icon: Settings,
        href: '/configuracoes',
        permission: 'change_password'
      }
    ]
  }
];
