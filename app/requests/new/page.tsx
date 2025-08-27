import { RequestForm } from '@/components/RequestForm';

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Request</h1>
        <p className="text-muted-foreground">Fill out the form below to create a new purchase request.</p>
      </div>
      
      <RequestForm mode="create" />
    </div>
  );
}