import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { InteractionManager, Keyboard, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { showToast } from '../../../core/store/slices/toast.slice';
import { ITScreenWrapper, ITText } from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import { ResidencialFormStepper } from '../components/ResidencialFormStepper';
import {
  createClient,
  getClientById,
  updateClient,
} from '../service/residencial.service';
import { IResidencial } from '../service/residencial.types';

const ClientSchema = Yup.object().shape({
  name: Yup.string()
    .max(100, 'Nombre demasiado largo')
    .required('El nombre es requerido'),
  address: Yup.string().optional(),
  rfc: Yup.string()
    .min(12, 'El RFC debe tener al menos 12 caracteres')
    .max(13, 'El RFC no puede tener más de 13 caracteres')
    .optional(),
  contactName: Yup.string().required('El nombre del encargado es requerido'),
  contactPhone: Yup.string()
    .matches(/^[0-9]*$/, 'El teléfono solo debe contener números')
    .min(10, 'El teléfono debe tener 10 dígitos')
    .max(10, 'El teléfono debe tener 10 dígitos')
    .required('El teléfono del encargado es requerido'),
  active: Yup.boolean().required(),
  appUsername: Yup.string()
    .min(2, 'Mínimo 2 caracteres')
    .required('El nombre de usuario es requerido'),
  appPassword: Yup.string().when('$isEdit', {
    // ✅ Usa $isEdit
    is: false,
    then: schema =>
      schema
        .min(6, 'Mínimo 6 caracteres')
        .required('La contraseña es requerida'),
    otherwise: schema => schema.min(6, 'Mínimo 6 caracteres').nullable(), // Cambia optional() por nullable()
  }),
});
export const CreateResidencialScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();

  const residencialParam: IResidencial | undefined = route.params?.residencial;
  const residencialIdParam: string | undefined = route.params?.id;
  const isEditing = !!residencialParam || !!residencialIdParam;

  const [residencialToEdit, setResidencialToEdit] = useState<IResidencial | undefined>(
    residencialParam,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const idToFetch = residencialParam?.id || residencialIdParam;
    if (isEditing && idToFetch) {
      fetchFullResidencial(String(idToFetch));
    }
  }, [isEditing, residencialParam?.id, residencialIdParam]);

  const fetchFullResidencial = async (id: string) => {
    try {
      const res = await getClientById(id);
      if (res.success && res.data) {
        setResidencialToEdit(res.data);
      }
    } catch (error) {
      console.error(error);
      dispatch(
        showToast({ type: 'error', message: 'Error al cargar residencial' }),
      );
    }
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);

    try {
      const payload: any = {};

      if (values.name !== undefined) payload.name = values.name;
      if (values.address !== undefined) payload.address = values.address;
      if (values.rfc !== undefined) payload.rfc = values.rfc.toUpperCase();
      if (values.contactName !== undefined)
        payload.contactName = values.contactName;
      if (values.contactPhone !== undefined)
        payload.contactPhone = values.contactPhone;
      if (values.active !== undefined) payload.active = values.active;
      if (values.appUsername !== undefined && values.appUsername !== '')
        payload.appUsername = values.appUsername;

      // 🔑 Guardar contraseña para enviar pero no mantener en estado
      const passwordToUpdate = values.appPassword;
      if (passwordToUpdate && passwordToUpdate !== '') {
        payload.appPassword = passwordToUpdate;
      }

      let response;
      console.log('payload:', payload);

      if (isEditing) {
        payload.softDelete = values.active === false;
        if (!residencialToEdit?.id) {
          dispatch(
            showToast({
              type: 'error',
              message: 'Error: ID de residencial no encontrada',
            }),
          );
          setSaving(false);
          return;
        }

        response = await updateClient(residencialToEdit.id, payload);
      } else {
        response = await createClient(payload);
      }

      console.log(response);

      if (response && response.success) {
        // ✅ IMPORTANTE: Limpiar la contraseña del formulario ANTES de cualquier otra acción
        if (isEditing) {
          values.appPassword = ''; // Limpiar campo de contraseña
        }

        dispatch(
          showToast({
            type: 'success',
            message: isEditing
              ? 'Residencial actualizada correctamente'
              : 'Residencial registrada correctamente',
          }),
        );

        Keyboard.dismiss();

        // Pequeño delay para permitir que React complete las actualizaciones de estado
        setTimeout(() => {
          try {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.replace('CLIENT_LIST');
            }
          } catch (navError) {
            console.error('Navigation error:', navError);
            navigation.navigate('CLIENT_LIST');
          }
        }, 100);
      } else {
        const errorMsg = response?.messages?.[0] || 'Error al guardar residencial';
        dispatch(
          showToast({
            type: 'error',
            message: errorMsg,
          }),
        );
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      const message =
        error?.response?.data?.messages?.[0] ||
        error?.messages?.[0] ||
        error?.message ||
        'Ocurrió un error inesperado';

      dispatch(
        showToast({
          type: 'error',
          message,
        }),
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <ITScreenWrapper
      padding
      style={{ backgroundColor: '#FFFFFF', padding: 15 }}
    >
      <View style={styles.header}>
        <ITText
          variant="headlineSmall"
          weight="bold"
          color={theme.colors.slate900}
        >
          {isEditing ? 'Editar Residencial' : 'Nueva Residencial'}
        </ITText>
        <ITText variant="bodySmall" color={theme.colors.slate500}>
          {isEditing
            ? `Actualiza la información de ${
                residencialToEdit?.name || 'la propiedad'
              }`
            : 'Sigue los pasos para dar de alta una nueva propiedad'}
        </ITText>
      </View>

      <Formik
        enableReinitialize
        initialValues={{
          name: residencialToEdit?.name || '',
          address: residencialToEdit?.address || '',
          rfc: residencialToEdit?.rfc || '',
          contactName: residencialToEdit?.contactName || '',
          contactPhone: residencialToEdit?.contactPhone || '',
          active: isEditing ? residencialToEdit?.active ?? true : true,
          appUsername: residencialToEdit?.users?.[0]?.username || '',
          appPassword: '',
        }}
        validationSchema={ClientSchema}
        validationContext={{ isEdit: isEditing }}
        onSubmit={values => {
          handleSubmit(values);
        }}
      >
        {props => {
          return (
            <ResidencialFormStepper
              {...props}
              saving={saving}
              onSubmit={() => {
                props.handleSubmit();
              }}
              isEdit={isEditing}
            />
          );
        }}
      </Formik>
    </ITScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
});
