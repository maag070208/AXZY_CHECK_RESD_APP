import { get, post, put, remove } from "../../../core/axios";
import { TResult } from "../../../core/types/TResult";
import { store } from "../../../core/store/redux.config";
import { API_CONSTANTS } from "../../../core/constants/API_CONSTANTS";
import {
  ICreatePaymentCheckoutResponse,
  ICreatePaymentIntentResponse,
  ICreatePaymentRequest,
  IPayment,
  IPaymentSummary,
  IUpdatePaymentRequest,
} from "./payments.types";

export const getPaginatedPayments = async (
  params: { page: number; limit: number; filters?: Record<string, unknown>; sort?: { key: string; direction: "asc" | "desc" } },
): Promise<TResult<{ rows: IPayment[]; total: number }>> => {
  return await post("/payments/datatable", params);
};

export const getPaymentById = async (
  paymentId: string,
): Promise<TResult<IPayment>> => {
  return await get<IPayment>(`/payments/${paymentId}`);
};

export const getPaymentSummary = async (
  from?: string,
  to?: string,
): Promise<TResult<IPaymentSummary>> => {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  const qs = query.toString();
  return await get<IPaymentSummary>(`/payments/summary${qs ? `?${qs}` : ""}`);
};

export const createCheckout = async (
  paymentId: string,
): Promise<TResult<ICreatePaymentCheckoutResponse>> => {
  return await post<ICreatePaymentCheckoutResponse>(`/payments/${paymentId}/checkout`, {});
};

export const createPaymentIntent = async (
  paymentId: string,
): Promise<TResult<ICreatePaymentIntentResponse>> => {
  return await post<ICreatePaymentIntentResponse>(`/payments/${paymentId}/payment-intent`, {});
};

export const verifyPayment = async (
  paymentId: string,
): Promise<TResult<IPayment>> => {
  return await post<IPayment>(`/payments/${paymentId}/verify-payment`, {});
};

export const verifyPaymentSession = async (
  sessionId: string,
): Promise<TResult<IPayment>> => {
  return await post<IPayment>(`/payments/session/${sessionId}/verify`, {});
};

export const createManualPayment = async (
  data: ICreatePaymentRequest,
): Promise<TResult<IPayment>> => {
  return await post<IPayment>("/payments", data);
};

export const updatePayment = async (
  paymentId: string,
  data: IUpdatePaymentRequest,
): Promise<TResult<IPayment>> => {
  return await put<IPayment>(`/payments/${paymentId}`, data);
};

export const cancelPayment = async (
  paymentId: string,
): Promise<TResult<IPayment>> => {
  return await remove<IPayment>(`/payments/${paymentId}`);
};

export const downloadReceiptPDF = async (paymentId: string): Promise<string> => {
  const RNFS = (await import("react-native-fs")).default;
  const Share = (await import("react-native-share")).default;

  const token = store.getState().userState.token;
  const url = `${API_CONSTANTS.BASE_URL}/payments/receipt/${paymentId}/download`;
  const fileName = `comprobante_${paymentId.slice(0, 8)}.pdf`;
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  const headers: Record<string, string> = { Accept: "application/pdf" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const job = RNFS.downloadFile({
    fromUrl: url,
    toFile: path,
    headers,
  });

  const result = await job.promise;
  if (result.statusCode >= 400) {
    throw new Error(`Error al descargar comprobante (${result.statusCode})`);
  }

  await Share.open({
    url: `file://${path}`,
    type: "application/pdf",
    title: "Comprobante de Pago",
    filename: fileName,
    failOnCancel: false,
  }).catch(() => undefined);

  return path;
};
