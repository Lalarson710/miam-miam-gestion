/**
 * Nouvelle vente screen - form for creating a new sale with multiple lines.
 */
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ProduitController } from '@/controllers/ProduitController';
import { VenteController } from '@/controllers/VenteController';
import { nowISO } from '@/services/formatDate';
import { Produit, ValidationError, VenteInput, VenteLigneInput } from '@/types';
import { VenteFormView } from '@/views/ventes/VenteFormView';

export default function NouvelleVenteScreen() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [lignes, setLignes] = useState<VenteLigneInput[]>([
    { produit_id: null, nom_produit: '', quantite: 1, prix_unitaire: 0 },
  ]);
  const [dateVente, setDateVente] = useState(nowISO());
  const [modePaiement, setModePaiement] = useState<string | null>(null);
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const loadProduits = useCallback(() => {
    setProduits(ProduitController.getProduitsActifs());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProduits();
    }, [loadProduits]),
  );

  const handleSave = () => {
    const input: VenteInput = {
      date_vente: nowISO(),
      lignes,
      mode_paiement: modePaiement as any,
      observation: observation || undefined,
    };

    setLoading(true);
    const result = VenteController.createVente(input);
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
