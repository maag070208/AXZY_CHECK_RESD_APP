export type PaymentStatus = "PENDING" | "PAID" | "CANCELLED" | "FAILED";

export interface IFeeBasic {
  id: string;
  name: string;
  description: string | null;
  amount: number;
}

export interface IUserBasic {
  id: string;
  name: string;
  lastName: string | null;
  email: string | null;
}

export interface IResidentBasic {
  id: string;
  userId: string;
  phone: string | null;
  email: string | null;
  houseId: string | null;
  user?: IUserBasic;
}

export interface IPaymentLogBasic {
  id: string;
  action: string;
  statusFrom: PaymentStatus | null;
  statusTo: PaymentStatus;
  amount: number;
  notes: string | null;
  createdAt: string;
}

export interface IPayment {
  id: string;
  residentId: string;
  feeId: string;
  amount: number;
  reference: string | null;
  status: PaymentStatus;
  period: string | null;
  stripeInvoiceId: string | null;
  stripePaymentIntentId: string | null;
  s3ReceiptUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  resident?: IResidentBasic;
  fee?: IFeeBasic;
  paymentLogs?: IPaymentLogBasic[];
}

export interface IPaymentSummary {
  paid: { total: number; count: number };
  pending: { total: number; count: number };
  overdue: { total: number; count: number };
}

export interface ICreatePaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  customerId: string;
  ephemeralKey: string;
  amount: number;
  currency: string;
}

export interface ICreatePaymentCheckoutResponse {
  url: string;
  sessionId: string;
}

export interface ICreatePaymentRequest {
  residentId: string;
  feeId: string;
  amount: number;
  reference?: string;
  paidAt?: string;
  period?: string;
}

export interface IUpdatePaymentRequest {
  status?: PaymentStatus;
  reference?: string;
  paidAt?: string;
  period?: string;
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  CANCELLED: "Cancelado",
  FAILED: "Fallido",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: "#F59E0B",
  PAID: "#10B981",
  CANCELLED: "#6B7280",
  FAILED: "#EF4444",
};
