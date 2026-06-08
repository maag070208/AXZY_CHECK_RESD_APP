import { get, post } from '../../../core/axios';
import { TResult } from '../../../core/types/TResult';
import type {
  DashboardCounts,
  DashboardData,
  RecentIncident,
  RecentPayment,
} from '../types/HomeTypes';

const countOnly = async (url: string, filters: Record<string, unknown> = {}): Promise<number> => {
  try {
    const res = await post<{ rows: unknown[]; total: number }>(url, { page: 1, limit: 1, filters });
    if (res.success && res.data) return res.data.total ?? 0;
    return 0;
  } catch {
    return 0;
  }
};

const fetchRows = async <T>(url: string, filters: Record<string, unknown> = {}, limit = 5): Promise<T[]> => {
  try {
    const res = await post<{ rows: T[]; total: number }>(url, { page: 1, limit, filters });
    if (res.success && res.data) return (res.data.rows as T[]) ?? [];
    return [];
  } catch {
    return [];
  }
};

interface PaymentSummaryResponse {
  paid: { total: string; count: number };
  pending: { total: string; count: number };
  overdue: { total: string; count: number };
}

const fetchPaymentSummary = async (): Promise<PaymentSummaryResponse | null> => {
  try {
    const res: TResult<PaymentSummaryResponse> = await get<PaymentSummaryResponse>('/payments/summary');
    if (res.success && res.data) return res.data;
  } catch {}
  return null;
};

const fetchDashboardCounts = async (): Promise<DashboardCounts> => {
  const [residents, guards, pendingIncidents, activePasses, paymentSummary] = await Promise.allSettled([
    countOnly('/residents/datatable', { active: true }),
    countOnly('/users/datatable', { role: 'GUARD', active: true }),
    countOnly('/incidents/datatable', { status: 'PENDING' }),
    countOnly('/accesses/datatable', { used: false }),
    fetchPaymentSummary(),
  ]);

  const ps = paymentSummary.status === 'fulfilled' ? paymentSummary.value : null;

  return {
    residents: residents.status === 'fulfilled' ? residents.value : 0,
    guards: guards.status === 'fulfilled' ? guards.value : 0,
    pendingIncidents: pendingIncidents.status === 'fulfilled' ? pendingIncidents.value : 0,
    activePasses: activePasses.status === 'fulfilled' ? activePasses.value : 0,
    overduePayments: ps?.overdue?.count ?? 0,
    overduePaymentsAmount: Number(ps?.overdue?.total ?? 0),
    paymentsPaid: ps?.paid?.count ?? 0,
    paymentsPaidAmount: Number(ps?.paid?.total ?? 0),
    paymentsPending: ps?.pending?.count ?? 0,
    paymentsPendingAmount: Number(ps?.pending?.total ?? 0),
  };
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const [counts, recentIncidents, recentPayments] = await Promise.allSettled([
    fetchDashboardCounts(),
    fetchRows<RecentIncident>('/incidents/datatable', { status: 'PENDING' }, 4),
    fetchRows<RecentPayment>('/payments/datatable', { status: 'PAID' }, 4),
  ]);

  return {
    counts: counts.status === 'fulfilled' ? counts.value : {
      residents: 0, guards: 0, pendingIncidents: 0, activePasses: 0,
      overduePayments: 0, overduePaymentsAmount: 0,
      paymentsPaid: 0, paymentsPaidAmount: 0,
      paymentsPending: 0, paymentsPendingAmount: 0,
    },
    recentIncidents: recentIncidents.status === 'fulfilled' ? recentIncidents.value : [],
    recentPayments: recentPayments.status === 'fulfilled' ? recentPayments.value : [],
  };
};
