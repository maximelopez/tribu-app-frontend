import { useState } from 'react';
import { useFamilyStore } from '../store/familyStore';
import ConfirmModal from './ConfirmModal';
import { api } from '../api';

// Carte « Demande envoyée » avec « Annuler la demande » (Figma : homepage-demande-en-attente, annuler-demande)
// Affichée sur l'Accueil et sur les détails de la Tribu demandée
export default function PendingRequestCard() {
  const pendingRequest = useFamilyStore(state => state.pendingRequest);
  const setPendingRequest = useFamilyStore(state => state.setPendingRequest);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  if (!pendingRequest) return null;

  const cancelRequest = async () => {
    if (cancelling) return;
    setCancelling(true);
    setCancelError('');
    try {
      const response = await api(`families/${pendingRequest.familyId}/join-requests`, { method: 'DELETE' });
      // 404 : la demande n'existe déjà plus (acceptée ou refusée entre-temps)
      if (response.ok || response.status === 404) {
        setPendingRequest(null);
      } else {
        setCancelError("Impossible d'annuler la demande. Réessaie plus tard.");
      }
    } catch (error) {
      console.error('Erreur annulation demande :', error);
      setCancelError('Impossible de se connecter au serveur.');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  return (
    <>
      <div
        className="w-full bg-white flex flex-col items-center"
        style={{ border: '1px solid #E0E7E4', borderRadius: 18, padding: 22, gap: 14 }}
      >
        <span
          className="font-outfit-bold rounded-full"
          style={{ fontSize: 12, color: '#B87000', backgroundColor: 'rgba(255, 157, 0, 0.14)', padding: '8px 14px' }}
        >
          En attente d’approbation
        </span>
        <span className="font-outfit-bold text-center" style={{ fontSize: 19, lineHeight: 'normal', color: '#1C1F1C' }}>
          Demande envoyée
        </span>
        <p className="font-outfit m-0 w-full" style={{ fontSize: 14, lineHeight: 1.5, color: '#6B7570' }}>
          Ta demande pour rejoindre « {pendingRequest.name} » a bien été envoyée. En attente de l’approbation de
          l’administrateur - une fois accepté, tu gagneras tes premiers points et badges.
        </p>
        {cancelError && (
          <p className="font-outfit text-center m-0" style={{ fontSize: 14, color: '#EA4A1F' }}>{cancelError}</p>
        )}
        <button
          onClick={() => setShowCancelModal(true)}
          className="w-full flex items-center justify-center font-outfit-bold"
          style={{ fontSize: 15, color: '#161616', backgroundColor: '#F3F3F8', borderRadius: 12, padding: '14px 0', border: 'none' }}
        >
          Annuler la demande
        </button>
      </div>

      <ConfirmModal
        visible={showCancelModal}
        title="Annuler ta demande ?"
        message={`Ta demande pour rejoindre « ${pendingRequest.name} » sera supprimée.`}
        confirmLabel="Oui, annuler"
        cancelLabel="Garder ma demande"
        loading={cancelling}
        onConfirm={cancelRequest}
        onCancel={() => setShowCancelModal(false)}
      />
    </>
  );
}
