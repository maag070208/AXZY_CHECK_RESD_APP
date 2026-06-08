import { get, post, put, remove } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';
import { IMaintenance, IMaintenanceCreate, IMaintenanceUpdate } from './maintenance.types';

export const createMaintenance = async (
  data: IMaintenanceCreate,
): Promise<TResult<IMaintenance>> => {
  return await post<IMaintenance>('/maintenance', data);
};

export const getMaintenances = async (filters?: {
  startDate?: string;
  endDate?: string;
  guardId?: string;
  title?: string;
}): Promise<TResult<IMaintenance[]>> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  if (filters?.guardId) params.set('guardId', filters.guardId);
  if (filters?.title) params.set('title', filters.title);
  const qs = params.toString();
  return await get<IMaintenance[]>(`/maintenance${qs ? `?${qs}` : ''}`);
};

export const getPaginatedMaintenances = async (params: {
  page: number;
  limit: number;
  filters?: Record<string, unknown>;
}): Promise<TResult<{ rows: IMaintenance[]; total: number }>> => {
  return await post('/maintenance/datatable', params);
};

export const resolveMaintenance = async (
  id: string,
): Promise<TResult<IMaintenance>> => {
  return await put<IMaintenance>(`/maintenance/${id}/resolve`);
};

export const deleteMaintenance = async (
  id: string,
): Promise<TResult<IMaintenance>> => {
  return await remove<IMaintenance>(`/maintenance/${id}`);
};

export const getPendingMaintenancesCount = async (): Promise<
  TResult<{ count: number }>
> => {
  return await get<{ count: number }>('/maintenance/pending-count');
};
