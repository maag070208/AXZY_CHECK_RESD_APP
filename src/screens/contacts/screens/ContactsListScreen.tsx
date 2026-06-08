import { useFocusEffect } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB, Icon, Searchbar, Switch } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';
import {
  ITAlert,
  ITBadge,
  ITButton,
  ITDialog,
  ITInput,
  ITScreenDatatableLayout,
  ITText,
  ITTouchableOpacity,
} from '../../../shared/components';
import { SearchComponent, SearchOption } from '../../../shared/components/SearchComponent';
import { getCatalog } from '../../../shared/service/catalog.service';
import { theme } from '../../../shared/theme/theme';
import {
  createContact,
  deleteContact,
  getPaginatedContacts,
  updateContact,
} from '../service/contacts.service';
import { IContact } from '../service/contacts.types';
import * as yup from 'yup';

const contactSchema = yup.object().shape({
  name: yup.string().required('El nombre es obligatorio'),
  kinship: yup.string().required('El parentesco es obligatorio'),
  phone: yup
    .string()
    .matches(/^\d{10}$/, 'Deben ser 10 dígitos')
    .notRequired(),
  email: yup.string().email('Correo electrónico inválido'),
  active: yup.boolean(),
});

interface ContactFormValues {
  name: string;
  kinship: string;
  phone: string;
  email: string;
  active: boolean;
}

const initialFormValues: ContactFormValues = {
  name: '',
  kinship: '',
  phone: '',
  email: '',
  active: true,
};

