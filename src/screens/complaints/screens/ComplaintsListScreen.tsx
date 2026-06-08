import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { FAB, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';
import { RootState } from '../../../core/store/store';
import { UserRole } from '../../../core/types/IUser';
import { useAppNavigation } from '../../../navigation/hooks/useAppNavigation';
import {
  ITBadge,
  ITScreenDatatableLayout,
  ITText,
  ITTouchableOpacity,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import { getPaginatedComplaints } from '../service/complaints.service';
import { ComplaintStatus, IComplaint, COMPLAINT_STATUS_LABELS } from '../service/complaints.types';

const STATUS_OPTIONS: Array<{ label: string; value: ComplaintStatus | 'all' }> = [
  { label: 'TODOS', value: 'all' },
  { label: 'Abierto', value: 'OPEN' },
  { label: 'En Progreso', value: 'IN_PROGRESS' },
  { label: 'Resuelto', value: 'RESOLVED' },
  { label: 'Cerrado', value: 'CLOSED' },
];

const statusVariant = (
  status: string,
): 'primary' | 'warning' | 'info' | 'success' | 'error' | 'default' => {
  switch (status) {
    case 'OPEN':
      return 'warning';
    case 'IN_PROGRESS':
      return 'info';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'default';
    default:
      return 'default';
  }
};

export const ComplaintsListScreen = () => {
  const { navigateToScreen } = useAppNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.userState);
  const isResident = user.role === UserRole.RESDN;

  const [complaints, setComplaints] = useState<IComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  const fetchData = useCallback(
    async (pageNum = 1) => {
      try {
        if (pageNum === 1) setLoading(true);

        const filters: Record<string, unknown> = {};
        if (search) filters.title = search;
        if (statusFilter !== 'all') filters.status = statusFilter;

        const res = await getPaginatedComplaints({
          page: pageNum,
          limit: 10,
          filters,
        });

        if (res.success && res.data) {
          setComplaints(prev =>
            pageNum === 1 ? res.data.rows : [...prev, ...res.data.rows],
          );
          setTotal(res.data.total || 0);
          setPage(pageNum);
        }
      } catch {
        dispatch(
          showToast({ message: 'Error al cargar quejas', type: 'error' }),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter, dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchData(1);
    }, [fetchData]),
  );

  const renderItem = ({ item }: { item: IComplaint }) => (
    <ITTouchableOpacity
      style={styles.card}
      onPress={() =>
        navigateToScreen('COMPLAINTS_STACK', 'COMPLAINT_DETAIL', {
          complaintId: item.id,
        })
      }
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <ITText
            variant="bodyLarge"
            weight="bold"
            color="#0F172A"
            style={styles.subjectText}
            numberOfLines={1}
          >
            {item.title}
          </ITText>
          <ITBadge
            label={COMPLAINT_STATUS_LABELS[item.status]}
            variant={statusVariant(item.status)}
            size="small"
          />
        </View>

        <View style={styles.cardMeta}>
          <ITBadge
            label={item.category?.name || '—'}
            variant="primary"
            size="small"
            outline
          />
          <ITText variant="labelSmall" color="#94A3B8">
            {item.createdAt
              ? dayjs(item.createdAt).format('DD MMM YYYY')
              : '—'}
          </ITText>
        </View>

        <ITText
          variant="bodySmall"
          color="#64748B"
          numberOfLines={2}
          style={styles.description}
        >
          {item.description}
        </ITText>
      </View>
    </ITTouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ITScreenDatatableLayout
        title="Buzón de Quejas"
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
        showSearchBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchBar={
          <Searchbar
            placeholder="Buscar queja..."
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
            {STATUS_OPTIONS.map(opt => (
              <ITTouchableOpacity
                key={opt.value}
                onPress={() => setStatusFilter(opt.value)}
              >
                <ITBadge
                  label={opt.label}
                  variant={
                    statusFilter === opt.value
                      ? statusVariant(opt.value)
                      : 'default'
                  }
                  size="small"
                />
              </ITTouchableOpacity>
            ))}
          </ScrollView>
        }
        data={complaints}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        fab={
          isResident ? (
            <FAB
              icon="plus"
              style={styles.fab}
              color="#FFFFFF"
              onPress={() =>
                navigateToScreen('COMPLAINTS_STACK', 'COMPLAINT_FORM')
              }
            />
          ) : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
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
  badgesRow: {
    paddingVertical: 4,
    gap: 8,
    paddingRight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectText: {
    flex: 1,
    marginRight: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  description: {
    lineHeight: 18,
  },
});
