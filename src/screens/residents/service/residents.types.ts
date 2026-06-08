export interface IResident {
  id: string;
  userId: string;
  houseId: string | null;
  phone: string | null;
  email: string | null;
  isOwner: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    id: string;
    name: string;
    lastName: string | null;
    username: string;
    active?: boolean;
  };
  house?: {
    id: string;
    number: string;
    street: string;
    block: string | null;
    reference: string | null;
    occupied: boolean;
  };
}

export interface CreateResidentDTO {
  user?: {
    name: string;
    lastName?: string;
    username: string;
    password?: string;
  };
  houseId: string;
  phone?: string;
  email?: string;
  isOwner?: boolean;
  active?: boolean;
}

export interface UpdateResidentDTO {
  houseId?: string;
  phone?: string;
  email?: string;
  isOwner?: boolean;
  active?: boolean;
  softDelete?: boolean;
}
