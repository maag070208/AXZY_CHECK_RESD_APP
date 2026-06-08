import { get, post, put, remove } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';
import { ICatalogOption } from './settings.types';

export const getCatalogOptions = async (key: string): Promise<TResult<ICatalogOption[]>> => {
  return await get<ICatalogOption[]>(`/catalog/${key}`);
};

export const createCatalogOption = async (key: string, data: { name: string }): Promise<TResult<ICatalogOption>> => {
  return await post<ICatalogOption>(`/catalog/${key}`, data);
};

export const updateCatalogOption = async (key: string, id: string, data: { name: string; active: boolean }): Promise<TResult<ICatalogOption>> => {
  return await put<ICatalogOption>(`/catalog/${key}/${id}`, data);
};

export const deleteCatalogOption = async (key: string, id: string): Promise<TResult<boolean>> => {
  return await remove<boolean>(`/catalog/${key}/${id}`);
};

export const CATALOGS: Array<{ key: string; label: string; description: string }> = [
  { key: 'role', label: 'Roles de Usuario', description: 'Gestiona los roles del sistema' },
  { key: 'incident-category', label: 'Categorías de Incidencias', description: 'Gestiona categorías de incidencias' },
  { key: 'incident-type', label: 'Tipos de Incidencias', description: 'Gestiona tipos de incidencias' },
  { key: 'maintenance-category', label: 'Categorías de Mantenimiento', description: 'Gestiona categorías de mantenimiento' },
  { key: 'maintenance-type', label: 'Tipos de Mantenimiento', description: 'Gestiona tipos de mantenimiento' },
  { key: 'priority', label: 'Prioridades', description: 'Gestiona prioridades del sistema' },
  { key: 'payment-method', label: 'Métodos de Pago', description: 'Gestiona métodos de pago' },
  { key: 'payment-frequency', label: 'Frecuencias de Pago', description: 'Gestiona frecuencias de pago' },
  { key: 'kinship', label: 'Parentescos', description: 'Gestiona tipos de parentesco' },
  { key: 'contact-type', label: 'Tipos de Contacto', description: 'Gestiona tipos de contacto' },
  { key: 'complaint-category', label: 'Categorías de Queja', description: 'Gestiona categorías de queja' },
];
