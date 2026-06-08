import { get, post, put, remove } from '../../../core/axios';
import {
  DataTableFetchParams,
  DataTableResponse,
} from '../../../core/types/DataTableTypes';
import {
  IResidencial,
  IResidencialCreate,
  IResidencialUpdate,
  TResultResidencial,
  TResultDatatableResidencial,
  TResultListResidencial,
} from './residencial.types';

export const getResidenciales = async (): Promise<TResultListResidencial> => {
  return await get<IResidencial[]>('/clients');
};

export const getResidencialesDatatable = async (
  params: DataTableFetchParams,
): Promise<any> => {
  return await post<DataTableResponse<IResidencial>>('/residenciales/datatable', params);
};

export const getResidencialById = async (id: string): Promise<TResultResidencial> => {
  return await get<IResidencial>(`/residenciales/${id}`);
};

export const createResidencial = async (
  data: IResidencialCreate,
): Promise<TResultResidencial> => {
  return await post<IResidencial>('/clients', data);
};

export const updateResidencial = async (
  id: string,
  data: IResidencialUpdate,
): Promise<TResultResidencial> => {
  return await put<IResidencial>(`/residenciales/${id}`, data);
};

export const deleteResidencial = async (id: string): Promise<TResultResidencial> => {
  return await remove<IResidencial>(`/residenciales/${id}`);
};

export const getClients = getResidenciales;
export const getClientById = getResidencialById;
export const createClient = createResidencial;
export const updateClient = updateResidencial;
export const deleteClient = deleteResidencial;
