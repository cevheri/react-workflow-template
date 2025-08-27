'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash, GitBranch } from 'lucide-react';
import { PurchaseRequest } from '@/lib/types';
import { useRequestStore } from '@/store/requestStore';
import { WorkflowModal } from './workflow/WorkflowModal';
import { format } from 'date-fns';
import Link from 'next/link';

interface RequestTableProps {
  requests: PurchaseRequest[];
}

const statusColors = {
  'Draft': 'bg-blue-100 text-blue-800',
  'Pending Approval': 'bg-orange-100 text-orange-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800'
};

export function RequestTable({ requests }: RequestTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const { deleteRequest } = useRequestStore();

  const handleWorkflowOpen = (request: PurchaseRequest) => {
    setSelectedRequest(request);
    setWorkflowModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      deleteRequest(id);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono text-sm">
                  {request.id.slice(0, 8)}...
                </TableCell>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>{request.requester}</TableCell>
                <TableCell>{request.department}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[request.status]} border-0`}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(request.createdAt, 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleWorkflowOpen(request)}>
                        <GitBranch className="mr-2 h-4 w-4" />
                        Open Workflow
                      </DropdownMenuItem>
                      <Link href={`/requests/${request.id}/view`}>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/requests/${request.id}/edit`}>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(request.id)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedRequest && (
        <WorkflowModal
          request={selectedRequest}
          open={workflowModalOpen}
          onOpenChange={setWorkflowModalOpen}
        />
      )}
    </>
  );
}