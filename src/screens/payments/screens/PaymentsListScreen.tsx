import { useFocusEffect } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Searchbar } from 'react-native-paper';
import { showToast } from '../../../core/store/slices/toast.slice';
import { useAppDispatch, useAppSelector } from '../../../core/store/hooks';
import { useAppNavigation } from '../../../navigation/hooks/useAppNavigation';
import {
  ITBadge,
  ITCard,
  ITScreenDatatableLayout,
  ITText,
  ITTouchableOpacity,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  createPaymentIntent,
  getPaginatedPayments,
  getPaymentSummary,
  verifyPayment,
} from '../service/payments.service';
import {
  IPayment,
  IPaymentSummary,
  PAYMENT_STATUS_LABELS,
  PaymentStatus,
} from '../service/payments.types';

const STATUS_FILTERS: Array<{ key: 'TODOS' | PaymentStatus; label: string }> = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'PENDING', label: 'Pendiente' },
  { key: 'PAID', label: 'Pagado' },
  { key: 'FAILED', label: 'Fallido' },
  { key: 'CANCELLED', label: 'Cancelado' },
];

const formatCurrency = (amount: number) =>
  '$' + amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusVariant = (status: PaymentStatus): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

const PaymentCard = React.memo(
  ({
    item,
    onPay,
    payingId,
    onNav,
  }: {
    item: IPayment;
    onPay: (id: string) => Promise<void>;
    payingId: string | null;
    onNav: (screen: string, params: any) => void;
  }) => {
    const residentName = item.resident?.user
      ? `${item.resident.user.name} ${item.resident.user.lastName ?? ''}`.trim()
      : '—';
    const initial = residentName.charAt(0).toUpperCase();
    const isPaying = payingId === item.id;

    return (
      <ITCard
        style={styles.itemCard}
        onPress={() => onNav('PAYMENT_DETAIL', { paymentId: item.id })}
        mode="elevated"
      >
        <View style={styles.cardTop}>
          <View style={styles.avatarContainer}>
            <ITText style={styles.avatarText}>{initial}</ITText>
          </View>
          <View style={styles.cardInfoCol}>
            <ITText
              variant="titleSmall"
              weight="700"
              color={theme.colors.slate900}
              numberOfLines={1}
            >
              {residentName}
            </ITText>
            <View style={styles.badgeRow}>
              <ITBadge
                label={PAYMENT_STATUS_LABELS[item.status]}
                variant={statusVariant(item.status)}
                size="small"
                dot
              />
              <ITText variant="labelSmall" color={theme.colors.slate500} numberOfLines={1}>
                {item.fee?.name || 'Cuota'}
              </ITText>
            </View>
          </View>
          <View style={styles.amountWrap}>
            <ITText variant="titleMedium" weight="bold" color={theme.colors.slate900}>
              {formatCurrency(Number(item.amount))}
            </ITText>
          </View>
        </View>
        <View style={styles.cardBody}>
          {item.period && (
            <View style={styles.infoItem}>
              <Icon source="calendar-month-outline" size={16} color={theme.colors.slate500} />
              <ITText variant="bodySmall" color="#334155" style={styles.infoText}>
                {dayjs(item.period).format('MMMM YYYY')}
              </ITText>
            </View>
          )}
          {item.paidAt && (
            <View style={styles.infoItem}>
              <Icon source="check-circle-outline" size={16} color={theme.colors.slate500} />
              <ITText variant="bodySmall" color="#334155" style={styles.infoText}>
                Pagado {dayjs(item.paidAt).format('DD MMM YYYY')}
              </ITText>
            </View>
          )}
          <View style={styles.infoItem}>
            <Icon source="clock-outline" size={16} color={theme.colors.slate500} />
            <ITText variant="bodySmall" color="#334155" style={styles.infoText}>
              Creado {dayjs(item.createdAt).format('DD MMM YYYY')}
            </ITText>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <ITTouchableOpacity
            style={styles.footerBtn}
            onPress={() => onNav('PAYMENT_DETAIL', { paymentId: item.id })}
          >
            <Icon source="eye-outline" size={18} color={theme.colors.primary} />
            <ITText style={styles.footerBtnText}>Ver</ITText>
          </ITTouchableOpacity>
          {item.status === 'PENDING' && (
            <>
              <View style={styles.footerDivider} />
              <ITTouchableOpacity
                style={styles.footerBtn}
                onPress={() => onPay(item.id)}
                disabled={isPaying}
              >
                {isPaying ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Icon source="credit-card-outline" size={18} color={theme.colors.primary} />
                )}
                <ITText style={styles.footerBtnText}>
                  {isPaying ? 'Pagando...' : 'Pagar'}
                </ITText>
              </ITTouchableOpacity>
            </>
          )}
          {item.status === 'PAID' && (
            <>
              <View style={styles.footerDivider} />
              <ITTouchableOpacity
                style={styles.footerBtn}
                onPress={() => onNav('PAYMENT_RECEIPT', { paymentId: item.id })}
              >
                <Icon source="file-pdf-box" size={18} color={theme.colors.primary} />
                <ITText style={styles.footerBtnText}>PDF</ITText>
              </ITTouchableOpacity>
            </>
          )}
        </View>
      </ITCard>
    );
  },
);

