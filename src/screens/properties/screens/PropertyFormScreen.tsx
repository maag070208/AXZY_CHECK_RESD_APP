import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Icon, Switch } from 'react-native-paper';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { showToast } from '../../../core/store/slices/toast.slice';
import {
  ITBadge,
  ITButton,
  ITInput,
  ITText,
  ITTouchableOpacity,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  createProperty,
  getHouseById,
  updateProperty,
} from '../service/properties.service';
import { IProperty } from '../service/properties.types';

const PropertySchema = Yup.object().shape({
  number: Yup.string().required('El número de casa es requerido'),
  street: Yup.string().required('La calle o vialidad es requerida'),
  block: Yup.string().optional(),
  reference: Yup.string().optional(),
  latitude: Yup.number()
    .typeError('La latitud debe ser un número')
    .min(-90, 'La latitud debe estar entre -90 y 90')
    .max(90, 'La latitud debe estar entre -90 y 90')
    .nullable()
    .transform((val) => (val === '' ? null : Number(val))),
  longitude: Yup.number()
    .typeError('La longitud debe ser un número')
    .min(-180, 'La longitud debe estar entre -180 y 180')
    .max(180, 'La longitud debe estar entre -180 y 180')
    .nullable()
    .transform((val) => (val === '' ? null : Number(val))),
  occupied: Yup.boolean().optional(),
  active: Yup.boolean().optional(),
});

const initialValues = {
  number: '',
  street: '',
  block: '',
  reference: '',
  latitude: '',
  longitude: '',
  occupied: false,
  active: true,
};

