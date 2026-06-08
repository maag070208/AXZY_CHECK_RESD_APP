import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useRef, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Icon, Searchbar, Switch, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { showToast } from '../../../core/store/slices/toast.slice';
import { getCatalog } from '../../../shared/service/catalog.service';
import {
  ITButton,
  ITInput,
  ITText,
  ITTouchableOpacity,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  createResident,
  getResidentById,
  updateResident,
} from '../service/residents.service';
import { IResident } from '../service/residents.types';

interface HouseOption {
  id: string;
  value: string;
}

const getValidationSchema = (isEdit: boolean) =>
  Yup.object().shape({
    user: isEdit
      ? Yup.object().optional()
      : Yup.object({
          name: Yup.string().required('Nombre es requerido'),
          lastName: Yup.string().optional(),
          username: Yup.string()
            .required('Usuario es requerido')
            .min(3, 'Mínimo 3 caracteres'),
          password: Yup.string()
            .required('Contraseña es requerida')
            .min(6, 'Mínimo 6 caracteres'),
        }),
    houseId: Yup.string().required('La casa asignada es requerida'),
    phone: Yup.string().optional(),
    email: Yup.string().email('Formato de correo inválido').optional(),
    isOwner: Yup.boolean().optional(),
    active: Yup.boolean().optional(),
  });

const initialValues = {
  user: { name: '', lastName: '', username: '', password: '' },
  houseId: '',
  phone: '',
  email: '',
  isOwner: false,
  active: true,
};

