import { useFocusEffect, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Icon, Searchbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';
import { TResult } from '../../../core/types/TResult';
import {
  ITAlert,
  ITBadge,
  ITDialog,
  ITInput,
  ITScreenDatatableLayout,
  ITText,
  ITTouchableOpacity,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  deleteAccess,
  getAccessesDatatable,
  updateAccess,
} from '../service/accesses.service';
import { IAccess, ACCESS_TYPE_LABELS } from '../service/accesses.types';

type StatusDisplay = {
  label: string;
  variant: 'success' | 'warning' | 'error';
  color: string;
  bg: string;
};

const STATUS_DISPLAY: Record<string, StatusDisplay> = {
  PENDING: { label: 'VÁLIDO', variant: 'success', color: '#10B981', bg: '#F0FDF4' },
  ACTIVE: { label: 'DENTRO', variant: 'success', color: '#10B981', bg: '#F0FDF4' },
  FINISHED: { label: 'COMPLETADO', variant: 'warning', color: '#F59E0B', bg: '#FFFBEB' },
  REJECTED: { label: 'RECHAZADO', variant: 'error', color: '#EF4444', bg: '#FEF2F2' },
  EXPIRED: { label: 'EXPIRADO', variant: 'error', color: '#EF4444', bg: '#FEF2F2' },
};

const getStatusDisplay = (item: IAccess): StatusDisplay => {
  const now = dayjs();
  const validUntil = dayjs(item.validUntil);

  if (validUntil.isBefore(now)) {
    return STATUS_DISPLAY.EXPIRED;
  }

  return STATUS_DISPLAY[item.status] || STATUS_DISPLAY.PENDING;
};

export const AccessesListScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const [accesses, setAccesses] = useState<IAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [accessToDelete, setAccessToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [accessToValidate, setAccessToValidate] = useState<IAccess | null>(null);
  const [accessToReject, setAccessToReject] = useState<IAccess | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [accessToExit, setAccessToExit] = useState<IAccess | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchData = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else if (pageNum === 1) {
          setLoading(true);
        }

        const filters: Record<string, unknown> = {};
        if (search) filters.visitorName = search;
        if (statusFilter !== 'all') filters.status = statusFilter;

        const res = await getAccessesDatatable({
          page: pageNum,
          limit: 15,
          filters,
        });

        if (res.success && res.data) {
          setAccesses(prev =>
            append ? [...prev, ...res.data.rows] : res.data.rows,
          );
          setTotal(res.data.total || 0);
          setPage(pageNum);
        } else {
          dispatch(
            showToast({
              message: res.messages?.[0] || 'Error al cargar accesos',
              type: 'error',
            }),
          );
        }
      } catch (error) {
        const result = error as TResult<void>;
        dispatch(
          showToast({
            message:
              result?.messages?.[0] || 'Ocurrió un error en la solicitud',
            type: 'error',
          }),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [search, statusFilter, dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchData(1);
    }, [fetchData]),
  );

  const handleDeletePress = (id: string) => {
    setAccessToDelete(id);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!accessToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteAccess(accessToDelete);
      if (res.success) {
        dispatch(showToast({ message: 'Acceso eliminado', type: 'success' }));
        fetchData(1);
      } else {
        dispatch(showToast({ message: res.messages?.[0] || 'Error al eliminar', type: 'error' }));
      }
    } catch {
      dispatch(showToast({ message: 'Error inesperado', type: 'error' }));
    } finally {
      setIsDeleting(false);
      setDeleteDialogVisible(false);
      setAccessToDelete(null);
    }
  };

  const confirmValidateEntry = async () => {
    if (!accessToValidate || isProcessingAction) return;
    setIsProcessingAction(true);
    try {
      const res = await updateAccess(accessToValidate.id, {
        status: 'ACTIVE',
        used: true,
      });
      if (res.success) {
        dispatch(showToast({ message: 'Entrada registrada con éxito', type: 'success' }));
        setAccessToValidate(null);
        fetchData(1);
      } else {
        dispatch(showToast({ message: res.messages?.[0] || 'Error al registrar entrada', type: 'error' }));
      }
    } catch {
      dispatch(showToast({ message: 'Error al registrar entrada', type: 'error' }));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const confirmRejectEntry = async () => {
    if (!accessToReject || isProcessingAction) return;
    if (!rejectionReason.trim()) {
      dispatch(showToast({ message: 'Debe ingresar un motivo de rechazo', type: 'warning' }));
      return;
    }
    setIsProcessingAction(true);
    try {
      const res = await updateAccess(accessToReject.id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });
      if (res.success) {
        dispatch(showToast({ message: 'Pase rechazado con éxito', type: 'success' }));
        setAccessToReject(null);
        setRejectionReason('');
        fetchData(1);
      } else {
        dispatch(showToast({ message: res.messages?.[0] || 'Error al rechazar pase', type: 'error' }));
      }
    } catch {
      dispatch(showToast({ message: 'Error al rechazar pase', type: 'error' }));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const confirmRegisterExit = async () => {
    if (!accessToExit || isProcessingAction) return;
    setIsProcessingAction(true);
    try {
      const res = await updateAccess(accessToExit.id, {
        status: 'FINISHED',
      });
      if (res.success) {
        dispatch(showToast({ message: 'Salida registrada con éxito', type: 'success' }));
        setAccessToExit(null);
        fetchData(1);
      } else {
        dispatch(showToast({ message: res.messages?.[0] || 'Error al registrar salida', type: 'error' }));
      }
    } catch {
      dispatch(showToast({ message: 'Error al registrar salida', type: 'error' }));
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && accesses.length < total) {
      fetchData(page + 1, true);
    }
  };

  const renderItem = ({ item }: { item: IAccess }) => {
    const display = getStatusDisplay(item);
    const isExpired = dayjs().isAfter(dayjs(item.validUntil));
    const residentName = item.resident?.user
      ? `${item.resident.user.name} ${item.resident.user.lastName || ''}`.trim()
      : null;
    const houseStr = item.resident?.house
      ? `${item.resident.house.street} ${item.resident.house.number}`
      : null;

    return (
      <ITTouchableOpacity style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <View style={[styles.avatarCircle, { backgroundColor: display.bg }]}>
              <ITText style={styles.avatarText} color={display.color}>
                {(item.visitor?.name || '?').charAt(0).toUpperCase()}
              </ITText>
            </View>
          </View>

          <View style={styles.cardCenter}>
            <ITText variant="bodyLarge" weight="bold" color="#0F172A">
              {(item.visitor?.name || '—').toUpperCase()}
            </ITText>
            {item.visitor?.phone && (
              <ITText variant="bodySmall" color="#64748B">
                TEL: {item.visitor.phone}
              </ITText>
            )}
            <ITText variant="bodySmall" color="#94A3B8">
              {ACCESS_TYPE_LABELS[item.type] || item.type}
            </ITText>
            {houseStr && (
              <ITText variant="labelSmall" color="#64748B">
                Casa {houseStr}
              </ITText>
            )}
            {residentName && (
              <ITText variant="labelSmall" color="#94A3B8">
                Autorizó: {residentName}
              </ITText>
            )}
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Icon source="calendar-start" size={14} color="#94A3B8" />
                <ITText variant="labelSmall" color="#94A3B8">
                  {item.validFrom ? dayjs(item.validFrom).format('DD/MM/YY') : '—'}
                </ITText>
              </View>
              <View style={styles.metaItem}>
                <Icon source="calendar-end" size={14} color="#94A3B8" />
                <ITText variant="labelSmall" color="#94A3B8">
                  {item.validUntil ? dayjs(item.validUntil).format('DD/MM/YY') : '—'}
                </ITText>
              </View>
            </View>
          </View>

          <View style={styles.cardRight}>
            <ITBadge
              label={display.label}
              variant={display.variant}
              size="small"
              dot
            />
            {item.rejectionReason && (
              <ITText variant="labelSmall" color="#EF4444" style={styles.rejectionText}>
                Motivo: {item.rejectionReason}
              </ITText>
            )}
          </View>
        </View>

        <View style={styles.actionsRow}>
          {item.status === 'PENDING' && !isExpired && (
            <>
              <ITTouchableOpacity
                style={[styles.actionBtn, styles.actionValidate]}
                onPress={() => setAccessToValidate(item)}
              >
                <Icon source="check" size={18} color="#10B981" />
              </ITTouchableOpacity>
              <ITTouchableOpacity
                style={[styles.actionBtn, styles.actionReject]}
                onPress={() => setAccessToReject(item)}
              >
                <Icon source="close" size={18} color="#EF4444" />
              </ITTouchableOpacity>
            </>
          )}
          {item.status === 'ACTIVE' && (
            <ITTouchableOpacity
              style={[styles.actionBtn, styles.actionExit]}
              onPress={() => setAccessToExit(item)}
            >
              <Icon source="exit-to-app" size={18} color="#F59E0B" />
            </ITTouchableOpacity>
          )}
          <ITTouchableOpacity
            style={[styles.actionBtn, styles.actionDelete]}
            onPress={() => handleDeletePress(item.id)}
          >
            <Icon source="trash-can-outline" size={18} color="#EF4444" />
          </ITTouchableOpacity>
        </View>
      </ITTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ITScreenDatatableLayout
        title="Control de Accesos"
        totalItems={total}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => fetchData(1)}
        onFilterPress={undefined}
        showSearchBar={true}
        searchQuery={search}
        onSearchChange={setSearch}
        searchBar={
          <Searchbar
            placeholder="Buscar visitante..."
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
          <View style={styles.badgesRow}>
            <ITTouchableOpacity onPress={() => setStatusFilter('all')}>
              <ITBadge
                label="TODOS"
                variant={statusFilter === 'all' ? 'primary' : 'default'}
                outline={statusFilter !== 'all'}
              />
            </ITTouchableOpacity>
            <ITTouchableOpacity onPress={() => setStatusFilter('PENDING')}>
              <ITBadge
                label="VÁLIDOS"
                variant={statusFilter === 'PENDING' ? 'success' : 'default'}
                outline={statusFilter !== 'PENDING'}
              />
            </ITTouchableOpacity>
            <ITTouchableOpacity onPress={() => setStatusFilter('ACTIVE')}>
              <ITBadge
                label="ACTIVOS"
                variant={statusFilter === 'ACTIVE' ? 'success' : 'default'}
                outline={statusFilter !== 'ACTIVE'}
              />
            </ITTouchableOpacity>
            <ITTouchableOpacity onPress={() => setStatusFilter('FINISHED')}>
              <ITBadge
                label="COMPLETADOS"
                variant={statusFilter === 'FINISHED' ? 'warning' : 'default'}
                outline={statusFilter !== 'FINISHED'}
              />
            </ITTouchableOpacity>
          </View>
        }
        data={accesses}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onLoadMore={handleLoadMore}
        loadingMore={loadingMore}
        fab={
          <FAB
            icon="qrcode-scan"
            style={styles.fab}
            color="#FFFFFF"
            onPress={() => navigation.navigate('AccessQrScan')}
          />
        }
      />

      {/* VALIDATE ENTRY DIALOG */}
      <ITDialog
        visible={!!accessToValidate}
        onDismiss={() => setAccessToValidate(null)}
        title="Validar Entrada"
        description={`Confirmar entrada de ${accessToValidate?.visitor?.name?.toUpperCase() || '—'} al residencial.`}
        confirmLabel="Validar"
        onConfirm={confirmValidateEntry}
        loading={isProcessingAction}
      />

      {/* REJECT ENTRY DIALOG */}
      <ITDialog
        visible={!!accessToReject}
        onDismiss={() => {
          setAccessToReject(null);
          setRejectionReason('');
        }}
        title="Rechazar Entrada"
        confirmLabel="Rechazar"
        onConfirm={confirmRejectEntry}
        loading={isProcessingAction}
        confirmDisabled={!rejectionReason.trim()}
      >
        <ITText variant="bodySmall" color="#64748B" style={styles.rejectDescription}>
          Motivo de rechazo para la visita de{' '}
          <ITText weight="bold" color="#0F172A">
            {accessToReject?.visitor?.name || '—'}
          </ITText>
          :
        </ITText>
        <ITInput
          label="Motivo de Rechazo"
          placeholder="Ej. No coincide identificación"
          value={rejectionReason}
          onChangeText={setRejectionReason}
          multiline
          numberOfLines={3}
        />
      </ITDialog>

      {/* REGISTER EXIT DIALOG */}
      <ITDialog
        visible={!!accessToExit}
        onDismiss={() => setAccessToExit(null)}
        title="Registrar Salida"
        description={`¿Registrar salida de ${accessToExit?.visitor?.name?.toUpperCase() || '—'} del residencial?`}
        confirmLabel="Registrar Salida"
        onConfirm={confirmRegisterExit}
        loading={isProcessingAction}
      />

      {/* DELETE DIALOG */}
      <ITAlert
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        title="Eliminar Acceso"
        description="Esta acción eliminará permanentemente el registro de acceso del sistema. ¿Deseas continuar?"
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
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
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
    paddingBottom: 8,
  },
  cardLeft: {
    marginRight: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardCenter: {
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rejectionText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    maxWidth: 100,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionValidate: {
    backgroundColor: '#F0FDF4',
  },
  actionReject: {
    backgroundColor: '#FEF2F2',
  },
  actionExit: {
    backgroundColor: '#FFFBEB',
  },
  actionDelete: {
    backgroundColor: '#FEF2F2',
  },
  rejectDescription: {
    marginBottom: 12,
    lineHeight: 18,
  },
  fab: {
    backgroundColor: theme.colors.primary,
  },
});
