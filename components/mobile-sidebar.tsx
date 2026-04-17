'use client';

import { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { sidebarSections } from '@/components/sidebar-items';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAlertaCount } from '@/hooks/useAlertaCount';
import { useUser } from '@/hooks/useUser';
import { signOut } from '@/lib/auth-client';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { LogOut, X } from 'lucide-react';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type MobileSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalAlertas } = useAlertaCount();
  const { hasPermission, user, isPending } = useUser();

  // Fecha ao navegar: sem isso o menu fica aberto por cima da página nova.
  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  const visibleGroups = isPending
    ? sidebarSections
    : sidebarSections
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => hasPermission(item.permission))
        }))
        .filter((group) => group.items.length > 0);

  const handleLogout = async () => {
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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-sidebar data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-200' />
        <DialogPrimitive.Content className='fixed inset-0 z-50 flex flex-col bg-sidebar data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:duration-200 md:hidden'>
          <DialogPrimitive.Title className='sr-only'>
            Menu de navegação
          </DialogPrimitive.Title>

          <div className='flex items-center justify-between border-b border-sidebar-border px-4 py-4'>
            <div className='flex items-center gap-3'>
              <div className='flex size-9 items-center justify-center'>
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
            <DialogPrimitive.Close
              aria-label='Fechar menu'
              className='rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground'>
              <X className='size-5' />
            </DialogPrimitive.Close>
          </div>

          <nav
            className={`flex-1 overflow-y-auto px-2 py-4 ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
            {visibleGroups.map((group) => (
              <div key={group.title} className='mb-4'>
                <p className='px-3 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
                  {group.title}
                </p>
                <ul className='flex flex-col gap-1'>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                          }`}>
                          <Icon className='size-4' />
                          <span>{item.label}</span>
                          {item.id === 'alertas' && totalAlertas > 0 && (
                            <span className='ml-auto flex h-5 min-w-5 items-center justify-center rounded-[10px] bg-primary px-1 text-xs font-semibold text-primary-foreground'>
                              {totalAlertas > 99 ? '99+' : totalAlertas}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className='border-t border-sidebar-border p-4'>
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
                className='text-muted-foreground transition-colors hover:text-text-tertiary'
                title='Sair do sistema'
                type='button'>
                <LogOut className='size-4' />
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
