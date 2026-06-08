import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { showToast } from '../../../core/store/slices/toast.slice';
import {
  ITButton,
  ITInput,
  ITText,
  ITTouchableOpacity,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  createComplaint,
  getComplaintCategories,
} from '../service/complaints.service';
import { IComplaintCategory } from '../service/complaints.types';

const ComplaintSchema = Yup.object().shape({
  categoryId: Yup.string().required('La categoría es requerida'),
  title: Yup.string().required('El título es requerido'),
  description: Yup.string().required('La descripción es requerida'),
});

export const ComplaintFormScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const [categories, setCategories] = useState<IComplaintCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoadingCats(true);
    getComplaintCategories()
      .then(res => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch(() => {
        dispatch(showToast({ type: 'error', message: 'Error al cargar categorías' }));
      })
      .finally(() => setLoadingCats(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      const res = await createComplaint({
        categoryId: values.categoryId,
        title: values.title,
        description: values.description,
      });

      if (res.success) {
        dispatch(
          showToast({
            type: 'success',
            message: 'Queja registrada con éxito',
          }),
        );
        navigation.goBack();
      } else {
        dispatch(
          showToast({
            type: 'error',
            message: res.messages?.[0] || 'Error al registrar la queja',
          }),
        );
      }
    } catch (error: any) {
      dispatch(
        showToast({
          type: 'error',
          message: error?.messages?.[0] || 'Ocurrió un error',
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Formik
          initialValues={{
            categoryId: '',
            title: '',
            description: '',
          }}
          validationSchema={ComplaintSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, handleSubmit: formikSubmit }) => (
            <View style={{ flex: 1 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: insets.bottom + 120 },
                ]}
                keyboardShouldPersistTaps="handled"
              >
                <ITText
                  variant="labelLarge"
                  weight="bold"
                  style={styles.fieldLabel}
                >
                  Categoría *
                </ITText>
                {loadingCats ? (
                  <View style={styles.loadingCats}>
                    <ITText
                      variant="bodyMedium"
                      color={theme.colors.slate400}
                    >
                      Cargando categorías...
                    </ITText>
                  </View>
                ) : (
                  <View style={styles.categoryGrid}>
                    {categories.map(cat => {
                      const isSelected = values.categoryId === cat.id;
                      return (
                        <ITTouchableOpacity
                          key={cat.id}
                          onPress={() => setFieldValue('categoryId', cat.id)}
                          style={[
                            styles.categoryChip,
                            isSelected && styles.categoryChipSelected,
                          ]}
                        >
                          <Icon
                            source={(cat.icon as any) || 'alert-circle-outline'}
                            size={18}
                            color={isSelected ? '#FFFFFF' : cat.color || theme.colors.primary}
                          />
                          <ITText
                            variant="labelMedium"
                            weight="700"
                            style={[
                              styles.categoryChipText,
                              isSelected && { color: '#FFFFFF' },
                            ]}
                          >
                            {cat.name}
                          </ITText>
                        </ITTouchableOpacity>
                      );
                    })}
                  </View>
                )}
                {errors.categoryId && touched.categoryId && (
                  <ITText
                    variant="labelSmall"
                    style={{ color: '#EF4444', marginTop: 4 }}
                  >
                    {String(errors.categoryId)}
                  </ITText>
                )}

                <View style={{ marginTop: 20 }}>
                  <ITInput
                    label="Asunto / Título *"
                    placeholder="Ej. Luminaria fundida en calle principal"
                    value={values.title}
                    onChangeText={(text: string) =>
                      setFieldValue('title', text)
                    }
                    onBlur={() => {}}
                    error={errors.title ? String(errors.title) : undefined}
                    touched={!!touched.title}
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <ITInput
                    label="Descripción detallada *"
                    placeholder="Explica detalladamente la problemática..."
                    value={values.description}
                    onChangeText={(text: string) =>
                      setFieldValue('description', text)
                    }
                    onBlur={() => {}}
                    error={
                      errors.description ? String(errors.description) : undefined
                    }
                    touched={!!touched.description}
                    multiline
                    numberOfLines={5}
                  />
                </View>
              </ScrollView>

              <View
                style={[
                  styles.footer,
                  { paddingBottom: insets.bottom + 16 },
                ]}
              >
                <ITButton
                  label="Cancelar"
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.footerBtn}
                />
                <ITButton
                  label={saving ? 'Registrando...' : 'Registrar Queja'}
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
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  loadingCats: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: '#334155',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
