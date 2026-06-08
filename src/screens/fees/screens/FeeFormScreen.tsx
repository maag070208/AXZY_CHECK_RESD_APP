import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Switch } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { showToast } from '../../../core/store/slices/toast.slice';
import {
  ITButton,
  ITDatePicker,
  ITInput,
  ITInputNumeric,
  ITText,
  SearchComponent,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  createFee,
  getFees,
  updateFee,
} from '../service/fees.service';
import { IFee } from '../service/fees.types';

const FEE_TYPE_OPTIONS = [
  { label: 'MENSUAL', value: 'MONTHLY' },
  { label: 'ÚNICO', value: 'ONE_TIME' },
];

const FeeSchema = Yup.object().shape({
  name: Yup.string().required('El nombre es obligatorio'),
  amount: Yup.string().required('El monto es obligatorio'),
  type: Yup.string().required('El tipo es obligatorio'),
});

interface RouteParams {
  feeId?: string;
}

export const FeeFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const formikRef = useRef<any>(null);

  const { feeId } = (route.params || {}) as RouteParams;
  const isEditing = !!feeId;

  const [fee, setFee] = useState<IFee | null>(null);
  const [loadingFee, setLoadingFee] = useState(!!feeId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!feeId) return;
    (async () => {
      try {
        const res = await getFees();
        if (res.success && res.data) {
          const found = res.data.find((f: IFee) => f.id === feeId);
          if (found) setFee(found);
        }
      } catch {
        dispatch(
          showToast({ message: 'Error al cargar cuota', type: 'error' }),
        );
      } finally {
        setLoadingFee(false);
      }
    })();
  }, [feeId, dispatch]);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        amount: parseFloat(values.amount),
        type: values.type,
        dueDate: values.dueDate
          ? dayjs(values.dueDate).format('YYYY-MM-DD')
          : undefined,
        active: values.active,
      };

      const res = isEditing
        ? await updateFee(feeId, payload)
        : await createFee(payload);

      if (res.success) {
        dispatch(
          showToast({
            message: isEditing
              ? 'Cuota actualizada con éxito'
              : 'Cuota creada con éxito',
            type: 'success',
          }),
        );
        navigation.goBack();
      } else {
        dispatch(
          showToast({
            message: res.messages?.[0] || 'Error al guardar cuota',
            type: 'error',
          }),
        );
      }
    } catch {
      dispatch(showToast({ message: 'Error inesperado', type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  if (loadingFee) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ITText variant="bodyMedium" color={theme.colors.slate400}>
          Cargando cuota...
        </ITText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Formik
          innerRef={formikRef}
          enableReinitialize
          initialValues={{
            name: fee?.name || '',
            description: fee?.description || '',
            amount: fee ? String(fee.amount) : '',
            type: fee?.type || 'MONTHLY',
            dueDate: fee?.dueDate ? dayjs(fee.dueDate).toDate() : undefined,
            active: fee?.active ?? true,
          }}
          validationSchema={FeeSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            setFieldValue,
            values,
            errors,
            touched,
            handleSubmit: formikSubmit,
          }) => (
            <View style={{ flex: 1 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: insets.bottom + 120 },
                ]}
                keyboardShouldPersistTaps="handled"
              >
                <ITInput
                  label="Nombre *"
                  placeholder="Ej. Cuota de mantenimiento"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={errors.name ? String(errors.name) : undefined}
                  touched={!!touched.name}
                />

                <View style={{ marginTop: 12 }}>
                  <ITInput
                    label="Descripción"
                    placeholder="Descripción opcional de la cuota"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <ITInputNumeric
                    label="Monto *"
                    placeholder="Ej. 2500.00"
                    value={values.amount}
                    onChangeText={handleChange('amount')}
                    onBlur={handleBlur('amount')}
                    error={errors.amount ? String(errors.amount) : undefined}
                    touched={!!touched.amount}
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <SearchComponent
                    label="Tipo *"
                    options={FEE_TYPE_OPTIONS}
                    value={values.type}
                    onSelect={val => setFieldValue('type', val as string)}
                    error={touched.type && errors.type ? String(errors.type) : undefined}
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <ITDatePicker
                    label="Fecha de Vencimiento"
                    value={values.dueDate}
                    onConfirm={date => setFieldValue('dueDate', date)}
                    error={errors.dueDate ? String(errors.dueDate) : undefined}
                    touched={!!touched.dueDate}
                  />
                </View>

                <View style={styles.switchRow}>
                  <ITText variant="bodyMedium" weight="bold" color="#0F172A">
                    Activo
                  </ITText>
                  <Switch
                    value={values.active}
                    onValueChange={v => setFieldValue('active', v)}
                    color={theme.colors.primary}
                  />
                </View>
              </ScrollView>

              <View
                style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
              >
                <ITButton
                  label="Cancelar"
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.footerBtn}
                />
                <ITButton
                  label={
                    saving
                      ? 'Guardando...'
                      : isEditing
                      ? 'Actualizar Cuota'
                      : 'Guardar Cuota'
                  }
                  onPress={() => formikSubmit()}
                  disabled={saving}
                  loading={saving}
                  style={styles.footerBtn}
                />
              </View>
            </View>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    borderRadius: 12,
    height: 44,
  },
});
