'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  className,
  disabled
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal bg-input border-border',
            !value && 'text-muted-foreground',
            className
          )}>
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value ? format(value, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0 bg-card border-border'
        align='start'>
        <Calendar
          mode='single'
          selected={value}
          onSelect={onChange}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
