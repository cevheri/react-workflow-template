'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PurchaseRequest, getValidTransitions, RequestStatus } from '@/lib/types';
import { useRequestStore } from '@/store/requestStore';
import { FileText, MessageSquare, Paperclip, Package, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface WorkflowModalProps {
  request: PurchaseRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors = {
  'Draft': 'bg-blue-100 text-blue-800',
  'Pending Approval': 'bg-orange-100 text-orange-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800'
};

export function WorkflowModal({ request, open, onOpenChange }: WorkflowModalProps) {
  const [comment, setComment] = useState('');
  const [fileName, setFileName] = useState('');
  const { changeStatus, addComment, addAttachment } = useRequestStore();

  const validTransitions = getValidTransitions(request.status);
  const totalQuantity = request.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleStatusChange = (newStatus: RequestStatus, action: string) => {
    const result = changeStatus(request.id, newStatus, 'Current User', comment || `${action} executed`);
    if (result.success) {
      setComment('');
    } else {
      alert(result.error);
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      addComment(request.id, comment, 'Current User');
      setComment('');
    }
  };

  const handleAddAttachment = () => {
    if (fileName.trim()) {
      addAttachment(request.id, {
        fileName,
        fileUrl: `#${fileName.toLowerCase().replace(/\s+/g, '-')}`
      });
      setFileName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Workflow: {request.title}</DialogTitle>
        </DialogHeader>
        
        {/* Request Summary Header */}
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Requester</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{request.requester}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Department</Label>
                  <div className="text-sm mt-1">{request.department}</div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Created</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{format(request.createdAt, 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={`${statusColors[request.status]} text-xs font-semibold`}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Items</Label>
                  <div className="text-sm mt-1">{request.items.length}</div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Total Quantity</Label>
                  <div className="text-sm mt-1">{totalQuantity}</div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Comments</Label>
                  <div className="text-sm mt-1">{request.notes.length}</div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Files</Label>
                  <div className="text-sm mt-1">{request.attachments.length}</div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Request ID</Label>
                  <div className="text-xs mt-1 font-mono break-all">{request.id}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${statusColors[request.status]} text-sm font-semibold`}>
                  {request.status}
                </Badge>
              </CardContent>
            </Card>

            {validTransitions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {validTransitions.map((transition) => (
                      <Button
                        key={transition.action}
                        onClick={() => handleStatusChange(transition.to, transition.action)}
                        className="w-full justify-start"
                        variant={transition.action.includes('Approve') ? 'default' : 
                                transition.action.includes('Reject') ? 'destructive' : 'outline'}
                      >
                        {transition.action}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Add Comment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button onClick={handleAddComment} className="w-full">
                  Add Comment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Add Attachment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-name">File Name</Label>
                  <Input
                    id="file-name"
                    placeholder="Enter file name..."
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddAttachment} className="w-full">
                  Add Attachment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div>
            <Tabs defaultValue="activity" className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="attachments">Files</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {request.history.map((entry) => (
                    <Card key={entry.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <User className="h-4 w-4" />
                            {entry.user}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {entry.action}
                          </p>
                          {entry.comment && (
                            <p className="text-sm mt-2 p-2 bg-muted rounded">
                              {entry.comment}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(entry.timestamp, 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {request.notes.map((note) => (
                    <Card key={note.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <User className="h-4 w-4" />
                            {note.user}
                          </div>
                          <p className="text-sm mt-2 p-2 bg-muted rounded">
                            {note.comment}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(note.timestamp, 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {request.notes.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No comments yet</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {request.attachments.map((attachment) => (
                    <Card key={attachment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">{attachment.fileName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(attachment.uploadedAt, 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {request.attachments.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No attachments</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Request Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Requester</Label>
                      <p className="text-sm text-muted-foreground">{request.requester}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <p className="text-sm text-muted-foreground">{request.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {format(request.createdAt, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">Items ({request.items.length})</Label>
                      <div className="mt-2 space-y-2">
                        {request.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.quantity} {item.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}