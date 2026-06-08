export type AccessType = 'TEMPORARY' | 'RECURRING' | 'DELIVERY' | 'SERVICE';

export type AccessStatus = 'PENDING' | 'ACTIVE' | 'FINISHED' | 'REJECTED' | 'EXPIRED';

export interface IVisitor {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IVisitorCreate {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface IAccess {
  id: string;
  residentId: string;
  visitorId: string;
  type: string;
  status: AccessStatus;
  qrCode: string | null;
  validFrom: string;
  validUntil: string;
  used: boolean;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  visitor?: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  resident?: {
    id: string;
    phone: string | null;
    email: string | null;
    user: { id: string; name: string; lastName: string | null };
    house?: { id: string; number: string; street: string };
  } | null;
}

export interface IAccessCreate {
  residentId: string;
  visitorId?: string;
  visitor?: {
    name: string;
    phone?: string;
  };
  type: string;
  validFrom: string;
  validUntil: string;
}

export interface IAccessUpdate {
  type?: string;
  status?: AccessStatus;
  validFrom?: string;
  validUntil?: string;
  used?: boolean;
  softDelete?: boolean;
  rejectionReason?: string | null;
}

export const ACCESS_TYPE_LABELS: Record<string, string> = {
  TEMPORARY: 'Temporal',
  RECURRING: 'Recurrente',
  DELIVERY: 'Delivery / Servicio',
  SERVICE: 'Servicios Públicos',
};

export const ACCESS_STATUS_LABELS: Record<AccessStatus, string> = {
  PENDING: 'VÁLIDO',
  ACTIVE: 'DENTRO',
  FINISHED: 'COMPLETADO',
  REJECTED: 'RECHAZADO',
  EXPIRED: 'EXPIRADO',
};
