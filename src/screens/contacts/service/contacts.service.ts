import { get, post, put, remove } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';
import { IContact, IContactCreate, IContactUpdate } from './contacts.types';

export const getPaginatedContacts = async (
  params: { page: number; limit: number; filters?: Record<string, unknown> },
): Promise<TResult<{ rows: IContact[]; total: number }>> => {
  return await post('/contacts/datatable', params);
};

export const createContact = async (
  data: IContactCreate,
): Promise<TResult<IContact>> => {
  return await post<IContact>('/contacts', data);
};

export const updateContact = async (
  id: string,
  data: IContactUpdate,
): Promise<TResult<IContact>> => {
  return await put<IContact>(`/contacts/${id}`, data);
};

export const deleteContact = async (
  id: string,
): Promise<TResult<IContact>> => {
  return await remove<IContact>(`/contacts/${id}`);
};
