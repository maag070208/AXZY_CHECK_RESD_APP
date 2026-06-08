export interface IActiveRound {
  id: string;
  startTime: string;
  status: string;
  guard: {
    name: string;
    lastName: string;
  };
  residencial: {
    name: string;
  };
}

export interface IDashboardStats {
  activeRoundsCount: number;
  activeRounds: IActiveRound[];
  pendingIncidentsCount: number;
  pendingMaintenanceCount: number;
}

export interface DashboardCounts {
  residents: number;
  guards: number;
  pendingIncidents: number;
  overduePayments: number;
  overduePaymentsAmount: number;
  activePasses: number;
  paymentsPaid: number;
  paymentsPaidAmount: number;
  paymentsPending: number;
  paymentsPendingAmount: number;
}

export interface RecentIncident {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  guard?: { name: string; lastName: string };
  category?: { name: string };
  type?: { name: string };
}

export interface RecentPayment {
  id: string;
  amount: string;
  createdAt: string;
  resident?: { name: string; lastName: string };
  fee?: { name: string };
}

export interface DashboardData {
  counts: DashboardCounts;
  recentIncidents: RecentIncident[];
  recentPayments: RecentPayment[];
}
