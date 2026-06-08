import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { useAppNavigation } from '../../../navigation/hooks/useAppNavigation';
import { showToast } from '../../../core/store/slices/toast.slice';
import { RootState } from '../../../core/store/redux.config';
import { UserRole } from '../../../core/types/IUser';
import { ITScreenWrapper } from '../../../shared/components';
import { fetchDashboardData } from '../service/DashboardService';
import { HomeItemComponent } from '../components/HomeItemComponent';
import type { DashboardData } from '../types/HomeTypes';
import { GuardDashboard } from './GuardDashboard';
import { ResidentHomePanel } from './ResidentHomePanel';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 5;

const formatCurrency = (n: number) => {
  try {
    return '$' + n.toLocaleString('es-MX');
  } catch {
    return '$' + n;
  }
};

const formatTimeAgo = (iso?: string) => {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffMin < 1440) return `hace ${Math.floor(diffMin / 60)} h`;
  const d = new Date(iso);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`;
};

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`;
};

const currentDateStr = (() => {
  const d = new Date();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
})();

type Role = UserRole.ADMIN | UserRole.SHIFT | UserRole.RESDN;

interface ModuleItem {
  id: string;
  label: string;
  icon: string;
  stack: string;
  screen: string;
  color: string;
  roles: Role[];
}

const ALL_MODULES: ModuleItem[] = [
  { id: 'locations', label: 'Ubicaciones', icon: 'map-marker-outline', stack: 'LOCATIONS_STACK', screen: 'LOCATIONS_MAIN', color: '#0EA5E9', roles: [UserRole.ADMIN, UserRole.SHIFT] },
  { id: 'residents', label: 'Residentes', icon: 'account-group-outline', stack: 'RESIDENTS_STACK', screen: 'RESIDENTS_LIST', color: '#46a545', roles: [UserRole.ADMIN] },
  { id: 'properties', label: 'Propiedades', icon: 'home-outline', stack: 'PROPERTIES_STACK', screen: 'PROPERTIES_LIST', color: '#64748B', roles: [UserRole.ADMIN] },
  { id: 'accesses', label: 'Accesos', icon: 'door-open', stack: 'ACCESSES_STACK', screen: 'ACCESSES_LIST', color: '#F59E0B', roles: [UserRole.ADMIN, UserRole.RESDN, UserRole.SHIFT] },
  { id: 'rounds', label: 'Recorridos', icon: 'map-marker-distance', stack: 'ROUNDS_STACK', screen: 'ROUNDS_LIST', color: '#10B981', roles: [UserRole.ADMIN, UserRole.SHIFT] },
  { id: 'routes', label: 'Config. Rondas', icon: 'repeat', stack: 'RECURRING_STACK', screen: 'RECURRING_LIST', color: '#0EA5E9', roles: [UserRole.ADMIN, UserRole.SHIFT] },
  { id: 'incidents', label: 'Incidencias', icon: 'alert-circle-outline', stack: 'INCIDENTS_STACK', screen: 'INCIDENT_LIST', color: '#EF4444', roles: [UserRole.ADMIN, UserRole.SHIFT, UserRole.RESDN] },
  { id: 'maintenance', label: 'Mantenimiento', icon: 'wrench-outline', stack: 'MAINTENANCE_STACK', screen: 'MAINTENANCE_LIST', color: '#F59E0B', roles: [UserRole.ADMIN, UserRole.SHIFT] },
  { id: 'kardex', label: 'Kardex', icon: 'book-outline', stack: 'Tabs', screen: 'Kardex', color: '#64748B', roles: [UserRole.ADMIN, UserRole.SHIFT] },
  { id: 'guards', label: 'Guardias', icon: 'shield-check', stack: 'GUARDS_STACK', screen: 'GUARD_LIST', color: '#065911', roles: [UserRole.ADMIN, UserRole.SHIFT] },
  { id: 'schedules', label: 'Horarios', icon: 'calendar-clock', stack: 'SCHEDULES_STACK', screen: 'SCHEDULES_LIST', color: '#0EA5E9', roles: [UserRole.ADMIN, UserRole.SHIFT] },
  { id: 'users', label: 'Usuarios', icon: 'account-plus', stack: 'USERS_STACK', screen: 'USER_LIST', color: '#46a545', roles: [UserRole.ADMIN] },
  { id: 'settings', label: 'Catálogos', icon: 'cog-outline', stack: 'SETTINGS_STACK', screen: 'SETTINGS_LIST', color: '#64748B', roles: [UserRole.ADMIN] },
  { id: 'complaints', label: 'Buzón', icon: 'email-alert-outline', stack: 'COMPLAINTS_STACK', screen: 'COMPLAINTS_LIST', color: '#EF4444', roles: [UserRole.ADMIN, UserRole.RESDN] },
  { id: 'payments', label: 'Pagos', icon: 'cash-multiple', stack: 'PAYMENTS_STACK', screen: 'PAYMENTS_LIST', color: '#065911', roles: [UserRole.ADMIN, UserRole.RESDN] },
  { id: 'fees', label: 'Cuotas', icon: 'currency-usd', stack: 'FEES_STACK', screen: 'FEES_LIST', color: '#F59E0B', roles: [UserRole.ADMIN] },
  { id: 'reports', label: 'Reportes', icon: 'file-chart-outline', stack: 'REPORTS_STACK', screen: 'REPORTS_LIST', color: '#64748B', roles: [UserRole.ADMIN] },
  { id: 'contacts', label: 'Contactos', icon: 'phone-outline', stack: 'CONTACTS_STACK', screen: 'CONTACTS_LIST', color: '#46a545', roles: [UserRole.RESDN] },
];