export const ResidentFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const formikRef = useRef<any>(null);

  const residentId = route.params?.residentId as string | undefined;
  const isEdit = !!residentId;

  const [residentToEdit, setResidentToEdit] = useState<IResident | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingHouses, setLoadingHouses] = useState(false);
  const [houses, setHouses] = useState<HouseOption[]>([]);
  const [houseSearch, setHouseSearch] = useState('');
  const [housePickerVisible, setHousePickerVisible] = useState(false);
  const [isSavingAndNew, setIsSavingAndNew] = useState(false);

  const [editValues, setEditValues] = useState(initialValues);

  useEffect(() => {
    setLoadingHouses(true);
    getCatalog('house')
      .then(res => {
        if (res.success && res.data) {
          setHouses(
            res.data.map((h: any) => ({
              id: h.id,
              value: h.value || h.number || h.name || '',
            })),
          );
        }
      })
      .catch(() => {
        dispatch(showToast({ type: 'error', message: 'Error al cargar casas' }));
      })
      .finally(() => setLoadingHouses(false));
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && residentId) {
      setLoading(true);
      getResidentById(residentId)
        .then(res => {
          if (res.success && res.data) {
            setResidentToEdit(res.data);
            setEditValues({
              user: { name: '', lastName: '', username: '', password: '' },
              houseId: res.data.houseId || '',
              phone: res.data.phone || '',
              email: res.data.email || '',
              isOwner: res.data.isOwner,
              active: res.data.active,
            });
          } else {
            dispatch(
              showToast({
                type: 'error',
                message: res.messages?.[0] || 'Error al cargar residente',
              }),
            );
            navigation.goBack();
          }
        })
        .catch(() => {
          dispatch(showToast({ type: 'error', message: 'Error al cargar residente' }));
          navigation.goBack();
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, residentId, dispatch, navigation]);

  const filteredHouses = houses.filter(h =>
    h.value.toLowerCase().includes(houseSearch.toLowerCase()),
  );

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      const payload: any = {
        houseId: values.houseId,
        phone: values.phone,
        email: values.email,
        isOwner: values.isOwner,
        active: values.active,
      };

      if (!isEdit) {
        payload.user = {
          name: values.user.name,
          lastName: values.user.lastName || undefined,
          username: values.user.username,
          password: values.user.password,
        };
      }

      const res = isEdit
        ? await updateResident(residentId!, payload)
        : await createResident(payload);

      if (res.success) {
        dispatch(
          showToast({
            type: 'success',
            message: isEdit
              ? 'Residente actualizado con éxito'
              : 'Residente creado con éxito',
          }),
        );

        if (isSavingAndNew && !isEdit) {
          formikRef.current?.resetForm({ values: initialValues });
        } else {
          navigation.goBack();
        }
      } else {
        dispatch(
          showToast({
            type: 'error',
            message: res.messages?.[0] || 'Error en la operación',
          }),
        );
      }
    } catch (error: any) {
      dispatch(
        showToast({
          type: 'error',
          message: error?.messages?.[0] || 'Ocurrió un error en la solicitud',
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  const getSelectedHouseLabel = (houseId: string) => {
    const h = houses.find(h => h.id === houseId);
    return h ? h.value : undefined;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ITText variant="bodyLarge" color={theme.colors.slate500}>
          Cargando...
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
        <View style={styles.header}>
          <ITTouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon source="arrow-left" size={24} color={theme.colors.slate700} />
          </ITTouchableOpacity>
          <View style={{ flex: 1 }}>
            <ITText
              variant="headlineSmall"
              weight="bold"
              color={theme.colors.slate900}
            >
              {isEdit ? 'Editar Residente' : 'Nuevo Residente'}
            </ITText>
            <ITText variant="bodySmall" color={theme.colors.slate500}>
              {isEdit
                ? 'Actualiza la información del residente'
                : 'Registra un nuevo residente en el sistema'}
            </ITText>
          </View>
        </View>

        <Formik
          innerRef={formikRef}
          initialValues={editValues}
          validationSchema={getValidationSchema(isEdit)}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            setFieldValue,
            handleSubmit: formikSubmit,
          }) => (
            <View style={{ flex: 1 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContent,
                  { paddingBottom: insets.bottom + 140 },
                ]}
                keyboardShouldPersistTaps="handled"
              >
                {/* Section 1: Property Mapping */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[styles.sectionDot, { backgroundColor: '#10B981' }]}
                    />
                    <ITText style={styles.sectionTitle}>
                      ASIGNACIÓN DE PROPIEDAD
                    </ITText>
                  </View>

                  {!isEdit ? (
                    <View style={styles.credentialGrid}>
                      <ITText style={styles.credentialSubtitle}>
                        CREAR CREDENCIALES DE ACCESO
                      </ITText>
                      <View style={styles.row}>
                        <View style={styles.halfField}>
                          <ITInput
                            label="Nombre"
                            placeholder="Ej. Carlos"
                            value={values.user.name}
                            onChangeText={(text: string) =>
                              setFieldValue('user.name', text)
                            }
                            onBlur={() => {}}
                            error={
                              errors.user && (errors.user as any).name
                                ? String((errors.user as any).name)
                                : undefined
                            }
                            touched={
                              touched.user && (touched.user as any).name
                            }
                          />
                        </View>
                        <View style={styles.halfField}>
                          <ITInput
                            label="Apellido"
                            placeholder="Ej. González"
                            value={values.user.lastName}
                            onChangeText={(text: string) =>
                              setFieldValue('user.lastName', text)
                            }
                            onBlur={() => {}}
                            error={
                              errors.user && (errors.user as any).lastName
                                ? String((errors.user as any).lastName)
                                : undefined
                            }
                            touched={
                              touched.user && (touched.user as any).lastName
                            }
                          />
                        </View>
                      </View>
                      <ITInput
                        label="Nombre de Usuario (Acceso)"
                        placeholder="Ej. carlosg"
                        value={values.user.username}
                        onChangeText={(text: string) =>
                          setFieldValue('user.username', text)
                        }
                        onBlur={() => {}}
                        error={
                          errors.user && (errors.user as any).username
                            ? String((errors.user as any).username)
                            : undefined
                        }
                        touched={
                          touched.user && (touched.user as any).username
                        }
                        autoCapitalize="none"
                      />
                      <ITInput
                        label="Contraseña"
                        placeholder="Contraseña de acceso"
                        value={values.user.password}
                        onChangeText={(text: string) =>
                          setFieldValue('user.password', text)
                        }
                        onBlur={() => {}}
                        error={
                          errors.user && (errors.user as any).password
                            ? String((errors.user as any).password)
                            : undefined
                        }
                        touched={
                          touched.user && (touched.user as any).password
                        }
                        secureTextEntry
                      />
                    </View>
                  ) : (
                    <View style={styles.userCard}>
                      <ITText style={styles.userCardLabel}>
                        USUARIO ASOCIADO
                      </ITText>
                      <ITText
                        variant="bodyMedium"
                        weight="bold"
                        color={theme.colors.slate700}
                      >
                        {residentToEdit?.user?.name}{' '}
                        {residentToEdit?.user?.lastName || ''}
                      </ITText>
                      <ITText
                        variant="labelSmall"
                        color={theme.colors.slate400}
                        style={{ marginTop: 2 }}
                      >
                        @{residentToEdit?.user?.username}
                      </ITText>
                    </View>
                  )}

                  <View style={{ marginTop: 16 }}>
                    <ITText
                      variant="labelLarge"
                      weight="bold"
                      style={styles.fieldLabel}
                    >
                      Casa / Vivienda *
                    </ITText>
                    <ITTouchableOpacity
                      onPress={() => setHousePickerVisible(true)}
                      style={[
                        styles.selector,
                        errors.houseId &&
                          touched.houseId &&
                          styles.selectorError,
                      ]}
                    >
                      <ITText
                        variant="bodyMedium"
                        color={
                          values.houseId
                            ? theme.colors.slate900
                            : theme.colors.slate400
                        }
                        style={{ flex: 1 }}
                      >
                        {loadingHouses
                          ? 'Cargando casas...'
                          : getSelectedHouseLabel(values.houseId) ||
                            'Seleccionar casa...'}
                      </ITText>
                      <Icon
                        source="chevron-down"
                        size={20}
                        color={theme.colors.slate400}
                      />
                    </ITTouchableOpacity>
                    {errors.houseId && touched.houseId && (
                      <ITText
                        variant="labelSmall"
                        style={{ color: '#EF4444', marginTop: 4 }}
                      >
                        {String(errors.houseId)}
                      </ITText>
                    )}
                  </View>
                </View>

                {/* Section 2: Contact Info */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[styles.sectionDot, { backgroundColor: '#6366F1' }]}
                    />
                    <ITText style={styles.sectionTitle}>
                      INFORMACIÓN DE CONTACTO
                    </ITText>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <ITInput
                        label="Teléfono Móvil"
                        placeholder="Ej. +52 5512345678"
                        value={values.phone}
                        onChangeText={(text: string) =>
                          setFieldValue('phone', text)
                        }
                        onBlur={() => {}}
                        error={errors.phone ? String(errors.phone) : undefined}
                        touched={!!touched.phone}
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View style={styles.halfField}>
                      <ITInput
                        label="Correo Electrónico"
                        placeholder="Ej. residente@email.com"
                        value={values.email}
                        onChangeText={(text: string) =>
                          setFieldValue('email', text)
                        }
                        onBlur={() => {}}
                        error={errors.email ? String(errors.email) : undefined}
                        touched={!!touched.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </View>

                {/* Section 3: Configuration */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[styles.sectionDot, { backgroundColor: '#8B5CF6' }]}
                    />
                    <ITText style={styles.sectionTitle}>
                      CONFIGURACIÓN
                    </ITText>
                  </View>

                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <ITText
                        variant="bodyMedium"
                        weight="bold"
                        color={theme.colors.slate700}
                      >
                        Propietario Legal
                      </ITText>
                      <ITText
                        variant="labelSmall"
                        color={theme.colors.slate400}
                      >
                        Indica si esta persona es dueña de la propiedad
                      </ITText>
                    </View>
                    <Switch
                      value={values.isOwner}
                      onValueChange={(val: boolean) => {
                        setFieldValue('isOwner', val);
                      }}
                      color={theme.colors.primary}
                    />
                  </View>

                  {isEdit && (
                    <View style={styles.toggleRow}>
                      <View style={{ flex: 1 }}>
                        <ITText
                          variant="bodyMedium"
                          weight="bold"
                          color={theme.colors.slate700}
                        >
                          Estado del Residente
                        </ITText>
                        <ITText
                          variant="labelSmall"
                          color={theme.colors.slate400}
                        >
                          Habilitar o suspender temporalmente los accesos y
                          alertas
                        </ITText>
                      </View>
                      <Switch
                        value={values.active}
                        onValueChange={(val: boolean) => {
                          setFieldValue('active', val);
                        }}
                        color={theme.colors.primary}
                      />
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Fixed Footer */}
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

                {!isEdit && (
                  <ITButton
                    label="Guardar y Nueva"
                    onPress={() => {
                      setIsSavingAndNew(true);
                      setTimeout(() => formikSubmit(), 0);
                    }}
                    disabled={saving}
                    style={[styles.footerBtn, { backgroundColor: '#F59E0B' }]}
                  />
                )}

                <ITButton
                  label={
                    saving
                      ? 'Procesando...'
                      : isEdit
                        ? 'Actualizar Residente'
                        : 'Registrar Residente'
                  }
                  onPress={() => {
                    setIsSavingAndNew(false);
                    formikSubmit();
                  }}
                  disabled={saving}
                  loading={saving}
                  style={styles.footerBtn}
                />
              </View>

              {/* House Picker Modal - inside Formik so setFieldValue is in scope */}
              <Modal
                visible={housePickerVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setHousePickerVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <ITText
                        variant="titleMedium"
                        weight="bold"
                        color={theme.colors.slate900}
                      >
                        Seleccionar Casa
                      </ITText>
                      <ITTouchableOpacity
                        onPress={() => setHousePickerVisible(false)}
                      >
                        <Icon
                          source="close"
                          size={24}
                          color={theme.colors.slate500}
                        />
                      </ITTouchableOpacity>
                    </View>

                    <Searchbar
                      placeholder="Buscar casa..."
                      onChangeText={setHouseSearch}
                      value={houseSearch}
                      style={styles.modalSearch}
                      inputStyle={{ fontSize: 14 }}
                      iconColor={theme.colors.slate400}
                      placeholderTextColor="#94A3B8"
                      elevation={0}
                    />

                    <FlatList
                      data={filteredHouses}
                      keyExtractor={item => item.id}
                      renderItem={({ item }) => (
                        <TouchableRipple
                          onPress={() => {
                            setFieldValue('houseId', item.id, true);
                            setHousePickerVisible(false);
                            setHouseSearch('');
                          }}
                        >
                          <View style={styles.houseItem}>
                            <Icon
                              source="home-outline"
                              size={20}
                              color={theme.colors.primary}
                            />
                            <ITText
                              variant="bodyMedium"
                              weight="500"
                              color={theme.colors.slate700}
                              style={{ flex: 1 }}
                            >
                              {item.value}
                            </ITText>
                            {values.houseId === item.id && (
                              <Icon
                                source="check-circle"
                                size={20}
                                color={theme.colors.primary}
                              />
                            )}
                          </View>
                        </TouchableRipple>
                      )}
                      ListEmptyComponent={
                        <View style={styles.emptyList}>
                          <ITText
                            variant="bodyMedium"
                            color={theme.colors.slate400}
                          >
                            {loadingHouses
                              ? 'Cargando...'
                              : 'No se encontraron casas'}
                          </ITText>
                        </View>
                      }
                    />
                  </View>
                </View>
              </Modal>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionDot: {
    width: 6,
    height: 16,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.5,
  },
  credentialGrid: {
    gap: 12,
  },
  credentialSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  userCard: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  userCardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  selectorError: {
    borderColor: '#EF4444',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalSearch: {
    margin: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  houseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  emptyList: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
