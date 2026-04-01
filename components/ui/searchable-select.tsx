'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Check, ChevronsUpDown } from 'lucide-react';

export interface SearchableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  'aria-describedby'?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhum resultado encontrado',
  disabled = false,
  hasError = false,
  className,
  'aria-describedby': ariaDescribedby
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-describedby={ariaDescribedby}
          disabled={disabled}
          variant="outline"
          className={cn(
            'h-10 w-full justify-between font-normal bg-input border-border text-left hover:bg-input hover:border-border-hover',
            !selectedOption && 'text-muted-foreground',
            hasError && 'border-destructive',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <span className="truncate">
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onWheel={(e) => e.stopPropagation()}
        className="w-[--radix-popover-trigger-width] p-0 bg-card border-border"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder={searchPlaceholder}
            className="border-b border-border"
          />
          <CommandList
            className={cn(
              '[scrollbar-width:thin] [scrollbar-color:var(--border-hover)_transparent]',
              '[&::-webkit-scrollbar]:w-1.5',
              '[&::-webkit-scrollbar-thumb]:rounded-full',
              '[&::-webkit-scrollbar-thumb]:bg-border-hover',
              '[&::-webkit-scrollbar-track]:bg-transparent'
            )}
          >
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label}${option.sublabel ? ' ' + option.sublabel : ''}`}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className="data-[selected=true]:bg-border"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 shrink-0',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.sublabel && (
                    <span className="ml-2 text-xs text-muted-foreground shrink-0">
                      {option.sublabel}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