interface KpiConfig {
  key: 'residents' | 'overduePayments' | 'activePasses' | 'guards' | 'pendingIncidents';
  label: string;
  icon: string;
  color: string;
  bg: string;
}

const KPI_CONFIG: KpiConfig[] = [
  { key: 'residents', label: 'Residentes', icon: 'account-group', color: '#46a545', bg: '#E8F5E9' },
  { key: 'overduePayments', label: 'Cuotas vencidas', icon: 'cash-remove', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'activePasses', label: 'Pases activos', icon: 'key-variant', color: '#0EA5E9', bg: '#E0F2FE' },
  { key: 'guards', label: 'Guardias', icon: 'shield-check', color: '#065911', bg: '#E8F5E9' },
  { key: 'pendingIncidents', label: 'Incidencias', icon: 'alert-circle', color: '#EF4444', bg: '#FEF2F2' },
];

const SkeletonPulse = ({ width: w, height = 14, style = {} }: { width: number | string; height?: number; style?: object }) => {
  const fade = useRef(new Animated.Value(0.3)).current;
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fade]);
  return <Animated.View style={[{ width: w, height, borderRadius: 6, backgroundColor: '#E2E8F0', opacity: fade }, style]} />;
};

const HomeSkeleton = () => (
  <View style={skeletonStyles.container}>
    <SkeletonPulse width="60%" height={20} />
    <SkeletonPulse width="40%" height={12} style={{ marginTop: 6 }} />
    <View style={skeletonStyles.kpiRow}>
      <SkeletonPulse width={140} height={56} style={{ borderRadius: 12 }} />
      <SkeletonPulse width={140} height={56} style={{ borderRadius: 12 }} />
    </View>
    <SkeletonPulse width="100%" height={120} style={{ borderRadius: 16, marginTop: 16 }} />
    <SkeletonPulse width="100%" height={160} style={{ borderRadius: 16, marginTop: 12 }} />
    <View style={skeletonStyles.gridRow}>
      {[1, 2, 3].map(i => (
        <SkeletonPulse key={i} width="31%" height={90} style={{ borderRadius: 24 }} />
      ))}
    </View>
  </View>
);

