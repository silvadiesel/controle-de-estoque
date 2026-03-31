import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'file:text-foreground text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input bg-input/60 h-10 w-full min-w-0 rounded-md border px-3 text-base shadow-xs transition-[color,box-shadow,border-color,background-color] outline-none md:text-sm file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-border-hover focus-visible:bg-card focus-visible:shadow-[inset_0_0_0_1px_var(--border-hover)]',
        'aria-invalid:border-destructive aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)]',
        className
      )}
      {...props}
    />
  );
}

export { Input };
