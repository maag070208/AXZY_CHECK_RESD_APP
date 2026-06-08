import { get, post, put, remove } from '../../../core/axios';
import { DataTableResponse } from '../../../core/types/DataTableTypes';
import { TResult } from '../../../core/types/TResult';
import {
  CreatePropertyDTO,
  IProperty,
  UpdatePropertyDTO,
} from './properties.types';

export const getPaginatedProperties = async (params: {
  page: number;
  limit: number;
  filters?: {
    search?: string;
    number?: string;
    street?: string;
    active?: boolean;
  };
}): Promise<TResult<DataTableResponse<IProperty>>> => {
  return await post<DataTableResponse<IProperty>>('/houses/datatable', params);
};

export const getHouseById = async (
  id: string,
): Promise<TResult<IProperty>> => {
  return await get<IProperty>(`/houses/${id}`);
};

export const createProperty = async (
  data: CreatePropertyDTO,
): Promise<TResult<IProperty>> => {
  return await post<IProperty>('/houses', data);
};

export const updateProperty = async (
  id: string,
  data: UpdatePropertyDTO,
): Promise<TResult<IProperty>> => {
  return await put<IProperty>(`/houses/${id}`, data);
};

export const deleteProperty = async (id: string): Promise<TResult<void>> => {
  return await remove<void>(`/houses/${id}`);
};
