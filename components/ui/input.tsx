import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'border-input bg-input/60 text-foreground placeholder:text-muted-foreground h-10 w-full rounded-md border px-3 text-sm transition-[border-color,background-color,box-shadow] outline-none',
        'focus-visible:border-border-hover focus-visible:bg-card focus-visible:shadow-[inset_0_0_0_1px_var(--border-hover)]',
        className
      )}
      {...props}
    />
  );
}

export { Input };
