import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Icon, Searchbar } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';
import {
  ITAlert,
  ITBadge,
  ITButton,
  ITCard,
  ITDialog,
  ITInput,
  ITScreenDatatableLayout,
  ITText,
  ITTouchableOpacity,
} from '../../../shared/components';
import { theme } from '../../../shared/theme/theme';
import {
  CATALOGS,
  createCatalogOption,
  deleteCatalogOption,
  getCatalogOptions,
  updateCatalogOption,
} from '../service/settings.service';
import { ICatalogOption } from '../service/settings.types';

interface ICatalogWithCount {
  key: string;
  label: string;
  description: string;
  count: number;
}

export const SettingsListScreen = () => {
  const dispatch = useDispatch();

  const [catalogs, setCatalogs] = useState<ICatalogWithCount[]>(
    CATALOGS.map(c => ({ ...c, count: 0 })),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<typeof CATALOGS[0] | null>(null);
  const [options, setOptions] = useState<ICatalogOption[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingOption, setEditingOption] = useState<ICatalogOption | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; key: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCounts = useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        CATALOGS.map(c => getCatalogOptions(c.key)),
      );
      const updated = CATALOGS.map((c, i) => {
        const res = results[i];
        const count =
          res.status === 'fulfilled' && res.value.success
            ? res.value.data.length
            : 0;
        return { ...c, count };
      });
      setCatalogs(updated);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCounts();
    }, [fetchCounts]),
  );

  const handleCardPress = async (catalog: typeof CATALOGS[0]) => {
    setSelectedCatalog(catalog);
    setDialogVisible(true);
    setDialogLoading(true);
    setNewName('');
    setEditingOption(null);
    try {
      const res = await getCatalogOptions(catalog.key);
      if (res.success) {
        setOptions(res.data || []);
      } else {
        dispatch(
          showToast({ message: 'Error al cargar opciones', type: 'error' }),
        );
      }
    } catch {
      dispatch(
        showToast({ message: 'Error inesperado al cargar', type: 'error' }),
      );
    } finally {
      setDialogLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedCatalog || !newName.trim()) return;
    setSaving(true);
    try {
      const res = await createCatalogOption(selectedCatalog.key, {
        name: newName.trim(),
      });
      if (res.success) {
        dispatch(
          showToast({ message: 'Opción creada con éxito', type: 'success' }),
        );
        setNewName('');
        const refresh = await getCatalogOptions(selectedCatalog.key);
        if (refresh.success) setOptions(refresh.data || []);
        fetchCounts();
      } else {
        dispatch(
          showToast({
            message: res.messages?.[0] || 'Error al crear',
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

  const handleEdit = async () => {
    if (!selectedCatalog || !editingOption || !newName.trim()) return;
    setSaving(true);
    try {
      const res = await updateCatalogOption(
        selectedCatalog.key,
        editingOption.id,
        { name: newName.trim(), active: editingOption.active },
      );
      if (res.success) {
        dispatch(
          showToast({ message: 'Opción actualizada con éxito', type: 'success' }),
        );
        setEditingOption(null);
        setNewName('');
        const refresh = await getCatalogOptions(selectedCatalog.key);
        if (refresh.success) setOptions(refresh.data || []);
        fetchCounts();
      } else {
        dispatch(
          showToast({
            message: res.messages?.[0] || 'Error al actualizar',
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

  const handleEditPress = (option: ICatalogOption) => {
    setEditingOption(option);
    setNewName(option.name);
  };

  const handleCancelEdit = () => {
    setEditingOption(null);
    setNewName('');
  };

  const handleDeletePress = (option: ICatalogOption) => {
    if (!selectedCatalog) return;
    setDeleteTarget({ id: option.id, key: selectedCatalog.key });
    setDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteCatalogOption(deleteTarget.key, deleteTarget.id);
      if (res.success) {
        dispatch(
          showToast({ message: 'Opción eliminada', type: 'success' }),
        );
        setOptions(prev => prev.filter(o => o.id !== deleteTarget.id));
        fetchCounts();
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
      setDeleteAlertVisible(false);
      setDeleteTarget(null);
    }
  };

  const filteredCatalogs = catalogs.filter(
    c =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item }: { item: ICatalogWithCount }) => (
    <ITCard
      mode="elevated"
      elevation={1}
      style={styles.card}
      contentStyle={styles.cardContent}
      onPress={() =>
        handleCardPress(CATALOGS.find(c => c.key === item.key)!)
      }
    >
      <View style={styles.cardInner}>
        <View style={styles.cardInfo}>
          <ITText variant="bodyLarge" weight="bold" color="#0F172A">
            {item.label}
          </ITText>
          <ITText variant="bodySmall" color="#64748B" style={styles.cardDesc}>
            {item.description}
          </ITText>
        </View>
        <View style={styles.cardRight}>
          <ITBadge
            label={`${item.count}`}
            variant={item.count > 0 ? 'primary' : 'default'}
            size="small"
          />
          <Icon source="chevron-right" size={20} color="#CBD5E1" />
        </View>
      </View>
    </ITCard>
  );

  const renderOptionItem = (option: ICatalogOption) => (
    <View key={option.id} style={styles.optionRow}>
      <View style={styles.optionInfo}>
        <ITText variant="bodyMedium" weight="500" color="#0F172A">
          {option.name}
        </ITText>
        <ITBadge
          label={option.active ? 'Activo' : 'Inactivo'}
          variant={option.active ? 'success' : 'default'}
          size="small"
        />
      </View>
      <View style={styles.optionActions}>
        <ITTouchableOpacity
          style={styles.optionBtn}
          onPress={() => handleEditPress(option)}
        >
          <Icon source="pencil-outline" size={18} color="#64748B" />
        </ITTouchableOpacity>
        <ITTouchableOpacity
          style={[styles.optionBtn, styles.deleteBtn]}
          onPress={() => handleDeletePress(option)}
        >
          <Icon source="trash-can-outline" size={18} color="#EF4444" />
        </ITTouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ITScreenDatatableLayout
        title="Catálogos del Sistema"
        totalItems={filteredCatalogs.length}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => fetchCounts()}
        searchQuery={search}
        onSearchChange={setSearch}
        data={filteredCatalogs}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        showSearchBar={true}
        searchBar={
          <Searchbar
            placeholder="Buscar catálogo..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
            placeholderTextColor="#94A3B8"
            elevation={0}
          />
        }
      />

      <ITDialog
        visible={dialogVisible}
        onDismiss={() => {
          setDialogVisible(false);
          setEditingOption(null);
          setNewName('');
        }}
        title={selectedCatalog?.label || ''}
        description={selectedCatalog?.description}
        icon="cog-outline"
        cancelLabel="Cerrar"
        confirmLabel={editingOption ? 'Actualizar' : 'Agregar'}
        onConfirm={editingOption ? handleEdit : handleAdd}
        loading={saving}
        confirmDisabled={
          editingOption ? !newName.trim() : !newName.trim()
        }
      >
        {dialogLoading ? (
          <View style={styles.dialogLoader}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.dialogContent}>
            {options.length === 0 ? (
              <ITText variant="bodyMedium" color="#94A3B8" style={styles.emptyText}>
                No hay opciones registradas
              </ITText>
            ) : (
              <View style={styles.optionsList}>
                {options.map(renderOptionItem)}
              </View>
            )}

            <View style={styles.formSection}>
              <ITText
                variant="labelMedium"
                weight="bold"
                color="#64748B"
                style={styles.formLabel}
              >
                {editingOption ? 'EDITAR OPCIÓN' : 'NUEVA OPCIÓN'}
              </ITText>
              <View style={styles.formRow}>
                <View style={styles.formInput}>
                  <ITInput
                    label="Nombre"
                    placeholder="Ingrese el nombre"
                    value={newName}
                    onChangeText={setNewName}
                    disabled={saving}
                  />
                </View>
              </View>
              {editingOption && (
                <ITButton
                  label="Cancelar edición"
                  mode="text"
                  onPress={handleCancelEdit}
                  disabled={saving}
                  textColor="#64748B"
                />
              )}
            </View>
          </View>
        )}
      </ITDialog>

      <ITAlert
        visible={deleteAlertVisible}
        onDismiss={() => setDeleteAlertVisible(false)}
        onConfirm={confirmDelete}
        title="Eliminar Opción"
        description="Esta acción eliminará permanentemente esta opción del catálogo. ¿Deseas continuar?"
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
  card: {
    marginBottom: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    padding: 0,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardDesc: {
    marginTop: 4,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  dialogLoader: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  dialogContent: {
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  optionsList: {
    width: '100%',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionActions: {
    flexDirection: 'row',
    gap: 4,
  },
  optionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  formSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  formLabel: {
    letterSpacing: 1,
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  formInput: {
    flex: 1,
  },
});
