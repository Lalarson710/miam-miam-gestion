/**
 * Edit vente screen - form for editing an existing sale with multiple lines.
 */

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { ProduitController } from '@/controllers/ProduitController';
import { VenteController } from '@/controllers/VenteController';
import { Produit, ValidationError, VenteInput, VenteLigneInput } from '@/types';
import { VenteFormView } from '@/views/ventes/VenteFormView';

export default function EditVenteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const venteId = parseInt(id, 10);

  const [produits, setProduits] = useState<Produit[]>([]);
  const [lignes, setLignes] = useState<VenteLigneInput[]>([]);
  const [dateVente, setDateVente] = useState('');
  const [modePaiement, setModePaiement] = useState<string | null>(null);
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const loadProduits = useCallback(() => {
    setProduits(ProduitController.getProduitsActifs());
  }, []);

  const loadVente = useCallback(() => {
    const result = VenteController.getVente(venteId);
    if (result) {
      setLignes(result.lignes.map((l) => ({
        produit_id: l.produit_id,
        nom_produit: l.nom_produit,
        quantite: l.quantite,
        prix_unitaire: l.prix_unitaire,
      })));
      setDateVente(result.vente.date_vente);
      setModePaiement(result.vente.mode_paiement);
      setObservation(result.vente.observation ?? '');
    } else {
      router.back();
    }
  }, [venteId]);

  useFocusEffect(
    useCallback(() => {
      loadProduits();
      loadVente();
    }, [loadProduits, loadVente]),
  );

  const handleSave = () => {
    const input: VenteInput = {
      date_vente: dateVente,
      lignes,
      mode_paiement: modePaiement as any,
      observation: observation || undefined,
    };

    setLoading(true);
    const result = VenteController.updateVente(venteId, input);
    if (result.success) {
      router.back();
    } else {
      setErrors(result.errors ?? []);
    }
    setLoading(false);
  };

  return (
    <VenteFormView
      produits={produits}
      lignes={lignes}
      date_vente={dateVente}
      modePaiement={modePaiement}
      observation={observation}
      loading={loading}
      errors={errors}
      onLignesChange={setLignes}
      onDateChange={setDateVente}
      onModePaiementChange={setModePaiement}
      onObservationChange={setObservation}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}
