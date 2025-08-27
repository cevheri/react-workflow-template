import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { PurchaseRequest, RequestStatus, HistoryLog, Attachment, getValidTransitions, UnitType } from '@/lib/types';

interface RequestStore {
  requests: PurchaseRequest[];
  getRequestById: (id: string) => PurchaseRequest | undefined;
  addRequest: (request: Omit<PurchaseRequest, 'id' | 'createdAt' | 'history' | 'attachments' | 'notes' | 'status'>) => void;
  updateRequest: (id: string, updatedData: Partial<PurchaseRequest>) => void;
  addComment: (requestId: string, comment: string, user: string) => void;
  addAttachment: (requestId: string, attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => void;
  changeStatus: (requestId: string, newStatus: RequestStatus, user: string, comment?: string) => { success: boolean; error?: string };
  deleteRequest: (id: string) => void;
}

// Deterministic helpers to avoid SSR/CSR hydration mismatches for mock data
const hashString = (input: string): number => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
};

const makeDeterministicId = (base: string): string => {
  const h = hashString(base).toString(16).padStart(8, '0');
  return `${h}${h}`; // 16 hex chars
};

const pickUnit = (index: number): UnitType => {
  const units: UnitType[] = ['Piece', 'Kg', 'Liter', 'Package'];
  return units[index % units.length];
};

const createMockRequest = (
  index: number,
  title: string,
  requester: string,
  department: string,
  status: RequestStatus,
  itemsCount: number = 2
): PurchaseRequest => {
  const id = makeDeterministicId(`${title}-${index}`);
  // Fixed, deterministic dates starting from Jan 1, 2024
  const createdAt = new Date(2024, 0, 1 + index, 9, 0, 0, 0);

  const items = Array.from({ length: itemsCount }, (_, i) => ({
    id: makeDeterministicId(`${title}-item-${i}-${index}`),
    name: `Item ${i + 1} for ${title}`,
    quantity: ((i + 1) * (index + 2)) % 10 + 1,
    unit: pickUnit(i + index)
  }));

  const history: HistoryLog[] = [
    {
      id: makeDeterministicId(`${title}-hist-0-${index}`),
      user: requester,
      action: 'Request Created',
      timestamp: createdAt,
      comment: 'Initial request creation'
    }
  ];

  if (status !== 'Draft') {
    history.push({
      id: makeDeterministicId(`${title}-hist-1-${index}`),
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
    createMockRequest(0, 'Office Supplies Q1 2024', 'John Doe', 'Administration', 'Approved'),
    createMockRequest(1, 'Lab Equipment Upgrade', 'Dr. Smith', 'Research', 'Pending Approval'),
    createMockRequest(2, 'Marketing Materials', 'Sarah Wilson', 'Marketing', 'Draft'),
    createMockRequest(3, 'IT Infrastructure Update', 'Mike Johnson', 'IT', 'Rejected')
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