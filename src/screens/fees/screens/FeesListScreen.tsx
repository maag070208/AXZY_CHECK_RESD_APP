import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Searchbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';
import { useAppNavigation } from '../../../navigation/hooks/useAppNavigation';
import {
  ITAlert,
  ITBadge,
  ITScreenDatatableLayout,
  ITText,
  ITTouchableOpacity,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  getPaginatedFees,
  deleteFee,
} from '../service/fees.service';
import { IFee } from '../service/fees.types';

export const FeesListScreen = () => {
  const { navigateToScreen } = useAppNavigation();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [fees, setFees] = useState<IFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(
    async (pageNum = 1) => {
      try {
        if (pageNum === 1) setLoading(true);

        const filters: Record<string, unknown> = {};
        if (search) filters.name = search;

        const res = await getPaginatedFees({
          page: pageNum,
          limit: 10,
          filters,
        });

        if (res.success && res.data) {
          setFees(prev =>
            pageNum === 1 ? res.data.rows : [...prev, ...res.data.rows],
          );
          setTotal(res.data.total || 0);
          setPage(pageNum);
        }
      } catch {
        dispatch(
          showToast({ message: 'Error al cargar cuotas', type: 'error' }),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchData(1);
    }, [fetchData]),
  );

  const handleDeletePress = (id: string) => {
    setFeeToDelete(id);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!feeToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteFee(feeToDelete);
      if (res.success) {
        dispatch(showToast({ message: 'Cuota eliminada', type: 'success' }));
        fetchData(1);
      } else {
        dispatch(showToast({ message: 'Error al eliminar', type: 'error' }));
      }
    } catch {
      dispatch(showToast({ message: 'Error inesperado', type: 'error' }));
    } finally {
      setIsDeleting(false);
      setDeleteDialogVisible(false);
      setFeeToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return (
      '$' +
      amount.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  const renderItem = ({ item }: { item: IFee }) => (
    <ITTouchableOpacity
      style={styles.card}
      onPress={() =>
        navigateToScreen('FEES_STACK', 'FEE_FORM', { feeId: item.id })
      }
    >
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <ITText variant="bodyLarge" weight="bold" color="#0F172A">
            {item.name}
          </ITText>
          <ITText variant="bodySmall" color="#64748B">
            {item.description || '—'}
          </ITText>
          <View style={styles.metaRow}>
            <ITBadge label={item.type === 'MONTHLY' ? 'MENSUAL' : 'ÚNICO'} variant="primary" size="small" />
            <ITBadge
              label={item.active ? 'Activo' : 'Inactivo'}
              variant={item.active ? 'primary' : 'secondary'}
              size="small"
            />
          </View>
        </View>
        <View style={styles.cardRight}>
          <ITText variant="titleMedium" weight="bold" color="#0F172A">
            {formatCurrency(item.amount)}
          </ITText>
          <ITTouchableOpacity
            onPress={() => handleDeletePress(item.id)}
            style={styles.deleteBtn}
          >
            <ITText variant="labelSmall" color="#EF4444">
              Eliminar
            </ITText>
          </ITTouchableOpacity>
        </View>
      </View>
    </ITTouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ITScreenDatatableLayout
        title="Cuotas y Planes"
        totalItems={total}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => fetchData(1)}
        searchQuery={search}
        onSearchChange={setSearch}
        searchBar={
          <Searchbar
            placeholder="Buscar cuota..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
            placeholderTextColor="#94A3B8"
            elevation={0}
          />
        }
        data={fees}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onLoadMore={() => {
          if (page * 10 < total) fetchData(page + 1);
        }}
        fab={
          <FAB
            icon="plus"
            onPress={() =>
              navigateToScreen('FEES_STACK', 'FEE_FORM')
            }
            style={styles.fab}
            color="#FFFFFF"
          />
        }
      />

      <ITAlert
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        title="Eliminar Cuota"
        description="Esta acción eliminará permanentemente la cuota del sistema. ¿Deseas continuar?"
        confirmLabel="Eliminar"
        type="alert"
        loading={isDeleting}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  fab: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    marginBottom: 16,
  },
});
