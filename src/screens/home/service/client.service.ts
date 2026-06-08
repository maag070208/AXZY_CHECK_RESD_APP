import { get } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';

export const getResidenciales = async (): Promise<TResult<any[]>> => {
  return await get('/catalog/client');
};

export const getClients = getResidenciales;
