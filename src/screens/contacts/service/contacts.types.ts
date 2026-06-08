export interface IContact {
  id: string;
  residentId: string;
  name: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  active: boolean;
  createdAt: string;
}

export interface IContactCreate {
  residentId: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
}

export interface IContactUpdate {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}
