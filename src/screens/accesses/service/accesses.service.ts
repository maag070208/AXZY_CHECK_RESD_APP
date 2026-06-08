import { get, post, put, remove } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';
import { IAccess, IAccessCreate, IAccessUpdate, IVisitor, IVisitorCreate } from './accesses.types';

export const getAccessesDatatable = async (
  params: { page: number; limit: number; filters?: Record<string, unknown> },
): Promise<TResult<{ rows: IAccess[]; total: number }>> => {
  return await post('/accesses/datatable', params);
};

export const getAccessById = async (
  id: string,
): Promise<TResult<IAccess>> => {
  return await get<IAccess>(`/accesses/${id}`);
};

export const createAccess = async (
  data: IAccessCreate,
): Promise<TResult<IAccess>> => {
  return await post<IAccess>('/accesses', data);
};

export const updateAccess = async (
  id: string,
  data: IAccessUpdate,
): Promise<TResult<IAccess>> => {
  return await put<IAccess>(`/accesses/${id}`, data);
};

export const deleteAccess = async (
  id: string,
): Promise<TResult<IAccess>> => {
  return await remove<IAccess>(`/accesses/${id}`);
};

export const createVisitor = async (
  data: IVisitorCreate,
): Promise<TResult<IVisitor>> => {
  return await post<IVisitor>('/visitors', data);
};

export const getVisitorsDatatable = async (
  params: { page: number; limit: number; filters?: Record<string, unknown> },
): Promise<TResult<{ rows: IVisitor[]; total: number }>> => {
  return await post('/visitors/datatable', params);
};
