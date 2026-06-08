import { get, post, put, remove } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';
import { IFee, IFeeCreate, IFeeUpdate } from './fees.types';

export const getFees = async (): Promise<TResult<IFee[]>> => {
  return await get<IFee[]>('/payments/fees');
};

export const getPaginatedFees = async (
  params: { page: number; limit: number; filters?: Record<string, unknown> },
): Promise<TResult<{ rows: IFee[]; total: number }>> => {
  return await post('/payments/fees/datatable', params);
};

export const createFee = async (
  data: IFeeCreate,
): Promise<TResult<IFee>> => {
  return await post<IFee>('/payments/fees', data);
};

export const updateFee = async (
  id: string,
  data: IFeeUpdate,
): Promise<TResult<IFee>> => {
  return await put<IFee>(`/payments/fees/${id}`, data);
};

export const deleteFee = async (
  id: string,
): Promise<TResult<IFee>> => {
  return await remove<IFee>(`/payments/fees/${id}`);
};
