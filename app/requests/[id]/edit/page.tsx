'use client';

import { useParams } from 'next/navigation';
import { RequestForm } from '@/components/RequestForm';
import { useRequestStore } from '@/store/requestStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditRequestPage() {
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

  if (request.status !== 'Draft') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Cannot Edit Request</h1>
        <p className="text-muted-foreground mt-2">
          Only requests in Draft status can be edited. This request is currently {request.status}.
        </p>
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
      <div>
        <h1 className="text-3xl font-bold">Edit Request</h1>
        <p className="text-muted-foreground">Update the request details below.</p>
      </div>
      
      <RequestForm request={request} mode="edit" />
    </div>
  );
}