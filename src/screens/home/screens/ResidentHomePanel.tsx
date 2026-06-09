import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store/redux.config';
import { ITBadge, ITCard, ITText } from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import { HomeItemComponent } from '../components/HomeItemComponent';
import { fetchDashboardData } from '../service/DashboardService';
import type { DashboardData } from '../types/HomeTypes';

const formatCurrency = (n: number) => {
  try {
    return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch {
    return '$' + n;
  }
};

export const ResidentHomePanel = () => {
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.userState);

  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setLoading(true);
    try {
      const result = await fetchDashboardData();
      setData(result);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const counts = data?.counts;
  const paidAmount = counts?.paymentsPaidAmount ?? 0;
  const pendingAmount = counts?.paymentsPendingAmount ?? 0;
  const pendingIncidents = counts?.pendingIncidents ?? 0;
  const activePasses = counts?.activePasses ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={theme.colors.primary} />
        }
      >
        {/* Welcome Header */}
        <LinearGradient
          colors={['#065911', '#046a38', '#03582e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerIcon}>
              <Icon source="home-city-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <ITText variant="titleMedium" weight="bold" color="#FFFFFF">
                Bienvenido{user.fullName ? ',' : ''}
              </ITText>
              {user.fullName && (
                <ITText variant="bodyLarge" weight="bold" color="#FFFFFF">
                  {user.fullName}
                </ITText>
              )}
              <ITText variant="labelSmall" color="rgba(255,255,255,0.6)">
                {dayjs().format('DD MMM YYYY')}
              </ITText>
            </View>
          </View>
        </LinearGradient>

        {/* Summary KPIs */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: '#F0FDF4' }]}>
            <View style={styles.kpiTop}>
              <Icon source="cash-check" size={18} color="#10B981" />
              <ITBadge label="Pagado" variant="success" size="small" dot />
            </View>
            <ITText variant="titleMedium" weight="bold" color="#065F46">
              {formatCurrency(paidAmount)}
            </ITText>
            <ITText variant="labelSmall" color="#6EE7B7">
              Pagos realizados
            </ITText>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#FFFBEB' }]}>
            <View style={styles.kpiTop}>
              <Icon source="cash-remove" size={18} color="#F59E0B" />
              <ITBadge label="Pendiente" variant="warning" size="small" dot />
            </View>
            <ITText variant="titleMedium" weight="bold" color="#92400E">
              {formatCurrency(pendingAmount)}
            </ITText>
            <ITText variant="labelSmall" color="#FCD34D">
              Por pagar
            </ITText>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: '#FEF2F2' }]}>
            <View style={styles.kpiTop}>
              <Icon source="alert-circle-outline" size={18} color="#EF4444" />
              <ITBadge label={String(pendingIncidents)} variant="error" size="small" />
            </View>
            <ITText variant="titleMedium" weight="bold" color="#991B1B">
              Incidencias
            </ITText>
            <ITText variant="labelSmall" color="#FCA5A5">
              {pendingIncidents === 1 ? '1 pendiente' : `${pendingIncidents} pendientes`}
            </ITText>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#E0F2FE' }]}>
            <View style={styles.kpiTop}>
              <Icon source="key-variant" size={18} color="#0EA5E9" />
              <ITBadge label={String(activePasses)} variant="info" size="small" />
            </View>
            <ITText variant="titleMedium" weight="bold" color="#0C4A6E">
              Pases activos
            </ITText>
            <ITText variant="labelSmall" color="#7DD3FC">
              {activePasses === 1 ? '1 activo' : `${activePasses} activos`}
            </ITText>
          </View>
        </View>

        {/* Module Grid */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <ITText variant="labelLarge" weight="bold" color={theme.colors.slate700}>
            MÓDULOS
          </ITText>
        </View>

        <View style={styles.moduleGrid}>
          <View style={styles.moduleRow}>
            <View style={styles.moduleItem}>
              <HomeItemComponent
                icon="door-open"
                label="Control de Accesos"
                stack="ACCESSES_STACK"
                screen="ACCESSES_LIST"
                color="#F59E0B"
              />
            </View>
            <View style={styles.moduleItem}>
              <HomeItemComponent
                icon="email-alert-outline"
                label="Buzón de Quejas"
                stack="COMPLAINTS_STACK"
                screen="COMPLAINTS_LIST"
                color="#EF4444"
              />
            </View>
          </View>
          <View style={styles.moduleRow}>
            <View style={styles.moduleItem}>
              <HomeItemComponent
                icon="cash-multiple"
                label="Estado de Cuenta"
                stack="PAYMENTS_STACK"
                screen="PAYMENTS_LIST"
                color="#065911"
              />
            </View>
            <View style={styles.moduleItem}>
              <HomeItemComponent
                icon="phone-outline"
                label="Mis Contactos"
                stack="CONTACTS_STACK"
                screen="CONTACTS_LIST"
                color={theme.colors.primary}
              />
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Icon source="shield-check" size={14} color="#CBD5E1" />
          <ITText variant="labelSmall" color="#CBD5E1">
            Residencial AXZY CHECK
          </ITText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  kpiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  moduleGrid: {
    paddingHorizontal: 12,
    gap: 10,
  },
  moduleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  moduleItem: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 24,
    marginTop: 16,
  },
});
