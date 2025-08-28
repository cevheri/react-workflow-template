"use client";

import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RequestItem, UnitType, Material } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Search } from 'lucide-react';
import { MaterialSelector } from '@/components/MaterialSelector';
import { InlineMaterialSearch } from '@/components/InlineMaterialSearch';

interface ItemsTableProps {
  items: RequestItem[];
  onChange: (items: RequestItem[]) => void;
  readOnly?: boolean;
}

const UNITS: UnitType[] = ['Piece', 'Kg', 'Liter', 'Package'];

export function ItemsTable({ items, onChange, readOnly }: ItemsTableProps) {
  const [isSelectorOpen, setSelectorOpen] = useState(false);
  const [selectorTargetId, setSelectorTargetId] = useState<string | null>(null);

  const totalRows = useMemo(() => items.length, [items]);

  const addRow = () => {
    const next: RequestItem = {
      id: uuidv4(),
      name: '',
      quantity: 1,
      unit: 'Piece'
    };
    onChange([...items, next]);
  };

  const removeRow = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((x) => x.id !== id));
  };

  const updateRow = (id: string, patch: Partial<RequestItem>) => {
    onChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const openMaterialSelector = (id: string) => {
    setSelectorTargetId(id);
    setSelectorOpen(true);
  };

  const handlePickMaterial = (m: Material) => {
    if (!selectorTargetId) return;
    updateRow(selectorTargetId, {
      materialId: m.id,
      name: m.name,
      unit: m.unit,
      category: m.category,
      subcategory: m.subcategory,
      code: m.code
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base">Items</Label>
        {!readOnly && (
          <Button type="button" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4 mr-2" /> Add Row
          </Button>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Quick add by name/code</div>
          <InlineMaterialSearch
            placeholder="Quick search material..."
            onPick={(m) => {
              const next = {
                id: uuidv4(),
                name: m.name,
                quantity: 1,
                unit: m.unit,
                materialId: m.id,
                category: m.category,
                subcategory: m.subcategory,
                code: m.code
              } as RequestItem;
              onChange([...items, next]);
            }}
          />
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left p-2 w-[160px]">Code</th>
                <th className="text-left p-2 min-w-[240px]">Name</th>
                <th className="text-left p-2 w-[140px]">Category</th>
                <th className="text-left p-2 w-[160px]">Subcategory</th>
                <th className="text-left p-2 w-[110px]">Quantity</th>
                <th className="text-left p-2 w-[120px]">Unit</th>
                {!readOnly && <th className="p-2 w-[44px]" />}
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={row.code || ''}
                        onChange={(e) => updateRow(row.id, { code: e.target.value })}
                        placeholder="Code"
                        disabled
                      />
                      {!readOnly && (
                        <Button type="button" size="icon" variant="outline" onClick={() => openMaterialSelector(row.id)}>
                          <Search className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    {readOnly ? (
                      <Input value={row.name} disabled placeholder="Material name" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          value={row.name}
                          onChange={(e) => updateRow(row.id, { name: e.target.value })}
                          placeholder="Material name"
                        />
                        <InlineMaterialSearch
                          align="end"
                          onPick={(m) =>
                            updateRow(row.id, {
                              materialId: m.id,
                              name: m.name,
                              unit: m.unit,
                              category: m.category,
                              subcategory: m.subcategory,
                              code: m.code
                            })
                          }
                        >
                          <Button type="button" size="icon" variant="outline">
                            <Search className="h-4 w-4" />
                          </Button>
                        </InlineMaterialSearch>
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    <Input value={row.category || ''} disabled placeholder="Category" />
                  </td>
                  <td className="p-2">
                    <Input value={row.subcategory || ''} disabled placeholder="Subcategory" />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, { quantity: parseInt(e.target.value) || 1 })}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={row.unit}
                      onValueChange={(v) => updateRow(row.id, { unit: v as UnitType })}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  {!readOnly && (
                    <td className="p-2">
                      <Button type="button" size="icon" variant="outline" onClick={() => removeRow(row.id)} disabled={items.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MaterialSelector
        open={isSelectorOpen}
        onOpenChange={setSelectorOpen}
        onPick={handlePickMaterial}
      />
    </div>
  );
}


