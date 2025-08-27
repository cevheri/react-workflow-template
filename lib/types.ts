export type RequestStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

export type UnitType = 'Piece' | 'Kg' | 'Liter' | 'Package';

// Material catalog types for item selection
export interface Material {
  id: string;
  code?: string;
  name: string;
  category: string;
  subcategory: string;
  unit: UnitType;
}

export interface RequestItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  // Optional references to material catalog to support fast selection
  materialId?: string;
  category?: string;
  subcategory?: string;
  code?: string;
}

export interface HistoryLog {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  comment?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface PurchaseRequest {
  id: string;
  title: string;
  requester: string;
  department: string;
  status: RequestStatus;
  createdAt: Date;
  items: RequestItem[];
  history: HistoryLog[];
  attachments: Attachment[];
  notes: HistoryLog[];
}

export interface WorkflowTransition {
  from: RequestStatus;
  to: RequestStatus;
  action: string;
}

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  { from: 'Draft', to: 'Pending Approval', action: 'Submit for Approval' },
  { from: 'Pending Approval', to: 'Approved', action: 'Approve' },
  { from: 'Pending Approval', to: 'Rejected', action: 'Reject' },
  { from: 'Pending Approval', to: 'Draft', action: 'Withdraw' },
  { from: 'Rejected', to: 'Draft', action: 'Revise' }
];

export const getValidTransitions = (currentStatus: RequestStatus): WorkflowTransition[] => {
  return WORKFLOW_TRANSITIONS.filter(transition => transition.from === currentStatus);
};