export const PaymentsListScreen = () => {
  const dispatch = useAppDispatch();
  const { navigateToScreen } = useAppNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const userRole = useAppSelector(state => state.userState.role);

  const [payments, setPayments] = useState<IPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'TODOS' | PaymentStatus>('TODOS');
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState<IPaymentSummary | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const isAdmin = userRole === 'ADMINI' || userRole === 'LIDER';

  const fetchData = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      try {
        if (pageNum === 1) setLoading(true);

        const filters: Record<string, unknown> = {};
        if (statusFilter !== 'TODOS') filters.status = statusFilter;
        if (search) filters.search = search;

        const [listRes, summaryRes] = await Promise.all([
          getPaginatedPayments({ page: pageNum, limit: 10, filters }),
          pageNum === 1
            ? getPaymentSummary().catch(() => null)
            : Promise.resolve(null),
        ]);

        if (listRes.success && listRes.data) {
          setPayments(prev =>
            pageNum === 1 ? listRes.data.rows : [...prev, ...listRes.data.rows],
          );
          setTotal(listRes.data.total);
          setPage(pageNum);
        } else {
          dispatch(
            showToast({
              message: listRes.messages?.[0] || 'Error al cargar pagos',
              type: 'error',
            }),
          );
        }

        if (summaryRes && summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data);
        }
      } catch {
        dispatch(showToast({ message: 'Error de conexión', type: 'error' }));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, search, dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchData(1);
    }, [fetchData]),
  );

  const handlePay = useCallback(
    async (paymentId: string) => {
      setPayingId(paymentId);
      try {
        const intentRes = await createPaymentIntent(paymentId);
        if (!intentRes.success || !intentRes.data) {
          dispatch(
            showToast({
              message: intentRes.messages?.[0] || 'Error al pagar',
              type: 'error',
            }),
          );
          return;
        }
        const { clientSecret, customerId, ephemeralKey } = intentRes.data;
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          customerId,
          customerEphemeralKeySecret: ephemeralKey,
          merchantDisplayName: 'AXZY CHECK',
          style: 'automatic',
        });
        if (initError) {
          dispatch(
            showToast({
              message: initError.message ?? 'Error',
              type: 'error',
            }),
          );
          return;
        }
        const { error: payError } = await presentPaymentSheet();
        if (payError) {
          if (payError.code !== 'Canceled')
            dispatch(
              showToast({
                message: payError.message ?? 'Cancelado',
                type: 'error',
              }),
            );
          return;
        }
        const verifyRes = await verifyPayment(paymentId);
        if (verifyRes.success && verifyRes.data?.status === 'PAID') {
          navigateToScreen('PAYMENTS_STACK', 'PAYMENT_RECEIPT', {
            paymentId,
          });
          return;
        }
        navigateToScreen('PAYMENTS_STACK', 'PAYMENT_RECEIPT', {
          paymentId,
        });
      } catch (err: any) {
        dispatch(
          showToast({
            message: err?.message || 'Error inesperado',
            type: 'error',
          }),
        );
      } finally {
        setPayingId(null);
      }
    },
    [initPaymentSheet, presentPaymentSheet, dispatch, navigateToScreen],
  );

  const renderItem = useCallback(
    ({ item }: { item: IPayment }) => (
      <PaymentCard
        item={item}
        onPay={handlePay}
        payingId={payingId}
        onNav={(screen, params) =>
          navigateToScreen('PAYMENTS_STACK', screen, params)
        }
      />
    ),
    [handlePay, payingId, navigateToScreen],
  );

  const kpiSection = useMemo(
    () =>
      summary ? (
        <View style={styles.summarySection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ITText
                variant="titleLarge"
                weight="bold"
                color="#10B981"
              >
                {formatCurrency(summary.paid?.total ?? 0)}
              </ITText>
              <ITText variant="labelSmall" color={theme.colors.slate500}>
                Cobrado
              </ITText>
            </View>
            <View style={styles.statCard}>
              <ITText
                variant="titleLarge"
                weight="bold"
                color="#F59E0B"
              >
                {formatCurrency(summary.pending?.total ?? 0)}
              </ITText>
              <ITText variant="labelSmall" color={theme.colors.slate500}>
                Pendiente
              </ITText>
            </View>
            <View style={styles.statCard}>
              <ITText
                variant="titleLarge"
                weight="bold"
                color="#EF4444"
              >
                {formatCurrency(summary.overdue?.total ?? 0)}
              </ITText>
              <ITText variant="labelSmall" color={theme.colors.slate500}>
                Vencido
              </ITText>
            </View>
          </View>
        </View>
      ) : null,
    [summary],
  );

  return (
    <View style={styles.container}>
      <ITScreenDatatableLayout<IPayment>
        title={isAdmin ? 'Control de Pagos' : 'Mis Pagos'}
        totalItems={total}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchData(1);
        }}
        onLoadMore={() => {
          if (page * 10 < total) fetchData(page + 1);
        }}
        searchQuery={search}
        onSearchChange={setSearch}
        searchBar={
          <Searchbar
            placeholder="Buscar por concepto o residente..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
            placeholderTextColor="#94A3B8"
            elevation={0}
          />
        }
        filterBadges={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesRow}
          >
            {STATUS_FILTERS.map(sf => (
              <ITTouchableOpacity key={sf.key} onPress={() => setStatusFilter(sf.key)}>
                <ITBadge
                  label={sf.label}
                  variant={statusFilter === sf.key ? 'primary' : 'default'}
                  size="small"
                />
              </ITTouchableOpacity>
            ))}
          </ScrollView>
        }
        data={payments}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        emptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
            <Icon source="cash-off" size={64} color="#E2E8F0" />
            <ITText variant="bodyMedium" color={theme.colors.slate400}>
              No hay pagos
            </ITText>
          </View>
        }
      >
        {kpiSection}
      </ITScreenDatatableLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  summarySection: { paddingHorizontal: 20, paddingVertical: 16 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  badgesRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  searchBar: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    minHeight: 0,
    fontSize: 14,
    color: '#0F172A',
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: theme.colors.primary },
  cardInfoCol: {
    flex: 1,
    marginRight: 8,
    gap: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountWrap: {
    flexShrink: 0,
    paddingLeft: 4,
  },
  cardBody: { gap: 6, marginBottom: 16 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  infoText: { fontSize: 12, fontWeight: '500' },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  footerDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0' },
});
