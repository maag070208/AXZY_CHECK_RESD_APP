import { get, post, put, remove } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';
import { IRecurringConfiguration, IRecurringConfigurationCreate, IRecurringConfigurationUpdate } from './recurring.types';

export const getPaginatedRecurring = async (
  params: { page: number; limit: number; filters?: Record<string, unknown> },
): Promise<TResult<{ rows: IRecurringConfiguration[]; total: number }>> => {
  return await post('/recurring/datatable', params);
};

export const createRecurring = async (
  data: IRecurringConfigurationCreate,
): Promise<TResult<IRecurringConfiguration>> => {
  return await post<IRecurringConfiguration>('/recurring', data);
};

export const updateRecurring = async (
  id: string,
  data: IRecurringConfigurationUpdate,
): Promise<TResult<IRecurringConfiguration>> => {
  return await put<IRecurringConfiguration>(`/recurring/${id}`, data);
};

export const deleteRecurring = async (
  id: string,
): Promise<TResult<IRecurringConfiguration>> => {
  return await remove<IRecurringConfiguration>(`/recurring/${id}`);
};

export const getRecurringById = async (
  id: string,
): Promise<TResult<IRecurringConfiguration>> => {
  return await get<IRecurringConfiguration>(`/recurring/${id}`);
};