export const HomeScreen = () => {
  const user = useSelector((state: RootState) => state.userState);
  const dispatch = useDispatch();
  const nav = useNavigation<any>();
  const { navigateToScreen } = useAppNavigation();

  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const checkFirstSync = async () => {
      try {
        const currentRole = user.role as UserRole;
        if (![UserRole.GUARD, UserRole.MAINT].includes(currentRole)) return;
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const lastSync = await AsyncStorage.getItem('last_sync_timestamp');
        if (!lastSync) {
          nav.navigate('SYNC_SCREEN');
        }
      } catch {}
    };
    checkFirstSync();
  }, [nav, user.role]);

  if (![UserRole.ADMIN, UserRole.RESDN, UserRole.SHIFT].includes(user.role as UserRole)) {
    return <GuardDashboard />;
  }

  if (user.role === UserRole.RESDN) {
    return <ResidentHomePanel />;
  }

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setLoading(true);
    try {
      const result = await fetchDashboardData();
      setData(result);
    } catch (error: any) {
      dispatch(showToast({
        type: 'error',
        message: error?.messages?.[0] || 'Error al cargar el panel',
      }));
    } finally {
      setTimeout(() => {
        setLoading(false);
        setRefreshing(false);
      }, 400);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {};
    }, [user.role]),
  );

  const counts = data?.counts;
  const recentIncidents = data?.recentIncidents ?? [];
  const recentPayments = data?.recentPayments ?? [];

  const filteredModules = ALL_MODULES.filter(m => m.roles.includes(user.role as Role));

  const goToModule = (item: ModuleItem) => {
    navigateToScreen(item.stack as any, item.screen as any);
  };

  if (loading) {
    return (
      <ITScreenWrapper scrollable={false} padding={false} style={{ backgroundColor: '#F8FAFC' }}>
        <HomeSkeleton />
      </ITScreenWrapper>
    );
  }

  const pendingIncidents = counts?.pendingIncidents ?? 0;

  return (
    <ITScreenWrapper scrollable={false} padding={false} style={{ backgroundColor: '#F8FAFC' }} roundedTop>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        <LinearGradient
          colors={['#065911', '#0A7A1A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={headerStyles.gradient}
        >
          <View style={headerStyles.row}>
            <View style={headerStyles.iconBox}>
              <Icon source="shield-check" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={headerStyles.titleRow}>
                <Text style={headerStyles.title}>Panel de Control</Text>
                <Text style={headerStyles.dot}>·</Text>
                <Text style={headerStyles.brand}>AXZY CHECK</Text>
              </View>
              <Text style={headerStyles.date}>{currentDateStr}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={kpiStyles.row}
            style={{ marginTop: 0 }}
          >
            {KPI_CONFIG.map(kpi => {
              const value = counts ? String(counts[kpi.key] ?? 0) : '—';
              return (
                <View key={kpi.key} style={[kpiStyles.card, { backgroundColor: kpi.bg }]}>
                  <View style={[kpiStyles.iconCircle, { backgroundColor: kpi.color + '22' }]}>
                    <Icon source={kpi.icon} size={16} color={kpi.color} />
                  </View>
                  <View style={kpiStyles.textGroup}>
                    <Text style={kpiStyles.label} numberOfLines={1}>{kpi.label}</Text>
                    <Text style={[kpiStyles.value, { color: kpi.color }]}>{value}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={sectionStyles.card}>
            <View style={sectionStyles.header}>
              <View style={{ flex: 1 }}>
                <Text style={sectionStyles.title}>Resumen de pagos</Text>
                <Text style={sectionStyles.subtitle}>Estado de cuenta global</Text>
              </View>
            </View>
            <View style={paymentStyles.grid}>
              <View style={[paymentStyles.subCard, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}>
                <Text style={paymentStyles.subLabel}>Cobrado</Text>
                <Text style={paymentStyles.subValue}>
                  {formatCurrency(counts?.paymentsPaidAmount ?? 0)}
                </Text>
                <Text style={paymentStyles.subCount}>{counts?.paymentsPaid ?? 0} pagos</Text>
              </View>
              <View style={[paymentStyles.subCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Text style={paymentStyles.subLabel}>Por cobrar</Text>
                <Text style={paymentStyles.subValue}>
                  {formatCurrency(counts?.paymentsPendingAmount ?? 0)}
                </Text>
                <Text style={paymentStyles.subCount}>{counts?.paymentsPending ?? 0} pend.</Text>
              </View>
              <View style={[paymentStyles.subCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <Text style={paymentStyles.subLabel}>Atrasado</Text>
                <Text style={[paymentStyles.subValue, { color: '#DC2626' }]}>
                  {formatCurrency(counts?.overduePaymentsAmount ?? 0)}
                </Text>
                <Text style={paymentStyles.subCount}>{counts?.overduePayments ?? 0} venc.</Text>
              </View>
            </View>

            {recentPayments.length > 0 && (
              <View style={paymentStyles.recentSection}>
                <View style={paymentStyles.recentHeader}>
                  <Text style={paymentStyles.recentTitle}>Pagos recientes</Text>
                  <TouchableOpacity onPress={() => navigateToScreen('PAYMENTS_STACK' as any, 'PAYMENTS_LIST' as any)}>
                    <Text style={paymentStyles.seeAll}>Ver todos →</Text>
                  </TouchableOpacity>
                </View>
                {recentPayments.map(p => (
                  <View key={p.id} style={paymentStyles.paymentRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={paymentStyles.paymentName} numberOfLines={1}>
                        {p.resident?.name ?? 'Residente'} {p.resident?.lastName ?? ''}
                      </Text>
                      <Text style={paymentStyles.paymentMeta}>
                        {p.fee?.name ?? 'Cuota'} · {formatDate(p.createdAt)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={paymentStyles.paymentValue}>{formatCurrency(Number(p.amount ?? 0))}</Text>
                      <View style={paymentStyles.paidBadge}>
                        <Icon source="check-circle" size={9} color="#065911" />
                        <Text style={paymentStyles.paidText}>Pagado</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={sectionStyles.card}>
            <View style={sectionStyles.header}>
              <View style={{ flex: 1 }}>
                <Text style={sectionStyles.title}>Incidencias</Text>
                <Text style={sectionStyles.subtitle}>Pendientes en curso</Text>
              </View>
              <View style={[incidentStyles.countBadge, { backgroundColor: pendingIncidents > 0 ? '#FEF2F2' : '#F0FDF4' }]}>
                <Text style={[incidentStyles.countText, { color: pendingIncidents > 0 ? '#DC2626' : '#065911' }]}>
                  {pendingIncidents}
                </Text>
              </View>
            </View>
            {recentIncidents.length === 0 ? (
              <View style={incidentStyles.empty}>
                <Icon source="check-circle" size={24} color="#065911" />
                <Text style={incidentStyles.emptyText}>Sin incidencias pendientes</Text>
              </View>
            ) : (
              <>
                {recentIncidents.map(inc => (
                  <TouchableOpacity
                    key={inc.id}
                    style={incidentStyles.item}
                    onPress={() => navigateToScreen('INCIDENTS_STACK' as any, 'INCIDENT_LIST' as any)}
                  >
                    <View style={incidentStyles.dot} />
                    <View style={{ flex: 1 }}>
                      <Text style={incidentStyles.itemTitle} numberOfLines={1}>{inc.title}</Text>
                      <Text style={incidentStyles.itemMeta}>
                        {inc.category?.name ?? '—'}
                        {inc.guard?.name ? ` · ${inc.guard.name}` : ''}
                      </Text>
                    </View>
                    <Text style={incidentStyles.timeAgo}>{formatTimeAgo(inc.createdAt)}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={incidentStyles.footer}
                  onPress={() => navigateToScreen('INCIDENTS_STACK' as any, 'INCIDENT_LIST' as any)}
                >
                  <Text style={incidentStyles.footerText}>Ver módulo completo →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={moduleGridStyles.section}>
            <View style={moduleGridStyles.header}>
              <View style={moduleGridStyles.headerLeft}>
                <View style={moduleGridStyles.bullet} />
                <Text style={moduleGridStyles.title}>Módulos</Text>
              </View>
              <View style={moduleGridStyles.countBadge}>
                <Text style={moduleGridStyles.countText}>{filteredModules.length} disponibles</Text>
              </View>
            </View>
            <View style={moduleGridStyles.grid}>
              {filteredModules.map(item => (
                <View key={item.id} style={moduleGridStyles.item}>
                  <HomeItemComponent
                    icon={item.icon}
                    label={item.label}
                    stack={item.stack}
                    screen={item.screen}
                    color={item.color}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ITScreenWrapper>
  );
};

const skeletonStyles = StyleSheet.create({
  container: { padding: 20 },
  kpiRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  gridRow: { flexDirection: 'row', gap: 8, marginTop: 20, justifyContent: 'space-between' },
});

const headerStyles = StyleSheet.create({
  gradient: {
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  dot: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  brand: { color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 0.5, fontWeight: '500', textTransform: 'uppercase' },
  date: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500', marginTop: 2 },
});

const kpiStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textGroup: { flex: 1 },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 1,
  },
});

const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});

const paymentStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  subCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  subValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 2,
  },
  subCount: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  recentSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  recentTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  seeAll: {
    fontSize: 9,
    fontWeight: '700',
    color: '#46a545',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  paymentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  paymentMeta: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  paidText: {
    fontSize: 9,
    color: '#64748B',
  },
});

const incidentStyles = StyleSheet.create({
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginTop: 2,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemMeta: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  timeAgo: {
    fontSize: 10,
    color: '#94A3B8',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#46a545',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});

const moduleGridStyles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#46a545',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -ITEM_MARGIN,
  },
  item: {
    width: '33.33%',
    paddingHorizontal: ITEM_MARGIN,
    marginBottom: 10,
  },
});
