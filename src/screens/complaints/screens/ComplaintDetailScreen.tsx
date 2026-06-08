import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';
import { RootState } from '../../../core/store/store';
import { UserRole } from '../../../core/types/IUser';
import {
  ITAlert,
  ITBadge,
  ITButton,
  ITText,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  deleteComplaint,
  getComplaintById,
  updateComplaint,
} from '../service/complaints.service';
import {
  ComplaintStatus,
  IComplaint,
  COMPLAINT_STATUS_LABELS,
} from '../service/complaints.types';

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

export const ComplaintDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const { complaintId } = route.params as { complaintId: string };
  const user = useSelector((state: RootState) => state.userState);
  const isAdmin = user.role === UserRole.ADMIN;
  const isResident = user.role === UserRole.RESDN;

  const [complaint, setComplaint] = useState<IComplaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getComplaintById(complaintId);
      if (res.success && res.data) {
        setComplaint(res.data);
      } else {
        dispatch(
          showToast({
            message: res.messages?.[0] || 'Error al cargar queja',
            type: 'error',
          }),
        );
        navigation.goBack();
      }
    } catch {
      dispatch(showToast({ message: 'Error de conexión', type: 'error' }));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [complaintId, dispatch, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleStatusUpdate = async (newStatus: ComplaintStatus) => {
    if (!complaint) return;
    setUpdating(true);
    try {
      const res = await updateComplaint(complaint.id, { status: newStatus });
      if (res.success) {
        dispatch(
          showToast({
            message: `Queja actualizada a ${COMPLAINT_STATUS_LABELS[newStatus]}`,
            type: 'success',
          }),
        );
        load();
      } else {
        dispatch(
          showToast({
            message: res.messages?.[0] || 'Error al actualizar estado',
            type: 'error',
          }),
        );
      }
    } catch {
      dispatch(showToast({ message: 'Error inesperado', type: 'error' }));
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!complaint) return;
    setIsDeleting(true);
    try {
      const res = await deleteComplaint(complaint.id);
      if (res.success) {
        dispatch(showToast({ message: 'Queja eliminada con éxito', type: 'success' }));
        navigation.goBack();
      } else {
        dispatch(showToast({ message: 'Error al eliminar', type: 'error' }));
      }
    } catch {
      dispatch(showToast({ message: 'Error inesperado', type: 'error' }));
    } finally {
      setIsDeleting(false);
      setDeleteVisible(false);
    }
  };

  if (loading || !complaint) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ITText variant="bodyMedium" color={theme.colors.slate400}>
          Cargando queja...
        </ITText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Badges */}
        <View style={styles.badgesSection}>
          <ITBadge
            label={COMPLAINT_STATUS_LABELS[complaint.status]}
            variant={statusVariant(complaint.status)}
            size="medium"
          />
          <ITBadge
            label={complaint.category?.name || '—'}
            variant="primary"
            size="small"
            outline
          />
        </View>

        {/* Description */}
        <View style={styles.card}>
          <ITText variant="labelSmall" weight="bold" color="#94A3B8" style={styles.cardLabel}>
            DESCRIPCIÓN
          </ITText>
          <ITText variant="bodyMedium" color="#334155" style={styles.description}>
            {complaint.description}
          </ITText>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <ITText variant="labelSmall" weight="bold" color="#94A3B8" style={styles.cardLabel}>
            INFORMACIÓN
          </ITText>
          <Row label="Registrado" value={complaint.createdAt ? dayjs(complaint.createdAt).format('DD/MM/YYYY HH:mm') : '—'} />
          {!isResident && complaint.resident && (
            <Row
              label="Reportado por"
              value={`${complaint.resident.user?.name || ''} ${complaint.resident.user?.lastName || ''}`}
              sub={complaint.resident.phone ? `TEL: ${complaint.resident.phone}` : undefined}
            />
          )}
        </View>

        {/* Resolved By */}
        {complaint.resolvedBy && (
          <View style={styles.resolvedCard}>
            <ITText variant="labelSmall" weight="bold" color="#10B981">
              ATENDIDO / RESUELTO POR
            </ITText>
            <ITText variant="bodyMedium" weight="600" color="#065F46">
              {complaint.resolvedBy.name} {complaint.resolvedBy.lastName}
            </ITText>
            {complaint.resolvedAt && (
              <ITText variant="labelSmall" color="#10B981">
                {dayjs(complaint.resolvedAt).format('DD/MM/YYYY')}
              </ITText>
            )}
          </View>
        )}

        {/* ADMIN status actions */}
        {isAdmin && (
          <View style={styles.actionsSection}>
            <ITText variant="labelSmall" weight="bold" color="#94A3B8" style={styles.actionsLabel}>
              CAMBIAR ESTADO
            </ITText>

            {complaint.status !== 'IN_PROGRESS' && (
              <ITButton
                label="Marcar En Progreso"
                mode="outlined"
                onPress={() => handleStatusUpdate('IN_PROGRESS')}
                disabled={updating}
              />
            )}
            {complaint.status !== 'RESOLVED' && (
              <ITButton
                label="Marcar Resuelto"
                color={theme.colors.success || '#10B981'}
                onPress={() => handleStatusUpdate('RESOLVED')}
                disabled={updating}
                loading={updating}
              />
            )}
            {complaint.status !== 'CLOSED' && (
              <ITButton
                label="Cerrar Queja"
                mode="outlined"
                onPress={() => handleStatusUpdate('CLOSED')}
                disabled={updating}
              />
            )}
            {complaint.status !== 'OPEN' && (
              <ITButton
                label="Reabrir Queja"
                mode="text"
                onPress={() => handleStatusUpdate('OPEN')}
                disabled={updating}
              />
            )}

            <ITButton
              label="Eliminar Queja"
              mode="text"
              textColor="#EF4444"
              onPress={() => setDeleteVisible(true)}
              disabled={updating}
            />
          </View>
        )}

        {/* RESDN delete */}
        {isResident && (complaint.status === 'OPEN' || complaint.status === 'CLOSED') && (
          <View style={styles.actionsSection}>
            <ITButton
              label="Eliminar Queja"
              mode="text"
              textColor="#EF4444"
              onPress={() => setDeleteVisible(true)}
            />
          </View>
        )}
      </ScrollView>

      <ITAlert
        visible={deleteVisible}
        onDismiss={() => setDeleteVisible(false)}
        onConfirm={confirmDelete}
        title="Eliminar Queja"
        description="Esta acción no se puede deshacer. Se borrará del historial."
        confirmLabel="ELIMINAR AHORA"
        type="alert"
        loading={isDeleting}
      />
    </View>
  );
};

const Row = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) => (
  <View style={styles.row}>
    <ITText variant="bodySmall" color="#64748B" style={styles.rowLabel}>
      {label}
    </ITText>
    <View style={{ alignItems: 'flex-end' }}>
      <ITText variant="bodySmall" weight="600" color="#0F172A">
        {value}
      </ITText>
      {sub && (
        <ITText variant="labelSmall" color="#64748B">
          {sub}
        </ITText>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  badgesSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  card: {
    margin: 20,
    marginBottom: 0,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  cardLabel: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  description: {
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: {
    flex: 1,
  },
  resolvedCard: {
    margin: 20,
    marginBottom: 0,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 4,
  },
  actionsSection: {
    margin: 20,
    marginBottom: 0,
    paddingTop: 8,
    gap: 2,
  },
  actionsLabel: {
    letterSpacing: 0.5,
    marginBottom: 8,
  },
});
