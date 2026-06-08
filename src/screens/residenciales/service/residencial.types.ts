import { DataTableResponse } from '../../../core/types/DataTableTypes';
import { TResult } from '../../../core/types/TResult';

export interface IResidencial {
  id: string;
  name: string;
  address: string | null;
  rfc: string | null;
  email: string | null;
  phone: string | null;
  contactName: string | null;
  contactPhone: string | null;
  active: boolean;
  softDelete: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: {
    locations: number;
    zones: number;
    users: number;
  };
}

export interface IResidencialCreate {
  name: string;
  address?: string;
  rfc?: string;
  contactName?: string;
  contactPhone?: string;
  active?: boolean;
  appUsername?: string;
  appPassword?: string;
}

export interface IResidencialUpdate extends Partial<IResidencialCreate> {
  softDelete?: boolean;
}

export type TResultListResidencial = TResult<IResidencial[]>;
export type TResultResidencial = TResult<IResidencial>;
export type TResultDatatableResidencial = TResult<DataTableResponse<IResidencial>>;

export type IClient = IResidencial;
export type IClientCreate = IResidencialCreate;
export type IClientUpdate = IResidencialUpdate;
export type TResultListClient = TResultListResidencial;
export type TResultClient = TResultResidencial;
export type TResultDatatableClient = TResultDatatableResidencial;
