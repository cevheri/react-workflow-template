'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { PurchaseRequest, RequestItem, UnitType } from '@/lib/types';
import { useRequestStore } from '@/store/requestStore';
import { v4 as uuidv4 } from 'uuid';

interface RequestFormProps {
  request?: PurchaseRequest;
  mode: 'create' | 'edit' | 'view';
}

const units: UnitType[] = ['Piece', 'Kg', 'Liter', 'Package'];

export function RequestForm({ request, mode }: RequestFormProps) {
  const router = useRouter();
  const { addRequest, updateRequest } = useRequestStore();
  
  const [title, setTitle] = useState(request?.title || '');
  const [requester, setRequester] = useState(request?.requester || '');
  const [department, setDepartment] = useState(request?.department || '');
  const [items, setItems] = useState<RequestItem[]>(
    request?.items || [{
      id: uuidv4(),
      name: '',
      quantity: 1,
      unit: 'Piece'
    }]
  );

  const isReadOnly = mode === 'view';

  const addItem = () => {
    setItems([...items, {
      id: uuidv4(),
      name: '',
      quantity: 1,
      unit: 'Piece'
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof RequestItem, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !requester.trim() || !department.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const validItems = items.filter(item => item.name.trim());
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    if (mode === 'create') {
      addRequest({
        title: title.trim(),
        requester: requester.trim(),
        department: department.trim(),
        items: validItems
      });
    } else if (mode === 'edit' && request) {
      updateRequest(request.id, {
        title: title.trim(),
        requester: requester.trim(),
        department: department.trim(),
        items: validItems
      });
    }

    router.push('/requests');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter request title"
                disabled={isReadOnly}
                required
              />
            </div>
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={department} onValueChange={setDepartment} disabled={isReadOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="requester">Requester *</Label>
            <Input
              id="requester"
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              placeholder="Enter requester name"
              disabled={isReadOnly}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Items</CardTitle>
          {!isReadOnly && (
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label htmlFor={`item-name-${item.id}`}>Item Name</Label>
                    <Input
                      id={`item-name-${item.id}`}
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Enter item name"
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-quantity-${item.id}`}>Quantity</Label>
                    <Input
                      id={`item-quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-unit-${item.id}`}>Unit</Label>
                    <div className="flex gap-2">
                      <Select
                        value={item.unit}
                        onValueChange={(value) => updateItem(item.id, 'unit', value as UnitType)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!isReadOnly && items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {index < items.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!isReadOnly && (
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/requests')}
          >
            Cancel
          </Button>
          <Button type="submit">
            {mode === 'create' ? 'Create Request' : 'Update Request'}
          </Button>
        </div>
      )}
    </form>
  );
}