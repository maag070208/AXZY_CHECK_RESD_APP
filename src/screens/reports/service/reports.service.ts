import { get } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';
import { IReportData, IReportParams } from './reports.types';

export const getReportData = async (
  type: string,
  params: Partial<IReportParams>,
): Promise<TResult<IReportData>> => {
  return await get(`/reports/${type}`, { params });
};

export const getReportPdfUrl = (
  type: string,
  params: Partial<IReportParams>,
): string => {
  const query = new URLSearchParams();
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);
  if (params.residencialId) query.set('residencialId', String(params.residencialId));
  return `/reports/${type}/pdf?${query.toString()}`;
};
