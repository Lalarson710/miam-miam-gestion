/**
 * ProduitsListView - Product list view with search and CRUD actions.
 * Pure component: receives data and callbacks as props.
 */

import { BorderRadius, Colors, Spacing } from '@/constants/colors';
import { Produit } from '@/types';
import { AppButton } from '@/views/components/AppButton';
import { ConfirmDialog } from '@/views/components/ConfirmDialog';
import { EmptyState } from '@/views/components/EmptyState';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface ProduitsListViewProps {
  produits: Produit[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddProduit: () => void;
  onEditProduit: (id: number) => void;
  onToggleActif: (id: number, actif: boolean) => void;
  onDeleteProduit: (id: number) => void;
  loading?: boolean;
}

export function ProduitsListView({
  produits,
  searchQuery,
  onSearchChange,
  onAddProduit,
  onEditProduit,
  onToggleActif,
  onDeleteProduit,
  loading = false,
}: ProduitsListViewProps) {
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<{
    visible: boolean;
    produitId: number | null;
    produitNom: string;
  }>({ visible: false, produitId: null, produitNom: '' });

  const handleDeletePress = (id: number, nom: string) => {
    setDeleteDialogVisible({ visible: true, produitId: id, produitNom: nom });
  };

  const handleConfirmDelete = () => {
    if (deleteDialogVisible.produitId !== null) {
      onDeleteProduit(deleteDialogVisible.produitId);
    }
    setDeleteDialogVisible({ visible: false, produitId: null, produitNom: '' });
  };

  const renderItem = ({ item }: { item: Produit }) => (
    <View style={styles.produitCard}>
      <View style={styles.produitInfo}>
        <Text style={styles.produitNom}>{item.nom}</Text>
        {item.description ? <Text style={styles.produitDesc}>{item.description}</Text> : null}
        <Text style={styles.produitPrix}>{item.prix_vente.toLocaleString()} Ar</Text>
        <View style={[styles.statusBadge, item.actif ? styles.statusActif : styles.statusInactif]}>
          <Text style={styles.statusText}>{item.actif ? 'Actif' : 'Inactif'}</Text>
        </View>
      </View>
      <View style={styles.produitActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => onEditProduit(item.id)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={Colors.primary} />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => onToggleActif(item.id, !item.actif)}
        >
          <MaterialCommunityIcons
            name={item.actif ? 'toggle-switch-off' : 'toggle-switch'}
            size={24}
            color={item.actif ? Colors.textSecondary : Colors.primary}
          />
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => handleDeletePress(item.id, item.nom)}
        >
          <MaterialCommunityIcons name="delete" size={20} color={Colors.negative} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Produits</Text>
        <AppButton title="Nouveau" onPress={onAddProduit} size="sm" />
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {produits.length === 0 ? (
        <EmptyState
          title="Aucun produit"
          message="Enregistrez votre premier plat pour commencer à vendre."
          actionLabel="Nouveau produit"
          onAction={onAddProduit}
        />
      ) : (
        <FlatList
          data={produits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ConfirmDialog
        visible={deleteDialogVisible.visible}
        title="Supprimer le produit ?"
        message={`Le produit "${deleteDialogVisible.produitNom}" sera désactivé. Voulez-vous continuer ?`}
        confirmLabel="Désactiver"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogVisible({ visible: false, produitId: null, produitNom: '' })}
        destructive
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: Colors.primaryDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  produitCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  produitInfo: {
    flex: 1,
  },
  produitNom: {
    fontSize: 16,
    fontWeight: 600,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  produitDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  produitPrix: {
    fontSize: 14,
    fontWeight: 600,
    color: Colors.primary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginTop: Spacing.xs,
  },
  statusActif: {
    backgroundColor: Colors.primaryLight,
  },
  statusInactif: {
    backgroundColor: Colors.border,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  produitActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
