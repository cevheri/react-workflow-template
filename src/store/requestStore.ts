import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { PurchaseRequest, RequestStatus, HistoryLog, Attachment, getValidTransitions } from '@/lib/types';

interface RequestStore {
  requests: PurchaseRequest[];
  getRequestById: (id: string) => PurchaseRequest | undefined;
  addRequest: (request: Omit<PurchaseRequest, 'id' | 'createdAt' | 'history' | 'attachments' | 'notes'>) => void;
  updateRequest: (id: string, updatedData: Partial<PurchaseRequest>) => void;
  addComment: (requestId: string, comment: string, user: string) => void;
  addAttachment: (requestId: string, attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => void;
  changeStatus: (requestId: string, newStatus: RequestStatus, user: string, comment?: string) => { success: boolean; error?: string };
  deleteRequest: (id: string) => void;
}

const createMockRequest = (
  title: string,
  requester: string,
  department: string,
  status: RequestStatus,
  itemsCount: number = 2
): PurchaseRequest => {
  const id = uuidv4();
  const createdAt = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000);
  
  const items = Array.from({ length: itemsCount }, (_, i) => ({
    id: uuidv4(),
    name: `Item ${i + 1} for ${title}`,
    quantity: Math.floor(Math.random() * 10) + 1,
    unit: ['Piece', 'Kg', 'Liter', 'Package'][Math.floor(Math.random() * 4)] as any
  }));

  const history: HistoryLog[] = [
    {
      id: uuidv4(),
      user: requester,
      action: 'Request Created',
      timestamp: createdAt,
      comment: 'Initial request creation'
    }
  ];

  if (status !== 'Draft') {
    history.push({
      id: uuidv4(),
      user: requester,
      action: 'Status Changed',
      timestamp: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
      comment: `Status changed to ${status}`
    });
  }

  return {
    id,
    title,
    requester,
    department,
    status,
    createdAt,
    items,
    history,
    attachments: [],
    notes: []
  };
};

export const useRequestStore = create<RequestStore>((set, get) => ({
  requests: [
    createMockRequest('Office Supplies Q1 2024', 'John Doe', 'Administration', 'Approved'),
    createMockRequest('Lab Equipment Upgrade', 'Dr. Smith', 'Research', 'Pending Approval'),
    createMockRequest('Marketing Materials', 'Sarah Wilson', 'Marketing', 'Draft'),
    createMockRequest('IT Infrastructure Update', 'Mike Johnson', 'IT', 'Rejected')
  ],

  getRequestById: (id: string) => {
    return get().requests.find(request => request.id === id);
  },

  addRequest: (requestData) => {
    const newRequest: PurchaseRequest = {
      ...requestData,
      id: uuidv4(),
      createdAt: new Date(),
      status: 'Draft',
      history: [{
        id: uuidv4(),
        user: requestData.requester,
        action: 'Request Created',
        timestamp: new Date(),
        comment: 'Initial request creation'
      }],
      attachments: [],
      notes: []
    };

    set(state => ({
      requests: [...state.requests, newRequest]
    }));
  },

  updateRequest: (id: string, updatedData) => {
    set(state => ({
      requests: state.requests.map(request =>
        request.id === id
          ? {
              ...request,
              ...updatedData,
              history: [
                ...request.history,
                {
                  id: uuidv4(),
                  user: 'Current User',
                  action: 'Request Updated',
                  timestamp: new Date(),
                  comment: 'Request details updated'
                }
              ]
            }
          : request
      )
    }));
  },

  addComment: (requestId: string, comment: string, user: string) => {
    const newNote: HistoryLog = {
      id: uuidv4(),
      user,
      action: 'Comment Added',
      timestamp: new Date(),
      comment
    };

    set(state => ({
      requests: state.requests.map(request =>
        request.id === requestId
          ? {
              ...request,
              notes: [...request.notes, newNote],
              history: [...request.history, newNote]
            }
          : request
      )
    }));
  },

  addAttachment: (requestId: string, attachmentData) => {
    const newAttachment: Attachment = {
      ...attachmentData,
      id: uuidv4(),
      uploadedAt: new Date()
    };

    const historyEntry: HistoryLog = {
      id: uuidv4(),
      user: 'Current User',
      action: 'Attachment Added',
      timestamp: new Date(),
      comment: `Added file: ${attachmentData.fileName}`
    };

    set(state => ({
      requests: state.requests.map(request =>
        request.id === requestId
          ? {
              ...request,
              attachments: [...request.attachments, newAttachment],
              history: [...request.history, historyEntry]
            }
          : request
      )
    }));
  },

  changeStatus: (requestId: string, newStatus: RequestStatus, user: string, comment?: string) => {
    const request = get().getRequestById(requestId);
    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    const validTransitions = getValidTransitions(request.status);
    const isValidTransition = validTransitions.some(t => t.to === newStatus);

    if (!isValidTransition) {
      return { 
        success: false, 
        error: `Invalid transition from ${request.status} to ${newStatus}` 
      };
    }

    const historyEntry: HistoryLog = {
      id: uuidv4(),
      user,
      action: 'Status Changed',
      timestamp: new Date(),
      comment: comment || `Status changed from ${request.status} to ${newStatus}`
    };

    set(state => ({
      requests: state.requests.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: newStatus,
              history: [...req.history, historyEntry]
            }
          : req
      )
    }));

    return { success: true };
  },

  deleteRequest: (id: string) => {
    set(state => ({
      requests: state.requests.filter(request => request.id !== id)
    }));
  }
}));