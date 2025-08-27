'use client';

import { Button } from '@/components/ui/button';
import { RequestTable } from '@/components/RequestTable';
import { useRequestStore } from '@/store/requestStore';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function RequestsPage() {
  const requests = useRequestStore((state) => state.requests);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Purchase Requests</h1>
        <Link href="/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Request
          </Button>
        </Link>
      </div>
      
      <RequestTable requests={requests} />
    </div>
  );
}