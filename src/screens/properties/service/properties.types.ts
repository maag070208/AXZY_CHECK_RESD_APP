export interface IProperty {
  id: string;
  number: string;
  street: string;
  block: string | null;
  reference: string | null;
  latitude: number | null;
  longitude: number | null;
  occupied: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreatePropertyDTO {
  number: string;
  street: string;
  block?: string;
  reference?: string;
  latitude?: number;
  longitude?: number;
  occupied?: boolean;
  active?: boolean;
}

export interface UpdatePropertyDTO {
  number?: string;
  street?: string;
  block?: string;
  reference?: string;
  latitude?: number;
  longitude?: number;
  occupied?: boolean;
  active?: boolean;
  softDelete?: boolean;
}
