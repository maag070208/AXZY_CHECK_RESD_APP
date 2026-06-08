import { Formik } from 'formik';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Modal as RNModal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { IconButton, Icon } from 'react-native-paper';
import * as Yup from 'yup';
import { SearchComponent } from '../../../shared/components/SearchComponent';
import { getPaginatedZones } from '../../zones/service/zone.service';
import { ILocation, ILocationCreate } from '../type/location.types';
import { ITButton, ITInput, ITText, ITCard } from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: ILocationCreate, keepOpen?: boolean) => Promise<boolean>;
  initialData?: ILocation | null;
  loading?: boolean;
}

const validationSchema = Yup.object().shape({
  zoneId: Yup.string().required('La zona es obligatoria'),
  name: Yup.string().required('El nombre de ubicación es obligatorio'),
});

export const LocationFormModal = ({
  visible,
  onDismiss,
  onSubmit,
  initialData,
  loading,
}: Props) => {
  const [zones, setZones] = useState<any[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const loadZones = async () => {
    setLoadingZones(true);
    const res = await getPaginatedZones({ page: 1, limit: 200 });
    if (res.success) setZones(res.data?.rows || []);
    setLoadingZones(false);
  };

  const initialValues = {
    zoneId: initialData?.zoneId || '',
    name: initialData?.name || '',
    reference: initialData?.reference || '',
    aisle: initialData?.aisle || '',
    spot: initialData?.spot || '',
    number: initialData?.number || '',
  };

  return (
    <RNModal
      visible={visible}
      onRequestClose={onDismiss}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <ITText variant="headlineSmall" weight="800" style={styles.title}>
              {initialData ? 'Editar Ubicación' : 'Nuevo Punto'}
            </ITText>
            <ITText variant="bodySmall" color={theme.colors.slate500}>
              Configuración de punto de control
            </ITText>
          </View>
          <IconButton
            icon="close"
            onPress={onDismiss}
            disabled={loading}
            containerColor="#F1F5F9"
            iconColor={theme.colors.slate500}
          />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={() => {}}
          >
            {({
              setFieldValue,
              values,
              errors,
              touched,
              isValid,
            }) => {
              const handleSaveAndNew = async () => {
                const success = await onSubmit(values as ILocationCreate, true);
                if (success) {
                  setShowSuccess(true);
                  setFieldValue('name', '');
                  setFieldValue('reference', '');
                  setFieldValue('aisle', '');
                  setFieldValue('spot', '');
                  setFieldValue('number', '');
                  setTimeout(() => {
                    setShowSuccess(false);
                  }, 1000);
                }
              };

              const handleNormalSubmit = async () => {
                const success = await onSubmit(values as ILocationCreate, false);
                if (success) {
                  onDismiss();
                }
              };

              return (
                <View style={{ flex: 1 }}>
                  <ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                  >
                    <View style={styles.formContent}>
                      {showSuccess && (
                        <ITCard style={styles.successBanner}>
                          <Icon
                            source="check-circle"
                            color="#059669"
                            size={20}
                          />
                          <ITText
                            variant="bodySmall"
                            weight="700"
                            style={{ color: '#065F46', marginLeft: 8 }}
                          >
                            ¡Punto creado! Puedes agregar otro.
                          </ITText>
                        </ITCard>
                      )}

                      <View style={styles.section}>
                        <ITText
                          variant="labelSmall"
                          weight="bold"
                          color={theme.colors.slate500}
                          style={styles.sectionLabel}
                        >
                          ASIGNACIÓN
                        </ITText>

                        <View style={styles.inputGroup}>
                          <SearchComponent
                            label="ZONA *"
                            placeholder="Selecciona una zona"
                            options={zones.map(z => ({
                              label: z.name,
                              value: z.id,
                            }))}
                            value={values.zoneId}
                            onSelect={val => {
                              setFieldValue('zoneId', val);
                            }}
                            error={touched.zoneId && errors.zoneId}
                            disabled={!!initialData || loading}
                          />
                        </View>
                      </View>

                      <View style={styles.section}>
                        <ITText
                          variant="labelSmall"
                          weight="bold"
                          color={theme.colors.slate500}
                          style={styles.sectionLabel}
                        >
                          DETALLES DEL PUNTO
                        </ITText>

                        <ITInput
                          label="NOMBRE DEL PUNTO *"
                          placeholder="Ej: Recepción, Oficina 101"
                          value={values.name}
                          onChangeText={(text: string) => setFieldValue('name', text)}
                          onBlur={() => setFieldValue('name', values.name)}
                          error={touched.name && errors.name}
                          disabled={loading}
                          style={styles.inputGroup}
                        />

                        <ITInput
                          label="REFERENCIA"
                          placeholder="Ej: Junto a la entrada principal"
                          value={values.reference}
                          onChangeText={(text: string) => setFieldValue('reference', text)}
                          onBlur={() => {}}
                          disabled={loading}
                          style={styles.inputGroup}
                        />

                        <ITInput
                          label="PASILLO"
                          placeholder="Ej: A"
                          value={values.aisle}
                          onChangeText={(text: string) => setFieldValue('aisle', text)}
                          onBlur={() => {}}
                          disabled={loading}
                          style={styles.inputGroup}
                        />

                        <ITInput
                          label="SPOT"
                          placeholder="Ej: 12"
                          value={values.spot}
                          onChangeText={(text: string) => setFieldValue('spot', text)}
                          onBlur={() => {}}
                          disabled={loading}
                          style={styles.inputGroup}
                        />

                        <ITInput
                          label="NÚMERO"
                          placeholder="Ej: 101"
                          value={values.number}
                          onChangeText={(text: string) => setFieldValue('number', text)}
                          onBlur={() => {}}
                          disabled={loading}
                          style={styles.inputGroup}
                        />
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.footer}>
                    <View style={styles.actionButtonsRow}>
                      <ITButton
                        label="Cancelar"
                        onPress={onDismiss}
                        mode="outlined"
                        style={[styles.footerBtn, { flex: 1 }]}
                        disabled={loading}
                        textColor={theme.colors.slate500}
                      />
                      <View style={{ width: 12 }} />
                      <ITButton
                        label={initialData ? 'Actualizar' : 'Guardar'}
                        onPress={handleNormalSubmit}
                        mode="contained"
                        style={[
                          styles.footerBtn,
                          { flex: 1, backgroundColor: theme.colors.primary },
                        ]}
                        disabled={loading || !isValid}
                        loading={loading}
                      />
                    </View>
                    {!initialData && (
                      <ITButton
                        label="Guardar y Nueva"
                        onPress={handleSaveAndNew}
                        mode="contained"
                        style={[
                          styles.footerBtn,
                          { marginTop: 12, backgroundColor: '#EEF2FF' },
                        ]}
                        textColor={theme.colors.primary}
                        disabled={loading || !isValid}
                        icon="plus"
                      />
                    )}
                  </View>
                </View>
              );
            }}
          </Formik>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontWeight: '800',
    color: '#1E293B',
    fontSize: 22,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContent: {
    padding: 20,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
  },
  footerBtn: {
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
});
