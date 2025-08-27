"use client";

import { useMemo, useState } from 'react';
import { useMaterialStore } from '@/store/materialStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Material } from '@/lib/types';

interface MaterialSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (material: Material) => void;
}

export function MaterialSelector({ open, onOpenChange, onPick }: MaterialSelectorProps) {
  const { categories, subcategoriesByCategory, filter, setFilter, resetFilter, getFiltered } = useMaterialStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const materials = useMemo(() => getFiltered(), [filter, getFiltered]);

  const subcategories = filter.category ? subcategoriesByCategory[filter.category] || [] : [];

  const confirmPick = () => {
    if (!selectedId) return;
    const material = materials.find((m) => m.id === selectedId);
    if (material) {
      onPick(material);
      onOpenChange(false);
      setSelectedId(null);
    }
  };

  const close = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Material</DialogTitle>
          <DialogDescription>Filter by category, subcategory or name/code and pick one.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Category</Label>
            <Select
              value={filter.category}
              onValueChange={(val) => {
                if (val === '__ALL__') {
                  setFilter({ category: undefined, subcategory: undefined });
                } else {
                  setFilter({ category: val, subcategory: undefined });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subcategory</Label>
            <Select
              value={filter.subcategory}
              onValueChange={(val) => {
                if (val === '__ALL__') {
                  setFilter({ subcategory: undefined });
                } else {
                  setFilter({ subcategory: val });
                }
              }}
              disabled={!filter.category}
            >
              <SelectTrigger>
                <SelectValue placeholder={!filter.category ? 'Select category first' : 'All'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All</SelectItem>
                {subcategories.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Search</Label>
            <Input
              placeholder="Search by name or code"
              value={filter.query || ''}
              onChange={(e) => setFilter({ query: e.target.value })}
            />
          </div>
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Subcategory</th>
                  <th className="text-left p-2">Unit</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr
                    key={m.id}
                    className={`cursor-pointer hover:bg-muted ${selectedId === m.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedId(m.id)}
                  >
                    <td className="p-2 whitespace-nowrap">{m.code}</td>
                    <td className="p-2">{m.name}</td>
                    <td className="p-2 whitespace-nowrap">{m.category}</td>
                    <td className="p-2 whitespace-nowrap">{m.subcategory}</td>
                    <td className="p-2 whitespace-nowrap">{m.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => { resetFilter(); setSelectedId(null); }}>
            Clear Filters
          </Button>
          <div className="flex-1" />
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button type="button" onClick={confirmPick} disabled={!selectedId}>Select</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


