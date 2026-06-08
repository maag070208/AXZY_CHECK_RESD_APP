import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Modal, Portal, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';
import { ITButton, ITText, ITTouchableOpacity } from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  getPaginatedLocations,
  printLocationQRs,
} from '../service/location.service';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const BulkPrintModal = ({ visible, onDismiss }: Props) => {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedIds([]);
      loadLocations();
    }
  }, [visible]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const res = await getPaginatedLocations({ page: 1, limit: 200 });
      if (res.success && res.data) {
        setLocations(res.data.rows || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const handlePrint = async () => {
    if (selectedIds.length === 0) {
      dispatch(showToast({ message: 'Selecciona al menos una ubicación', type: 'warning' }));
      return;
    }
    setPrinting(true);
    try {
      const pdf = await printLocationQRs(selectedIds);
      dispatch(showToast({ message: `PDF generado: ${selectedIds.length} QRs`, type: 'success' }));
      onDismiss();
    } catch (e) {
      dispatch(showToast({ message: 'Error al generar PDF', type: 'error' }));
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <ITText variant="titleMedium" weight="bold">
            Impresión Masiva
          </ITText>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        {loading ? (
          <ITText>Cargando ubicaciones...</ITText>
        ) : (
          <View style={styles.list}>
            {locations.map(loc => {
              const selected = selectedIds.includes(loc.id);
              return (
                <ITTouchableOpacity
                  key={loc.id}
                  style={[styles.item, selected && styles.itemSelected]}
                  onPress={() => toggleSelect(loc.id)}
                >
                  <ITText
                    variant="bodyMedium"
                    weight={selected ? 'bold' : '400'}
                  >
                    {loc.name}
                  </ITText>
                </ITTouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.footer}>
          <ITButton
            label={`Imprimir (${selectedIds.length})`}
            onPress={handlePrint}
            loading={printing}
            disabled={selectedIds.length === 0}
          />
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  list: {
    gap: 4,
  },
  item: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 4,
  },
  itemSelected: {
    backgroundColor: '#EEF2FF',
  },
  footer: {
    marginTop: 16,
  },
});
