import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-paper';
import {
  ITBadge,
  ITButton,
  ITScreenWrapper,
  ITText,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import { getResidentById } from '../service/residents.service';
import { IResident } from '../service/residents.types';

export const ResidentDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { residentId } = route.params as { residentId: string };

  const [resident, setResident] = useState<IResident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResident = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getResidentById(residentId);
      if (res.success && res.data) {
        setResident(res.data);
      } else {
        setError(res.messages?.[0] || 'Error al cargar residente');
      }
    } catch {
      setError('Ocurrió un error al cargar la información');
    } finally {
      setLoading(false);
    }
  }, [residentId]);

  useEffect(() => {
    fetchResident();
  }, [fetchResident]);

  if (loading) {
    return (
      <ITScreenWrapper padding>
        <View style={styles.loadingContainer}>
          <ITText variant="bodyLarge" color={theme.colors.slate500}>
            Cargando...
          </ITText>
        </View>
      </ITScreenWrapper>
    );
  }

  if (error || !resident) {
    return (
      <ITScreenWrapper padding>
        <View style={styles.loadingContainer}>
          <ITText variant="bodyLarge" color={theme.colors.error}>
            {error || 'Residente no encontrado'}
          </ITText>
        </View>
      </ITScreenWrapper>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ITScreenWrapper padding>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <ITText style={styles.avatarLargeText}>
              {(resident.user?.name || '?').charAt(0).toUpperCase()}
              {(resident.user?.lastName || '').charAt(0).toUpperCase()}
            </ITText>
          </View>
          <ITText variant="headlineSmall" weight="bold" style={styles.fullName}>
            {resident.user?.name || ''} {resident.user?.lastName || ''}
          </ITText>
          {resident.user?.username && (
            <ITText
              variant="bodySmall"
              color={theme.colors.slate400}
              style={{ marginBottom: 8 }}
            >
              @{resident.user.username}
            </ITText>
          )}
          <ITBadge
            label={resident.active ? 'Activo' : 'Inactivo'}
            variant={resident.active ? 'success' : 'error'}
            size="medium"
            dot={resident.active}
          />
        </View>

        <View style={styles.infoSection}>
          <ITText variant="titleMedium" weight="bold" style={styles.sectionTitle}>
            Información de contacto
          </ITText>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Icon source="email-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <ITText variant="labelSmall" style={styles.infoLabel}>
                Correo electrónico
              </ITText>
              <ITText variant="bodyMedium" style={styles.infoValue}>
                {resident.email || 'No registrado'}
              </ITText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Icon source="phone-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <ITText variant="labelSmall" style={styles.infoLabel}>
                Teléfono
              </ITText>
              <ITText variant="bodyMedium" style={styles.infoValue}>
                {resident.phone || 'No registrado'}
              </ITText>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ITText variant="titleMedium" weight="bold" style={styles.sectionTitle}>
            Vivienda
          </ITText>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Icon source="office-building" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <ITText variant="labelSmall" style={styles.infoLabel}>
                Casa asignada
              </ITText>
              <ITText variant="bodyMedium" style={styles.infoValue}>
                {resident.house ? `Casa ${resident.house.number}` : 'Sin casa asignada'}
              </ITText>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ITText variant="titleMedium" weight="bold" style={styles.sectionTitle}>
            Información del sistema
          </ITText>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Icon source="calendar-outline" size={20} color={theme.colors.slate500} />
            </View>
            <View style={styles.infoContent}>
              <ITText variant="labelSmall" style={styles.infoLabel}>
                Fecha de creación
              </ITText>
              <ITText variant="bodyMedium" style={styles.infoValue}>
                {formatDate(resident.createdAt)}
              </ITText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Icon source="calendar-clock" size={20} color={theme.colors.slate500} />
            </View>
            <View style={styles.infoContent}>
              <ITText variant="labelSmall" style={styles.infoLabel}>
                Última actualización
              </ITText>
              <ITText variant="bodyMedium" style={styles.infoValue}>
                {formatDate(resident.updatedAt)}
              </ITText>
            </View>
          </View>
        </View>

        <View style={styles.editButtonContainer}>
          <ITButton
            label="Editar Residente"
            onPress={() =>
              navigation.navigate('RESIDENT_FORM', {
                residentId: resident.id,
              })
            }
            style={styles.editButton}
          />
        </View>
      </View>
    </ITScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  fullName: {
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#0F172A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    color: '#1E293B',
    fontWeight: '500',
  },
  editButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  editButton: {
    borderRadius: 14,
    height: 48,
  },
});
