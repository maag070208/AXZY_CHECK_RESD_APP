import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
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
  deleteResident,
  getPaginatedResidents,
} from '../service/residents.service';
import { IResident } from '../service/residents.types';

export const ResidentListScreen = () => {
  const { navigateToScreen } = useAppNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [residents, setResidents] = useState<IResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchResidents = useCallback(
    async (pageNum: number, isRefreshing = false) => {
      try {
        if (pageNum === 1) {
          if (!isRefreshing) {
            setLoading(true);
          }
        } else {
          setLoadingMore(true);
        }

        const params = {
          page: pageNum,
          limit: 15,
          filters: {
            name: debouncedSearch,
          },
        };

        const res = await getPaginatedResidents(params);

        if (res.success && res.data) {
          const newRows = (res.data.rows as IResident[]) || [];
          const totalRows = res.data.total || 0;

          setResidents(prev => {
            const combined =
              pageNum === 1 ? newRows : [...prev, ...newRows];
            setHasMore(combined.length < totalRows);
            return combined;
          });

          setTotal(totalRows);
          setPage(pageNum);
        }
      } catch (error) {
        console.error('Error fetching residents:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchResidents(1);
    }, [fetchResidents]),
  );

  useEffect(() => {
    if (isFocused) {
      fetchResidents(1);
    }
  }, [debouncedSearch, isFocused, fetchResidents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchResidents(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchResidents(page + 1);
    }
  };

  const handleEdit = (resident: IResident) => {
    navigateToScreen('RESIDENTS_STACK', 'RESIDENT_FORM', {
      residentId: resident.id,
    });
  };

  const handleDeletePress = (id: string) => {
    setResidentToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!residentToDelete) return;

    setDeleting(true);
    try {
      const res = await deleteResident(residentToDelete);
      if (res.success) {
        dispatch(
          showToast({ type: 'success', message: 'Residente eliminado' }),
        );
        fetchResidents(1, true);
      } else {
        dispatch(
          showToast({ type: 'error', message: 'Error al eliminar' }),
        );
      }
    } catch (error) {
      dispatch(showToast({ type: 'error', message: 'Ocurrió un error' }));
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setResidentToDelete(null);
    }
  };

  const getInitials = (name?: string, lastName?: string | null) => {
    const first = name ? name.charAt(0).toUpperCase() : '?';
    const second = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${second}`;
  };

  const renderResident = ({ item }: { item: IResident }) => {
    const name = item.user?.name || '';
    const lastName = item.user?.lastName || null;
    const displayName = `${name} ${lastName || ''}`.trim() || 'Sin nombre';
    return (
    <ITTouchableOpacity onPress={() => handleEdit(item)}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <ITText style={styles.avatarText}>
                {getInitials(name, lastName)}
              </ITText>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.active ? '#10B981' : '#EF4444' },
                ]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ITText
                variant="titleSmall"
                weight="bold"
                style={styles.residentName}
                numberOfLines={1}
              >
                {displayName}
              </ITText>
              {item.houseId && (
                <ITBadge
                  label="Con Casa"
                  variant="primary"
                  size="small"
                  outline
                />
              )}
            </View>
          </View>
          <ITBadge
            label={item.active ? 'Activo' : 'Inactivo'}
            variant={item.active ? 'success' : 'error'}
            size="small"
            dot={item.active}
          />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <ITText variant="labelSmall" style={styles.infoLabel}>
                Email
              </ITText>
              <ITText variant="bodySmall" style={styles.infoValue} numberOfLines={1}>
                {item.email || 'N/A'}
              </ITText>
            </View>
            <View style={styles.infoItem}>
              <ITText variant="labelSmall" style={styles.infoLabel}>
                Teléfono
              </ITText>
              <ITText variant="bodySmall" style={styles.infoValue}>
                {item.phone || 'N/A'}
              </ITText>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <ITTouchableOpacity
            style={styles.footerButton}
            onPress={() => navigateToScreen('RESIDENTS_STACK', 'RESIDENT_DETAIL', { residentId: item.id })}
          >
            <ITText style={styles.footerButtonText}>Ver detalle</ITText>
          </ITTouchableOpacity>
          <View style={styles.footerSeparator} />
          <ITTouchableOpacity
            style={styles.footerButton}
            onPress={() => handleDeletePress(item.id)}
          >
            <ITText style={styles.footerButtonDanger}>
              Eliminar
            </ITText>
          </ITTouchableOpacity>
        </View>
      </View>
    </ITTouchableOpacity>
  );
  };

  return (
    <View style={styles.container}>
      <ITScreenDatatableLayout
        title="Residentes"
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
            placeholder="Buscar residente..."
            onChangeText={setSearch}
            value={search}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
            placeholderTextColor="#94A3B8"
            elevation={0}
          />
        }
        filterBadges={null}
        data={residents}
        renderItem={renderResident}
        keyExtractor={item => item.id}
        fab={
          isFocused ? (
            <FAB
              icon="plus"
              style={styles.fab}
              color="#FFFFFF"
              onPress={() =>
                navigateToScreen('RESIDENTS_STACK', 'RESIDENT_FORM')
              }
            />
          ) : undefined
        }
      />

      <ITAlert
        visible={showDeleteDialog}
        onDismiss={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Eliminar Residente"
        description="¿Estás seguro de eliminar este residente? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        type="alert"
        loading={deleting}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  residentName: {
    color: '#0F172A',
    fontSize: 15,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 2,
  },
  infoValue: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  footerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  footerButtonDanger: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  footerSeparator: {
    width: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
  },
});
