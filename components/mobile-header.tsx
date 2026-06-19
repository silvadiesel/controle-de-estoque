'use client';

import { useState } from 'react';

import Image from 'next/image';

import { MobileSidebar } from '@/components/mobile-sidebar';

import { Menu } from 'lucide-react';

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className='sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 md:hidden'>
        <div className='flex items-center gap-2'>
          <Image
            src='/img/main_icon.svg'
            alt='Logo do Controle Peças'
            width={32}
            height={32}
            className='size-8 object-contain'
            priority
          />
          <span className='text-sm font-semibold text-sidebar-foreground'></span>
        </div>
        <button
          type='button'
          onClick={() => setOpen(true)}
          aria-label='Abrir menu'
          className='rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground'>
          <Menu className='size-5' />
        </button>
      </header>
      <MobileSidebar open={open} onOpenChange={setOpen} />
    </>
  );
}
