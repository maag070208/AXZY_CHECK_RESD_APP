import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import dayjs from "dayjs";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";
import { showToast } from "../../../core/store/slices/toast.slice";
import { useAppDispatch, useAppSelector } from "../../../core/store/hooks";
import {
  ITBadge,
  ITButton,
  ITCard,
  ITText
} from "../../../shared/components";
import { theme } from "../../../shared/theme/theme";
import {
  cancelPayment,
  createPaymentIntent,
  downloadReceiptPDF,
  getPaymentById,
  verifyPayment,
  verifyPaymentSession,
} from "../service/payments.service";
import { IPayment, PAYMENT_STATUS_LABELS } from "../service/payments.types";

const formatCurrency = (amount: number) =>
  "$" +
  amount.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

interface RouteParams {
  paymentId: string;
  sessionId?: string;
}

export const PaymentDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const userRole = useAppSelector((state) => state.userState.role);

  const { paymentId, sessionId } = route.params as RouteParams;
  const [payment, setPayment] = useState<IPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    if (sessionId) {
      const v = await verifyPaymentSession(sessionId);
      if (v.success && v.data) {
        setPayment(v.data);
        setLoading(false);
        return;
      }
    }
    const res = await getPaymentById(paymentId);
    if (res.success && res.data) {
      setPayment(res.data);
    } else {
      dispatch(
        showToast({
          message: res.messages?.[0] || "No se pudo cargar el pago",
          type: "error",
        }),
      );
    }
    setLoading(false);
  }, [paymentId, sessionId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePay = async () => {
    if (!payment) return;
    setPaying(true);
    try {
      const intentRes = await createPaymentIntent(payment.id);
      if (!intentRes.success || !intentRes.data) {
        dispatch(showToast({ message: intentRes.messages?.[0] || "Error al iniciar el pago", type: "error" }));
        return;
      }
      const { clientSecret, customerId, ephemeralKey } = intentRes.data;
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        customerId,
        customerEphemeralKeySecret: ephemeralKey,
        merchantDisplayName: "AXZY CHECK",
        style: "automatic",
      });
      if (initError) {
        dispatch(showToast({ message: initError.message ?? "Error al abrir pago", type: "error" }));
        return;
      }
      const { error: payError } = await presentPaymentSheet();
      if (payError) {
        if (payError.code !== "Canceled") {
          dispatch(showToast({ message: payError.message ?? "Pago cancelado", type: "error" }));
        }
        return;
      }
      dispatch(showToast({ message: "Verificando pago...", type: "info" }));
      const verifyRes = await verifyPayment(payment.id);
      if (verifyRes.success && verifyRes.data?.status === "PAID") {
        navigation.replace("PAYMENT_RECEIPT", { paymentId: payment.id });
        return;
      }
      navigation.replace("PAYMENT_RECEIPT", { paymentId: payment.id });
    } catch (err: any) {
      dispatch(showToast({ message: err?.message || "Error inesperado", type: "error" }));
    } finally {
      setPaying(false);
    }
  };

  const handleDownload = async () => {
    if (!payment) return;
    setDownloading(true);
    try {
      await downloadReceiptPDF(payment.id);
    } catch (err: any) {
      dispatch(showToast({ message: err?.message || "Error al descargar", type: "error" }));
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = async () => {
    if (!payment) return;
    setCancelling(true);
    try {
      const res = await cancelPayment(payment.id);
      if (res.success) {
        dispatch(showToast({ message: "Pago cancelado", type: "success" }));
      } else {
        dispatch(showToast({ message: res.messages?.[0] || "Error al cancelar", type: "error" }));
      }
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !payment) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ITText variant="bodyMedium" color={theme.colors.slate500} style={{ marginTop: 12 }}>
            Cargando pago...
          </ITText>
        </View>
      </View>
    );
  }

  const isAdmin = userRole === "ADMINI" || userRole === "LIDER";
  const isResident = userRole === "RESDN";
  const canPay = payment.status === "PENDING" && (isResident || isAdmin);
  const canCancel = payment.status === "PENDING" && isAdmin;

  const residentName = payment.resident?.user
    ? `${payment.resident.user.name} ${payment.resident.user.lastName ?? ""}`.trim()
    : "—";
  const initial = residentName.charAt(0).toUpperCase();
  const feeName = payment.fee?.name ?? "Cuota";
  const amount = formatCurrency(Number(payment.amount));
  const period = payment.period ? dayjs(payment.period).format("MMMM YYYY") : "—";
  const statusVariant: "success" | "warning" | "error" | "default" =
    payment.status === "PAID" ? "success" : payment.status === "PENDING" ? "warning" : payment.status === "FAILED" ? "error" : "default";

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={theme.colors.primary} />
      }
    >
      {/* PROFILE HEADER */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarLarge}>
            <ITText style={styles.avatarLargeText}>{initial}</ITText>
          </View>
          <View style={{ flex: 1 }}>
            <ITText variant="headlineSmall" weight="bold" color={theme.colors.slate900}>
              {amount}
            </ITText>
            <View style={styles.badgeRow}>
              <ITBadge
                label={PAYMENT_STATUS_LABELS[payment.status].toUpperCase()}
                variant={statusVariant}
                size="small"
                dot
              />
              <ITText variant="labelSmall" color={theme.colors.slate500}>
                {feeName}
              </ITText>
            </View>
          </View>
        </View>

        {/* STATS GRID */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon source="calendar-month-outline" size={20} color={theme.colors.primary} />
            <ITText variant="labelSmall" weight="600" color={theme.colors.slate500} style={{ marginTop: 4 }}>
              {period}
            </ITText>
            <ITText variant="labelSmall" color={theme.colors.slate400}>
              Período
            </ITText>
          </View>
          <View style={styles.statCard}>
            <Icon source="hashtag" size={20} color={theme.colors.primary} />
            <ITText variant="labelSmall" weight="600" color={theme.colors.slate500} style={{ marginTop: 4 }}>
              #{payment.id.slice(0, 8).toUpperCase()}
            </ITText>
            <ITText variant="labelSmall" color={theme.colors.slate400}>
              Folio
            </ITText>
          </View>
          <View style={styles.statCard}>
            <Icon source="clock-outline" size={20} color={theme.colors.primary} />
            <ITText variant="labelSmall" weight="600" color={theme.colors.slate500} style={{ marginTop: 4 }}>
              {payment.paidAt ? dayjs(payment.paidAt).format("DD MMM") : "—"}
            </ITText>
            <ITText variant="labelSmall" color={theme.colors.slate400}>
              {payment.paidAt ? "Pagado" : "Estado"}
            </ITText>
          </View>
        </View>
      </View>

      {/* RESIDENTE */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Icon source="account-outline" size={20} color={theme.colors.primary} />
          <ITText variant="titleSmall" weight="bold" color={theme.colors.slate900}>
            Residente
          </ITText>
        </View>
        <ITCard style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardAvatar}>
              <ITText style={styles.cardAvatarText}>{initial}</ITText>
            </View>
            <View style={styles.cardInfo}>
              <ITText variant="titleSmall" weight="700" color={theme.colors.slate900}>
                {residentName}
              </ITText>
              <View style={styles.cardMeta}>
                {payment.resident?.email && (
                  <ITText variant="labelSmall" color={theme.colors.slate500}>
                    {payment.resident.email}
                  </ITText>
                )}
              </View>
            </View>
            {payment.resident?.phone && (
              <ITText variant="labelSmall" color={theme.colors.slate500}>
                {payment.resident.phone}
              </ITText>
            )}
          </View>
        </ITCard>
      </View>

      {/* DETALLE */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Icon source="receipt-text-outline" size={20} color={theme.colors.primary} />
          <ITText variant="titleSmall" weight="bold" color={theme.colors.slate900}>
            Detalle del Pago
          </ITText>
        </View>
        <ITCard style={styles.infoCard}>
          <DetailRow label="Concepto" value={feeName} />
          <DetailRow label="Período" value={period} />
          {payment.reference && <DetailRow label="Referencia" value={payment.reference} />}
          <DetailRow
            label="Fecha de Pago"
            value={payment.paidAt ? dayjs(payment.paidAt).format("DD MMM YYYY hh:mm A") : "—"}
          />
          <DetailRow label="Creado" value={dayjs(payment.createdAt).format("DD MMM YYYY hh:mm A")} />
        </ITCard>
      </View>

      {/* STRIPE */}
      {payment.stripePaymentIntentId && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Icon source="credit-card-outline" size={20} color={theme.colors.primary} />
            <ITText variant="titleSmall" weight="bold" color={theme.colors.slate900}>
              Stripe
            </ITText>
          </View>
          <ITCard style={styles.infoCard}>
            <View style={styles.stripeRow}>
              <Icon source="check-decagram" size={16} color="#635BFF" />
              <ITText variant="bodySmall" color={theme.colors.slate500} style={{ flex: 1 }}>
                Payment Intent
              </ITText>
              <ITText variant="labelSmall" weight="600" color={theme.colors.slate900} style={{ fontFamily: "monospace" }}>
                {payment.stripePaymentIntentId.slice(0, 14)}...
              </ITText>
            </View>
          </ITCard>
        </View>
      )}

      {/* LOGS */}
      {payment.paymentLogs && payment.paymentLogs.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Icon source="history" size={20} color={theme.colors.primary} />
            <ITText variant="titleSmall" weight="bold" color={theme.colors.slate900}>
              Historial
            </ITText>
          </View>
          <ITCard style={styles.infoCard}>
             {payment.paymentLogs.map((log, i) => (
              <View
                key={log.id || `log-${i}`}
                style={[
                  styles.logRow,
                  i < payment.paymentLogs!.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <ITText variant="labelSmall" color={theme.colors.slate500}>
                    {dayjs(log.createdAt).format("DD MMM HH:mm")}
                  </ITText>
                  {log.notes && (
                    <ITText variant="labelSmall" color={theme.colors.slate400} style={{ marginTop: 2 }}>
                      {log.notes}
                    </ITText>
                  )}
                </View>
                <ITBadge
                  label={log.statusTo}
                  variant={log.statusTo === "PAID" ? "success" : log.statusTo === "FAILED" ? "error" : "default"}
                  size="small"
                />
              </View>
            ))}
          </ITCard>
        </View>
      )}

      {/* ACCIONES */}
      <View style={styles.actionsContainer}>
        {canPay && (
          <ITButton
            label={paying ? "Procesando..." : "Pagar con Stripe"}
            mode="contained"
            onPress={handlePay}
            loading={paying}
            disabled={paying}
            icon="credit-card"
          />
        )}
        <ITButton
          label={downloading ? "Descargando..." : "Descargar Comprobante"}
          mode="outlined"
          onPress={handleDownload}
          loading={downloading}
          disabled={downloading}
          icon="file-pdf-box"
        />
        {canCancel && (
          <ITButton
            label={cancelling ? "Cancelando..." : "Cancelar Pago"}
            mode="text"
            onPress={handleCancel}
            loading={cancelling}
            disabled={cancelling}
            textColor="#EF4444"
          />
        )}
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <ITText variant="labelSmall" color={theme.colors.slate500} style={styles.detailLabel}>
      {label}
    </ITText>
    <ITText variant="bodySmall" weight="600" color={theme.colors.slate900} style={styles.detailValue}>
      {value}
    </ITText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 24,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  infoCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  cardAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.slate900,
  },
  cardInfo: {
    flex: 1,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  detailLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  detailValue: {
    flex: 1.5,
    textAlign: "right",
  },
  stripeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 12,
  },
});
