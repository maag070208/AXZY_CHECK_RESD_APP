import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
  deleteProperty,
  getPaginatedProperties,
} from '../service/properties.service';
import { IProperty } from '../service/properties.types';

export const PropertiesListScreen = () => {
  const { navigateToScreen } = useAppNavigation();
  const dispatch = useDispatch();

  const [properties, setProperties] = useState<IProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProperties = useCallback(
    async (pageNum: number, isRefreshing = false) => {
      try {
        if (pageNum === 1) {
          if (!isRefreshing) {
            setLoading(true);
          }
        } else {
          setLoadingMore(true);
        }

        const activeFilter =
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active';

        const params = {
          page: pageNum,
          limit: 15,
          filters: {
            search: debouncedSearch,
            number: debouncedSearch,
            street: debouncedSearch,
            active: activeFilter,
          },
        };

        const res = await getPaginatedProperties(params);

        if (res.success && res.data) {
          const newRows = (res.data.rows as IProperty[]) || [];
          const totalRows = res.data.total || 0;

          setProperties(prev => {
            const combined = pageNum === 1 ? newRows : [...prev, ...newRows];
            setHasMore(combined.length < totalRows);
            return combined;
          });

          setTotal(totalRows);
          setPage(pageNum);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, statusFilter],
  );

  useEffect(() => {
    fetchProperties(1);
  }, [debouncedSearch, statusFilter, fetchProperties]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProperties(page + 1);
    }
  };

  const handleOpenEdit = (property: IProperty) => {
    navigateToScreen('PROPERTIES_STACK', 'PROPERTY_FORM', {
      propertyId: property.id,
    });
  };

  const handleDeletePress = (id: string) => {
    setPropertyToDelete(id);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteProperty(propertyToDelete);
      if (res.success) {
        dispatch(showToast({ type: 'success', message: 'Propiedad eliminada' }));
        fetchProperties(1, true);
      } else {
        dispatch(showToast({ type: 'error', message: 'Error al eliminar' }));
      }
    } catch (error) {
      dispatch(showToast({ type: 'error', message: 'Ocurrió un error' }));
    } finally {
      setIsDeleting(false);
      setDeleteDialogVisible(false);
      setPropertyToDelete(null);
    }
  };

  const renderProperty = ({ item }: { item: IProperty }) => (
    <ITTouchableOpacity
      key={item.id}
      onPress={() => handleOpenEdit(item)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={{ flex: 1 }}>
            <ITText
              variant="titleMedium"
              weight="bold"
              color={theme.colors.slate900}
            >
              Número: {item.number}
            </ITText>
            {item.block && (
              <ITText variant="labelSmall" color={theme.colors.slate500}>
                Manzana: {item.block}
              </ITText>
            )}
          </View>
          <ITBadge
            label={item.active ? 'ACTIVA' : 'INACTIVA'}
            variant={item.active ? 'success' : 'secondary'}
            size="small"
          />
        </View>
      </View>
      <ITText variant="bodyMedium" color={theme.colors.slate600}>
        {item.street}
      </ITText>
      <View style={styles.cardMeta}>
        <ITText variant="labelSmall" color={theme.colors.slate500}>
          {item.reference || 'Sin referencia'}
        </ITText>
        <ITBadge
          label={item.occupied ? 'HABITADA' : 'NO HABITADA'}
          variant={item.occupied ? 'primary' : 'secondary'}
          size="small"
          outline
        />
      </View>
      <View style={styles.cardActions}>
        <ITTouchableOpacity
          onPress={() => handleDeletePress(item.id)}
          style={styles.deleteButton}
        >
          <ITText variant="labelSmall" color={theme.colors.error}>
            Eliminar
          </ITText>
        </ITTouchableOpacity>
      </View>
    </ITTouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ITScreenDatatableLayout
        title="Propiedades"
        totalItems={total}
        loading={loading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onLoadMore={handleLoadMore}
        loadingMore={loadingMore}
        showSearchBar={true}
        searchQuery={search}
        onSearchChange={setSearch}
        searchBar={
          <Searchbar
            placeholder="Buscar por número o calle..."
            onChangeText={setSearch}
            value={search}
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
            contentContainerStyle={styles.filtersRow}
          >
            <ITTouchableOpacity onPress={() => setStatusFilter('all')}>
              <ITBadge
                label="TODAS"
                variant={statusFilter === 'all' ? 'primary' : 'secondary'}
                outline={statusFilter !== 'all'}
              />
            </ITTouchableOpacity>
            <ITTouchableOpacity onPress={() => setStatusFilter('active')}>
              <ITBadge
                label="ACTIVAS"
                variant={statusFilter === 'active' ? 'success' : 'secondary'}
                outline={statusFilter !== 'active'}
              />
            </ITTouchableOpacity>
            <ITTouchableOpacity onPress={() => setStatusFilter('inactive')}>
              <ITBadge
                label="INACTIVAS"
                variant={statusFilter === 'inactive' ? 'error' : 'secondary'}
                outline={statusFilter !== 'inactive'}
              />
            </ITTouchableOpacity>
          </ScrollView>
        }
        data={properties}
        renderItem={renderProperty}
        keyExtractor={item => item.id}
        fab={
          <FAB
            icon="plus"
            style={styles.fab}
            color="#FFFFFF"
            onPress={() =>
              navigateToScreen('PROPERTIES_STACK', 'PROPERTY_FORM')
            }
          />
        }
      />

      <ITAlert
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        title="Eliminar Propiedad"
        description="¿Estás seguro de eliminar esta propiedad? Esta acción no se puede deshacer."
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
  filtersRow: {
    paddingVertical: 4,
    gap: 10,
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardMeta: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
});
