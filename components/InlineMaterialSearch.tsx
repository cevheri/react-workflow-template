"use client";

import { useMemo, useState } from 'react';
import { Material } from '@/lib/types';
import { useMaterialStore } from '@/store/materialStore';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface InlineMaterialSearchProps {
  onPick: (material: Material) => void;
  placeholder?: string;
  align?: 'start' | 'center' | 'end';
  className?: string;
  children?: React.ReactNode;
}

export function InlineMaterialSearch({ onPick, placeholder, align = 'start', className, children }: InlineMaterialSearchProps) {
  const { materials } = useMaterialStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const source = materials || [];
    if (!q) return source.slice(0, 50);
    return source
      .filter((m) =>
        m.name.toLowerCase().includes(q) || (m.code ? m.code.toLowerCase().includes(q) : false)
      )
      .slice(0, 50);
  }, [materials, search]);

  const defaultTrigger = (
    <Button type="button" variant="outline" role="combobox" aria-expanded={open} className={cn('w-[260px] justify-between', className)}>
      {placeholder || 'Search material...'}
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ? children : defaultTrigger}
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[420px]" align={align}>
        <Command>
          <CommandInput
            placeholder="Type name or code..."
            value={search}
            onValueChange={setSearch}
            autoFocus
          />
          <CommandEmpty>No material found.</CommandEmpty>
          <CommandList>
            {filtered.map((m) => (
              <CommandItem
                key={m.id}
                value={m.id}
                onSelect={() => {
                  onPick(m);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{m.code}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.category} / {m.subcategory} • {m.unit}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