export const ContactsListScreen = () => {
  const dispatch = useDispatch();

  const [contacts, setContacts] = useState<IContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [kinshipFilter, setKinshipFilter] = useState<string>('all');

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<IContact | null>(null);
  const [creating, setCreating] = useState(false);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [kinshipOptions, setKinshipOptions] = useState<SearchOption[]>([]);

  useEffect(() => {
    const loadKinship = async () => {
      try {
        const res = await getCatalog('kinship');
        if (res.success && res.data) {
          const options = (res.data as Array<{ id: string; name: string }>).map(
            item => ({
              label: item.name,
              value: item.name,
            }),
          );
          setKinshipOptions(options);
        }
      } catch {
        // Silently fail — kinship catalog may not be available
      }
    };
    loadKinship();
  }, []);

  const fetchData = useCallback(
    async (pageNum = 1) => {
      try {
        if (pageNum === 1) setLoading(true);

        const filters: Record<string, unknown> = {};
        if (search) filters.name = search;
        if (kinshipFilter !== 'all') filters.kinship = kinshipFilter;

        const res = await getPaginatedContacts({
          page: pageNum,
          limit: 10,
          filters,
        });

        if (res.success && res.data) {
          setContacts(prev =>
            pageNum === 1 ? res.data.rows : [...prev, ...res.data.rows],
          );
          setTotal(res.data.total || 0);
          setPage(pageNum);
        }
      } catch {
        dispatch(
          showToast({ message: 'Error al cargar contactos', type: 'error' }),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, kinshipFilter, dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchData(1);
    }, [fetchData]),
  );

  const handleDeletePress = (id: number) => {
    setContactToDelete(id);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteContact(contactToDelete);
      if (res.success) {
        dispatch(
          showToast({ message: 'Contacto eliminado', type: 'success' }),
        );
        fetchData(1);
      } else {
        dispatch(
          showToast({
            message: res.messages?.[0] || 'Error al eliminar',
            type: 'error',
          }),
        );
      }
    } catch {
      dispatch(showToast({ message: 'Error inesperado', type: 'error' }));
    } finally {
      setIsDeleting(false);
      setDeleteDialogVisible(false);
      setContactToDelete(null);
    }
  };

  const handleSubmitForm = async (
    values: ContactFormValues,
  ) => {
    setCreating(true);
    try {
      const res = editingContact
        ? await updateContact(editingContact.id, values)
        : await createContact(values);

      if (res.success) {
        dispatch(
          showToast({
            message: editingContact
              ? 'Contacto actualizado con éxito'
              : 'Contacto creado con éxito',
            type: 'success',
          }),
        );
        setDialogVisible(false);
        setEditingContact(null);
        fetchData(1);
      } else {
        dispatch(
          showToast({
            message: res.messages?.[0] || 'Error al guardar contacto',
            type: 'error',
          }),
        );
      }
    } catch {
      dispatch(showToast({ message: 'Error inesperado', type: 'error' }));
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }: { item: IContact }) => (
    <ITTouchableOpacity
      style={styles.card}
      onPress={() => {
        setEditingContact(item);
        setDialogVisible(true);
      }}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <ITText
              variant="bodyLarge"
              weight="bold"
              color="#0F172A"
              numberOfLines={1}
            >
              {item.name}
            </ITText>
            {!item.active && (
              <ITBadge label="Inactivo" variant="default" size="small" />
            )}
          </View>
          <View style={styles.cardActions}>
            <ITTouchableOpacity
              onPress={() => handleDeletePress(item.id)}
              style={styles.deleteBtn}
            >
              <Icon source="trash-can-outline" size={20} color="#EF4444" />
            </ITTouchableOpacity>
            <Icon source="chevron-right" size={20} color="#CBD5E1" />
          </View>
        </View>

        <View style={styles.cardMeta}>
          <ITBadge
            label={item.kinship}
            variant="primary"
            size="small"
          />
          {item.phone ? (
            <View style={styles.metaItem}>
              <Icon source="phone-outline" size={14} color="#94A3B8" />
              <ITText variant="labelSmall" color="#64748B">
                {item.phone}
              </ITText>
            </View>
          ) : null}
        </View>

        {item.email ? (
          <View style={styles.metaItem}>
            <Icon source="email-outline" size={14} color="#94A3B8" />
            <ITText variant="bodySmall" color="#94A3B8">
              {item.email}
            </ITText>
          </View>
        ) : null}
      </View>
    </ITTouchableOpacity>
  );

  const renderFormDialog = () => {
    const contact = editingContact;
    const formInitial: ContactFormValues = contact
      ? {
          name: contact.name,
          kinship: contact.kinship,
          phone: contact.phone || '',
          email: contact.email || '',
          active: contact.active,
        }
      : initialFormValues;

    return (
      <Formik
        initialValues={formInitial}
        validationSchema={contactSchema}
        onSubmit={handleSubmitForm}
        enableReinitialize
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => (
          <ITDialog
            visible={dialogVisible}
            onDismiss={() => {
              setDialogVisible(false);
              setEditingContact(null);
            }}
            title={contact ? 'Editar Contacto' : 'Nuevo Contacto'}
            icon={contact ? 'account-edit-outline' : 'account-plus-outline'}
            iconColor={theme.colors.primary}
            actions={
              <View style={styles.dialogActionsRow}>
                <ITButton
                  label="Cancelar"
                  mode="outlined"
                  onPress={() => {
                    setDialogVisible(false);
                    setEditingContact(null);
                  }}
                  disabled={creating}
                  textColor="#64748B"
                  style={styles.dialogBtn}
                />
                <ITButton
                  label={contact ? 'Actualizar' : 'Crear'}
                  onPress={handleSubmit}
                  loading={creating}
                  disabled={creating}
                  style={[
                    styles.dialogBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              </View>
            }
          >
            <ITInput
              label="Nombre"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              error={errors.name}
              touched={touched.name}
              disabled={creating}
            />

            <SearchComponent
              label="Parentesco"
              value={values.kinship}
              options={kinshipOptions}
              onSelect={val => setFieldValue('kinship', String(val))}
              disabled={creating}
            />

            <ITInput
              label="Teléfono"
              value={values.phone}
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              error={errors.phone}
              touched={touched.phone}
              keyboardType="phone-pad"
              placeholder="10 dígitos"
              maxLength={10}
              disabled={creating}
            />

            <ITInput
              label="Correo Electrónico"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled={creating}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <ITText variant="bodyMedium" weight="bold" color="#0F172A">
                  Activo
                </ITText>
                <ITText variant="labelSmall" color="#94A3B8">
                  {values.active
                    ? 'Visible en el sistema'
                    : 'Oculto en el sistema'}
                </ITText>
              </View>
              <Switch
                value={values.active}
                onValueChange={(v: boolean) => { setFieldValue('active', v); }}
                color={theme.colors.primary}
                disabled={creating}
              />
            </View>
          </ITDialog>
        )}
      </Formik>
    );
  };

  return (
    <View style={styles.container}>
      <ITScreenDatatableLayout
        title="Mis Contactos"
        totalItems={total}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => fetchData(1)}
        showSearchBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchBar={
          <Searchbar
            placeholder="Buscar contacto..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
            placeholderTextColor="#94A3B8"
            elevation={0}
          />
        }
        filterBadges={
          <View style={styles.badgesRow}>
            <ITTouchableOpacity onPress={() => setKinshipFilter('all')}>
              <ITBadge
                label="TODOS"
                variant={kinshipFilter === 'all' ? 'primary' : 'default'}
                size="small"
              />
            </ITTouchableOpacity>
            {kinshipOptions.map(opt => (
              <ITTouchableOpacity
                key={String(opt.value)}
                onPress={() => setKinshipFilter(String(opt.value))}
              >
                <ITBadge
                  label={opt.label}
                  variant={
                    kinshipFilter === String(opt.value) ? 'primary' : 'default'
                  }
                  size="small"
                />
              </ITTouchableOpacity>
            ))}
          </View>
        }
        data={contacts}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onLoadMore={() => {
          if (page * 10 < total) fetchData(page + 1);
        }}
        fab={
          <FAB
            icon="plus"
            onPress={() => {
              setEditingContact(null);
              setDialogVisible(true);
            }}
            style={styles.fab}
            color="#FFFFFF"
          />
        }
      />

      {renderFormDialog()}

      <ITAlert
        visible={deleteDialogVisible}
        onDismiss={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDelete}
        title="Eliminar Contacto"
        description="Esta acción eliminará permanentemente el contacto del sistema. ¿Deseas continuar?"
        confirmLabel="Eliminar"
        type="alert"
        loading={isDeleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  searchBar: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchInput: {
    minHeight: 0,
    fontSize: 14,
    color: '#0F172A',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  switchLabel: {
    flex: 1,
    gap: 2,
  },
  dialogActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogBtn: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
  fab: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    marginBottom: 16,
  },
});
