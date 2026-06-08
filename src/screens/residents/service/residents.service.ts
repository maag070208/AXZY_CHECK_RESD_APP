import { get, post, put, remove } from '../../../core/axios';
import { DataTableResponse } from '../../../core/types/DataTableTypes';
import { TResult } from '../../../core/types/TResult';
import {
  CreateResidentDTO,
  IResident,
  UpdateResidentDTO,
} from './residents.types';

export const getPaginatedResidents = async (params: {
  page: number;
  limit: number;
  filters?: { name?: string };
}): Promise<TResult<DataTableResponse<IResident>>> => {
  return await post<DataTableResponse<IResident>>(
    '/residents/datatable',
    params,
  );
};

export const getResidentById = async (
  id: string,
): Promise<TResult<IResident>> => {
  return await get<IResident>(`/residents/${id}`);
};

export const createResident = async (
  data: CreateResidentDTO,
): Promise<TResult<IResident>> => {
  return await post<IResident>('/residents', data);
};

export const updateResident = async (
  id: string,
  data: UpdateResidentDTO,
): Promise<TResult<IResident>> => {
  return await put<IResident>(`/residents/${id}`, data);
};

export const deleteResident = async (
  id: string,
): Promise<TResult<void>> => {
  return await remove<void>(`/residents/${id}`);
};
