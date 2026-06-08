import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Code } from 'react-native-vision-camera';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';
import { theme } from '../../../shared/theme/theme';
import { createVisitor, createAccess } from '../service/accesses.service';
import CameraComponent from '../../../shared/components/Camera';
import dayjs from 'dayjs';

export const AccessQrScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleCodeScanned = useCallback(
    async (codes: Code[]) => {
      if (scanned || processing || !codes.length || !codes[0].value) return;
      setScanned(true);
      setProcessing(true);

      const code = codes[0].value;
      let visitorData: { name?: string; phone?: string } | null = null;

      try {
        const parsed = JSON.parse(code);
        if (parsed && typeof parsed === 'object') {
          visitorData = {
            name: parsed.name || parsed.visitor || parsed.visitante,
            phone: parsed.phone || parsed.tel || parsed.telefono,
          };
        }
      } catch {
        if (code.trim()) {
          visitorData = { name: code.trim() };
        }
      }

      if (!visitorData?.name) {
        dispatch(showToast({ message: 'Código QR inválido', type: 'error' }));
        setProcessing(false);
        setScanned(false);
        return;
      }

      try {
        const visitorRes = await createVisitor({
          name: visitorData.name,
          phone: visitorData.phone || undefined,
        });

        if (!visitorRes.success || !visitorRes.data) {
          dispatch(
            showToast({ message: 'Error al registrar visitante', type: 'error' }),
          );
          setProcessing(false);
          setScanned(false);
          return;
        }

        const accessRes = await createAccess({
          residentId: '',
          visitorId: visitorRes.data.id,
          type: 'TEMPORARY',
          validFrom: dayjs().toISOString(),
          validUntil: dayjs().add(1, 'day').toISOString(),
        });

        if (accessRes.success) {
          dispatch(
            showToast({
              message: `Acceso concedido a ${visitorData.name}`,
              type: 'success',
            }),
          );
          navigation.goBack();
        } else {
          dispatch(
            showToast({
              message: accessRes.messages?.[0] || 'Error al crear acceso',
              type: 'error',
            }),
          );
          setProcessing(false);
          setScanned(false);
        }
      } catch {
        dispatch(showToast({ message: 'Error inesperado', type: 'error' }));
        setProcessing(false);
        setScanned(false);
      }
    },
    [scanned, processing, dispatch, navigation],
  );

  return (
    <View style={styles.container}>
      <CameraComponent
        mode="scan"
        onCodeScanned={handleCodeScanned}
        onCancel={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
