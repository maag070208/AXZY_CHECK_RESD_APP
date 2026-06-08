import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Icon } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';
import {
  ITButton,
  ITCard,
  ITDateRangePicker,
  ITDialog,
  ITText,
  ITTouchableOpacity,
  SearchComponent,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import { IReportType } from '../service/reports.types';

const REPORT_TYPES: IReportType[] = [
  { key: 'rounds', label: 'Rondas', icon: 'walk' },
  { key: 'incidents', label: 'Incidencias', icon: 'alert-circle' },
  { key: 'maintenance', label: 'Mantenimientos', icon: 'wrench' },
  { key: 'access', label: 'Accesos', icon: 'door-open' },
  { key: 'payments', label: 'Pagos', icon: 'cash' },
  { key: 'guard-activity', label: 'Actividad Guardias', icon: 'shield-account' },
];

const RESIDENCIALES = [
  { label: 'Residencial las Palmas', value: '1' },
  { label: 'Residencial del Bosque', value: '2' },
  { label: 'Residencial San Ángel', value: '3' },
];

interface ReportDialogState {
  visible: boolean;
  reportType: IReportType | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
  residencialId: string;
}

export const ReportsListScreen = () => {
  const dispatch = useDispatch();

  const [dialog, setDialog] = useState<ReportDialogState>({
    visible: false,
    reportType: null,
    startDate: undefined,
    endDate: undefined,
    residencialId: '',
  });

  const openReportDialog = (reportType: IReportType) => {
    setDialog({
      visible: true,
      reportType,
      startDate: undefined,
      endDate: undefined,
      residencialId: '',
    });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, visible: false }));
  };

  const handleGeneratePdf = () => {
    dispatch(
      showToast({
        message: `Reporte de ${dialog.reportType?.label} generado`,
        type: 'success',
      }),
    );
    closeDialog();
  };

  const renderCard = (reportType: IReportType) => (
    <ITTouchableOpacity
      key={reportType.key}
      style={styles.cardWrapper}
      onPress={() => openReportDialog(reportType)}
    >
      <ITCard style={styles.reportCard}>
        <View style={styles.cardInner}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Icon source={reportType.icon} size={28} color={theme.colors.primary} />
          </View>
          <ITText
            variant="bodyMedium"
            weight="bold"
            color="#0F172A"
            center
            style={styles.cardLabel}
          >
            {reportType.label}
          </ITText>
        </View>
      </ITCard>
    </ITTouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <ITText variant="titleLarge" weight="bold" color="#0F172A">
            Reportes
          </ITText>
          <ITText variant="bodySmall" color="#64748B" style={styles.subtitle}>
            Selecciona un tipo de reporte para generar
          </ITText>
        </View>
        <View style={styles.grid}>
          {REPORT_TYPES.map(renderCard)}
        </View>
      </ScrollView>

      <ITDialog
        visible={dialog.visible}
        onDismiss={closeDialog}
        title={`Reporte: ${dialog.reportType?.label || ''}`}
        icon={dialog.reportType?.icon || 'file-document'}
        actions={
          <View style={styles.dialogActions}>
            <ITButton
              label="Cancelar"
              mode="outlined"
              onPress={closeDialog}
              textColor={theme.colors.slate500}
              style={styles.dialogButton}
            />
            <ITButton
              label="Generar PDF"
              onPress={handleGeneratePdf}
              style={[
                styles.dialogButton,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          </View>
        }
      >
        <View style={styles.dialogContent}>
          <ITDateRangePicker
            label="Rango de Fechas"
            startDate={dialog.startDate}
            endDate={dialog.endDate}
            onConfirm={({ startDate, endDate }) =>
              setDialog(prev => ({ ...prev, startDate, endDate }))
            }
          />
          <SearchComponent
            label="Residencial"
            options={RESIDENCIALES}
            value={dialog.residencialId}
            onSelect={val =>
              setDialog(prev => ({ ...prev, residencialId: val as string }))
            }
          />
        </View>
      </ITDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardWrapper: {
    width: '46%',
  },
  reportCard: {
    borderRadius: 20,
    marginBottom: 0,
  },
  cardInner: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    textAlign: 'center',
  },
  dialogContent: {
    width: '100%',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
});
