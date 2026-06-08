import { useFocusEffect, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Icon } from "react-native-paper";
import {
  ITBadge,
  ITCard,
  ITText,
} from "../../../shared/components";
import { theme } from "../../../shared/theme/theme";
import { getPaymentById, verifyPayment, verifyPaymentSession } from "../service/payments.service";
import { IPayment, PAYMENT_STATUS_LABELS } from "../service/payments.types";

const formatCurrency = (amount: number) =>
  "$" + amount.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const PaymentReceiptScreen = () => {
  const route = useRoute<any>();
  const { paymentId, sessionId } = route.params as { paymentId: string; sessionId?: string };
  const [payment, setPayment] = useState<IPayment | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        if (sessionId) {
          const v = await verifyPaymentSession(sessionId);
          if (v.success && v.data) { setPayment(v.data); setLoading(false); return; }
        } else {
          const v = await verifyPayment(paymentId);
          if (v.success && v.data?.status === "PAID") { setPayment(v.data); setLoading(false); return; }
        }
        const res = await getPaymentById(paymentId);
        if (res.success && res.data) setPayment(res.data);
        setLoading(false);
      };
      load();
    }, [paymentId, sessionId]),
  );

  if (loading || !payment) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ITText style={{ marginTop: 12, color: theme.colors.slate500 }}>Cargando comprobante...</ITText>
      </View>
    );
  }

  const isPaid = payment.status === "PAID";
  const residentName = payment.resident?.user
    ? `${payment.resident.user.name} ${payment.resident.user.lastName ?? ""}`.trim()
    : "—";
  const feeName = payment.fee?.name ?? "Cuota";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* HERO */}
      <View style={[styles.hero, { backgroundColor: isPaid ? "#065F46" : "#92400E" }]}>
        <View style={styles.heroIcon}>
          <Icon source={isPaid ? "check-circle" : "clock-outline"} size={48} color="#FFFFFF" />
        </View>
        <ITBadge
          label={isPaid ? "PAGADO" : "PENDIENTE"}
          variant={isPaid ? "success" : "warning"}
          size="small"
        />
      <ITText style={styles.heroTitle} numberOfLines={1}>{formatCurrency(Number(payment.amount))}</ITText>
      <ITText style={styles.heroSub}>{feeName}</ITText>
        {payment.period && (
          <ITText style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
            {dayjs(payment.period).format("MMMM YYYY")}
          </ITText>
        )}
      </View>

      {/* DATOS */}
      <View style={styles.section}>
        <ITCard style={styles.card}>
          <ITText style={styles.cardTitle}>RESIDENTE</ITText>
          <Row label="Nombre" value={residentName} />
          <Row label="Email" value={payment.resident?.email || "—"} />
          <Row label="Teléfono" value={payment.resident?.phone || "—"} />
        </ITCard>
      </View>

      <View style={styles.section}>
        <ITCard style={styles.card}>
          <ITText style={styles.cardTitle}>DETALLE DEL PAGO</ITText>
          <Row label="Folio" value={`#${payment.id.slice(0, 8).toUpperCase()}`} />
          <Row label="Concepto" value={feeName} />
          {payment.reference && <Row label="Referencia" value={payment.reference} />}
          <Row label="Fecha" value={payment.paidAt ? dayjs(payment.paidAt).format("DD MMM YYYY hh:mm A") : "—"} />
        </ITCard>
      </View>

      {/* LOGS */}
      {payment.paymentLogs && payment.paymentLogs.length > 0 && (
        <View style={styles.section}>
          <ITCard style={styles.card}>
            <ITText style={styles.cardTitle}>HISTORIAL</ITText>
            {payment.paymentLogs.map((log, i) => (
              <View key={log.id || `l-${i}`} style={styles.logRow}>
                <ITText style={{ color: theme.colors.slate500, fontSize: 11 }}>
                  {dayjs(log.createdAt).format("DD MMM HH:mm")}
                </ITText>
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

      {/* STRIPE */}
      {payment.stripePaymentIntentId && (
        <View style={styles.section}>
          <ITCard style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Icon source="check-decagram" size={16} color="#635BFF" />
              <ITText style={{ flex: 1, color: "#635BFF", fontWeight: "600" }}>Stripe</ITText>
              <ITText style={{ fontFamily: "monospace", fontSize: 11, color: theme.colors.slate500 }}>
                {payment.stripePaymentIntentId.slice(0, 14)}...
              </ITText>
            </View>
          </ITCard>
        </View>
      )}
    </ScrollView>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <ITText style={styles.rowLabel}>{label}</ITText>
    <ITText style={styles.rowValue}>{value}</ITText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" },
  hero: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroIcon: { marginBottom: 16 },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 12,
    letterSpacing: -1,
    textAlign: "center",
  },
  heroSub: {
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 4,
  },
  section: { paddingHorizontal: 20, marginTop: 20 },
  card: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.slate500,
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  rowLabel: {
    fontSize: 12,
    color: theme.colors.slate500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.slate900,
    flex: 1.5,
    textAlign: "right",
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
});
