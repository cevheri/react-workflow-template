'use client';

import { useParams } from 'next/navigation';
import { RequestForm } from '@/components/RequestForm';
import { useRequestStore } from '@/store/requestStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const statusColors = {
  'Draft': 'bg-blue-100 text-blue-800',
  'Pending Approval': 'bg-orange-100 text-orange-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800'
};

export default function ViewRequestPage() {
  const params = useParams();
  const id = params.id as string;
  const request = useRequestStore((state) => state.getRequestById(id));

  if (!request) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Request Not Found</h1>
        <p className="text-muted-foreground mt-2">The requested purchase request could not be found.</p>
        <Link href="/requests">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">{request.title}</h1>
            <Badge className={`${statusColors[request.status]} border-0`}>
              {request.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">View request details</p>
        </div>
        <Link href="/requests">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>
        </Link>
      </div>
      
      <RequestForm request={request} mode="view" />
    </div>
  );
}