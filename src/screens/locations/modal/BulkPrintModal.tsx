import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Modal, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { showLoader } from '../../../core/store/slices/loader.slice';
import { showToast } from '../../../core/store/slices/toast.slice';
import { ITButton, ITText, SearchComponent } from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import { getZones } from '../../zones/service/zone.service';
import { getPaginatedLocations } from '../service/location.service';
import { handleLocationQRPrint } from '../utils/qr.utils';

import { ILocation } from '../type/location.types';

interface BulkPrintModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export const BulkPrintModal: React.FC<BulkPrintModalProps> = ({
  visible,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [zones, setZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | number>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadZones();
    }
  }, [visible]);

  const loadZones = async () => {
    try {
      const res = await getZones();
      if (res.success) setZones(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    dispatch(showLoader(true));

    try {
      const res = await getPaginatedLocations({
        page: 1,
        limit: 1000,
        filters: {
          zoneId: selectedZoneId || undefined,
          active: true,
        },
      });

      if (res.success && res.data?.rows) {
        const ids = res.data.rows.map((l: ILocation) => l.id);
        if (ids.length === 0) {
          dispatch(
            showToast({
              message: 'No hay ubicaciones para estos filtros',
              type: 'warning',
            }),
          );
        } else {
          const success = await handleLocationQRPrint(
            ids,
            'Impresion_Masiva_QRs',
          );
          if (success) {
            onDismiss();
          } else {
            dispatch(
              showToast({ message: 'Error al generar PDF', type: 'error' }),
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
      dispatch(showToast({ message: 'Error en la solicitud', type: 'error' }));
    } finally {
      setLoading(false);
      dispatch(showLoader(false));
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.header}>
          <ITText variant="headlineSmall" weight="bold">
            Impresión Masiva
          </ITText>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <View style={styles.content}>
          <ITText variant="bodyMedium" style={styles.description}>
            Selecciona los criterios para generar los códigos QR en bloque.
          </ITText>

          <View style={styles.field}>
            <ITText variant="labelMedium" weight="bold" style={styles.label}>
              ZONA (OPCIONAL)
            </ITText>
            <SearchComponent
              placeholder={'Todas las zonas'}
              options={zones.map(z => ({ label: z.name, value: z.id }))}
              value={selectedZoneId}
              onSelect={setSelectedZoneId}
              disabled={false}
              label={''}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <ITButton
            label="Generar QRs"
            mode="contained"
            onPress={handlePrint}
            loading={loading}
            style={styles.printBtn}
            icon="qrcode"
          />
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  content: {
    gap: 20,
  },
  description: {
    color: theme.colors.slate500,
    marginBottom: 8,
  },
  field: {
    gap: 8,
  },
  label: {
    color: theme.colors.slate500,
    letterSpacing: 1,
  },
  footer: {
    marginTop: 32,
  },
  printBtn: {
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
});
