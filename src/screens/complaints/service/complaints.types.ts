export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface IComplaintCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface IComplaint {
  id: string;
  residentId: string;
  categoryId: string;
  title: string;
  description: string;
  media: any;
  status: ComplaintStatus;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  resident?: {
    id: string;
    phone: string | null;
    user?: {
      id: string;
      name: string;
      lastName: string | null;
    };
  };
  category?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  resolvedBy?: {
    id: string;
    name: string;
    lastName: string | null;
  };
}

export interface IComplaintCreate {
  categoryId: string;
  title: string;
  description: string;
  media?: any;
}

export interface IComplaintUpdate {
  categoryId?: string;
  title?: string;
  description?: string;
  media?: any;
  status?: ComplaintStatus;
}

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En Progreso',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};
