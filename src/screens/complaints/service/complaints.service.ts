import { get, post, put, remove } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';
import {
  IComplaint,
  IComplaintCategory,
  IComplaintCreate,
  IComplaintUpdate,
} from './complaints.types';

export const getPaginatedComplaints = async (
  params: {
    page: number;
    limit: number;
    filters?: Record<string, unknown>;
  },
): Promise<TResult<{ rows: IComplaint[]; total: number }>> => {
  return await post('/complaints/datatable', params);
};

export const getComplaintById = async (
  id: string,
): Promise<TResult<IComplaint>> => {
  return await get<IComplaint>(`/complaints/${id}`);
};

export const getComplaintCategories = async (): Promise<
  TResult<IComplaintCategory[]>
> => {
  return await get<IComplaintCategory[]>('/complaints/categories');
};

export const createComplaint = async (
  data: IComplaintCreate,
): Promise<TResult<IComplaint>> => {
  return await post<IComplaint>('/complaints', data);
};

export const updateComplaint = async (
  id: string,
  data: IComplaintUpdate,
): Promise<TResult<IComplaint>> => {
  return await put<IComplaint>(`/complaints/${id}`, data);
};

export const deleteComplaint = async (
  id: string,
): Promise<TResult<IComplaint>> => {
  return await remove<IComplaint>(`/complaints/${id}`);
};