const DEFAULT_REGION = {
  latitude: 19.4326,
  longitude: -99.1332,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const PropertyFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const formikRef = useRef<any>(null);
  const mapRef = useRef<MapView>(null);

  const propertyId = route.params?.propertyId as string | undefined;
  const isEdit = !!propertyId;

  const [propertyToEdit, setPropertyToEdit] = useState<IProperty | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSavingAndNew, setIsSavingAndNew] = useState(false);
  const [locating, setLocating] = useState(false);

  const [editValues, setEditValues] = useState(initialValues);
  const [mapCenter, setMapCenter] = useState(DEFAULT_REGION);

  const updateCenterFromLatLng = useCallback(
    (latStr: string, lngStr: string) => {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (isEdit && propertyId) {
      setLoading(true);
      getHouseById(propertyId)
        .then(res => {
          if (res.success && res.data) {
            setPropertyToEdit(res.data);
            const latStr =
              res.data.latitude !== null && res.data.latitude !== undefined
                ? String(res.data.latitude)
                : '';
            const lngStr =
              res.data.longitude !== null && res.data.longitude !== undefined
                ? String(res.data.longitude)
                : '';
            setEditValues({
              number: res.data.number || '',
              street: res.data.street || '',
              block: res.data.block || '',
              reference: res.data.reference || '',
              latitude: latStr,
              longitude: lngStr,
              occupied: res.data.occupied,
              active: res.data.active,
            });
            updateCenterFromLatLng(latStr, lngStr);
          } else {
            dispatch(
              showToast({
                type: 'error',
                message: res.messages?.[0] || 'Error al cargar propiedad',
              }),
            );
            navigation.goBack();
          }
        })
        .catch(() => {
          dispatch(showToast({ type: 'error', message: 'Error al cargar propiedad' }));
          navigation.goBack();
        })
        .finally(() => setLoading(false));
    } else {
      Geolocation.getCurrentPosition(
        pos => {
          const lat = parseFloat(pos.coords.latitude.toFixed(6));
          const lng = parseFloat(pos.coords.longitude.toFixed(6));
          setMapCenter({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        },
        () => {},
        { timeout: 5000, enableHighAccuracy: false },
      );
    }
  }, [isEdit, propertyId, dispatch, navigation, updateCenterFromLatLng]);

  const handleMapLocationSelect = (lat: number, lng: number) => {
    const latStr = String(lat);
    const lngStr = String(lng);
    formikRef.current?.setFieldValue('latitude', latStr);
    formikRef.current?.setFieldValue('longitude', lngStr);
    setMapCenter(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleLocateMe = () => {
    setLocating(true);
    Geolocation.getCurrentPosition(
      pos => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        handleMapLocationSelect(lat, lng);
        setLocating(false);
      },
      () => {
        setLocating(false);
        dispatch(
          showToast({ type: 'error', message: 'No se pudo obtener la ubicación' }),
        );
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    handleMapLocationSelect(latitude, longitude);
  };

  const handleMarkerDragEnd = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    handleMapLocationSelect(latitude, longitude);
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      const payload: any = {
        number: values.number,
        street: values.street,
        block: values.block || undefined,
        reference: values.reference || undefined,
        latitude:
          values.latitude === ''
            ? null
            : Number(values.latitude),
        longitude:
          values.longitude === ''
            ? null
            : Number(values.longitude),
        occupied: values.occupied,
        active: values.active,
      };

      const res = isEdit
        ? await updateProperty(propertyId!, payload)
        : await createProperty(payload);

      if (res.success) {
        dispatch(
          showToast({
            type: 'success',
            message: isEdit
              ? 'Propiedad actualizada con éxito'
              : 'Propiedad creada con éxito',
          }),
        );

        if (isSavingAndNew && !isEdit) {
          formikRef.current?.resetForm({ values: initialValues });
          setMapCenter(DEFAULT_REGION);
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

  const currentLat =
    parseFloat(formikRef.current?.values?.latitude || editValues.latitude);
  const currentLng =
    parseFloat(formikRef.current?.values?.longitude || editValues.longitude);
  const hasCoords =
    !isNaN(currentLat) && !isNaN(currentLng);

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
              {isEdit ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </ITText>
            <ITText variant="bodySmall" color={theme.colors.slate500}>
              {isEdit
                ? 'Actualiza la información de la vivienda'
                : 'Registra una nueva vivienda en el sistema'}
            </ITText>
          </View>
        </View>

        <Formik
          innerRef={formikRef}
          initialValues={editValues}
          validationSchema={PropertySchema}
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
                {/* Section 1: Property Identification */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[styles.sectionDot, { backgroundColor: '#10B981' }]}
                    />
                    <ITText style={styles.sectionTitle}>
                      IDENTIFICACIÓN DE VIVIENDA
                    </ITText>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <ITInput
                        label="Número / Código *"
                        placeholder="Ej. A-102"
                        value={values.number}
                        onChangeText={(text: string) =>
                          setFieldValue('number', text)
                        }
                        onBlur={() => {}}
                        error={
                          errors.number ? String(errors.number) : undefined
                        }
                        touched={!!touched.number}
                      />
                    </View>
                    <View style={styles.halfField}>
                      <ITInput
                        label="Manzana / Clúster"
                        placeholder="Ej. Manzana 4"
                        value={values.block}
                        onChangeText={(text: string) =>
                          setFieldValue('block', text)
                        }
                        onBlur={() => {}}
                        error={
                          errors.block ? String(errors.block) : undefined
                        }
                        touched={!!touched.block}
                      />
                    </View>
                  </View>

                  <ITInput
                    label="Calle / Vialidad *"
                    placeholder="Ej. Av. de los Tulipanes"
                    value={values.street}
                    onChangeText={(text: string) =>
                      setFieldValue('street', text)
                    }
                    onBlur={() => {}}
                    error={
                      errors.street ? String(errors.street) : undefined
                    }
                    touched={!!touched.street}
                  />
                </View>

                {/* Section 2: References & Map */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View
                      style={[styles.sectionDot, { backgroundColor: '#6366F1' }]}
                    />
                    <ITText style={styles.sectionTitle}>
                      REFERENCIAS ADICIONALES
                    </ITText>
                  </View>

                  <ITInput
                    label="Referencias de Ubicación"
                    placeholder="Ej. Esquina con portón color café"
                    value={values.reference}
                    onChangeText={(text: string) =>
                      setFieldValue('reference', text)
                    }
                    onBlur={() => {}}
                    error={
                      errors.reference ? String(errors.reference) : undefined
                    }
                    touched={!!touched.reference}
                  />

                  <View style={{ marginTop: 20 }}>
                    <View style={styles.mapHeader}>
                      <ITText
                        variant="labelLarge"
                        weight="bold"
                        style={styles.fieldLabel}
                      >
                        Ubicación en el Mapa
                      </ITText>
                      <ITTouchableOpacity
                        onPress={handleLocateMe}
                        style={styles.locateButton}
                        disabled={locating}
                      >
                        <Icon
                          source="crosshairs-gps"
                          size={16}
                          color={locating ? theme.colors.slate400 : theme.colors.primary}
                        />
                        <ITText
                          variant="labelSmall"
                          weight="600"
                          color={
                            locating
                              ? theme.colors.slate400
                              : theme.colors.primary
                          }
                        >
                          {locating ? 'Localizando...' : 'Mi Ubicación'}
                        </ITText>
                      </ITTouchableOpacity>
                    </View>

                    <View style={styles.mapContainer}>
                      <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={mapCenter}
                        onPress={handleMapPress}
                        showsUserLocation={false}
                        showsMyLocationButton={false}
                      >
                        {hasCoords && (
                          <Marker
                            coordinate={{
                              latitude: currentLat,
                              longitude: currentLng,
                            }}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                            pinColor="#10B981"
                          />
                        )}
                      </MapView>
                    </View>

                    <View style={styles.coordRow}>
                      <View style={styles.coordBox}>
                        <Icon
                          source="map-marker"
                          size={14}
                          color="#10B981"
                        />
                        <View style={{ flex: 1 }}>
                          <ITText style={styles.coordLabel}>LATITUD</ITText>
                          <ITText style={styles.coordValue}>
                            {values.latitude || '—'}
                          </ITText>
                        </View>
                      </View>
                      <View style={styles.coordBox}>
                        <Icon
                          source="map-marker"
                          size={14}
                          color="#6366F1"
                        />
                        <View style={{ flex: 1 }}>
                          <ITText style={styles.coordLabel}>LONGITUD</ITText>
                          <ITText style={styles.coordValue}>
                            {values.longitude || '—'}
                          </ITText>
                        </View>
                      </View>
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

                  {isEdit && (
                    <View style={styles.toggleRow}>
                      <View style={{ flex: 1 }}>
                        <ITText
                          variant="bodyMedium"
                          weight="bold"
                          color={theme.colors.slate700}
                        >
                          Estado Habitada
                        </ITText>
                        <ITText
                          variant="labelSmall"
                          color={theme.colors.slate400}
                        >
                          Indica si la vivienda se encuentra actualmente
                          habitada
                        </ITText>
                      </View>
                      <ITBadge
                        label={values.occupied ? 'HABITADA' : 'NO HABITADA'}
                        variant={values.occupied ? 'primary' : 'secondary'}
                        size="medium"
                      />
                    </View>
                  )}

                  {isEdit && (
                    <View style={styles.toggleRow}>
                      <View style={{ flex: 1 }}>
                        <ITText
                          variant="bodyMedium"
                          weight="bold"
                          color={theme.colors.slate700}
                        >
                          Propiedad Activa
                        </ITText>
                        <ITText
                          variant="labelSmall"
                          color={theme.colors.slate400}
                        >
                          Habilitar o suspender temporalmente el registro en el
                          sistema
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
                        ? 'Actualizar Propiedad'
                        : 'Registrar Propiedad'
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
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
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  mapContainer: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coordBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  coordLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  coordValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
