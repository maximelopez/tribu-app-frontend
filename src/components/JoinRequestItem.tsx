import { useState } from 'react';
import { useFamilyStore } from '../store/familyStore';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

const TEXT_STRONG = '#161616';
const REFUSE_RED = '#EA4A1F';

interface JoinRequestItemProps {
  requestUser: { id: string; name: string };
  familyId: string;
}

export default function JoinRequestItem({ requestUser, familyId }: JoinRequestItemProps) {
  const setFamily = useFamilyStore(state => state.setFamily);
  const { theme } = useTheme();
  // Évite les doubles clics pendant la requête
  const [isSubmitting, setIsSubmitting] = useState(false);

  const respond = async (accept: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}families/${familyId}/join-requests/${requestUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept }),
      });

      // Succès, ou demande devenue invalide (ex : personne déjà acceptée ailleurs) :
      // dans les deux cas, la carte n'a plus lieu d'être
      if (response.ok || response.status === 400) {
        setFamily(prev => prev ? {
          ...prev,
          joinRequests: prev.joinRequests.filter(user => user.id !== requestUser.id),
        } : prev);
      }
      // La liste des membres est rechargée par l'événement socket `memberJoined`
    } catch (error) {
      console.error('Erreur réponse demande :', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl flex flex-col items-center justify-center"
      style={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.08)', gap: 12, padding: '24px 10px' }}
    >
      <div className="flex flex-col items-center" style={{ gap: 4 }}>
        <span className="font-outfit-bold text-base text-center" style={{ color: TEXT_STRONG }}>
          Nouvelle demande
        </span>
        <span className="font-outfit text-base text-center" style={{ color: TEXT_STRONG }}>
          {requestUser.name} souhaite rejoindre votre Tribu
        </span>
      </div>

      <div className="flex w-full" style={{ gap: 19 }}>
        <button
          onClick={() => respond(false)}
          disabled={isSubmitting}
          className="flex-1 rounded-2xl flex items-center justify-center font-outfit text-base"
          style={{ height: 48, border: `2px solid ${REFUSE_RED}`, color: REFUSE_RED, background: 'none', opacity: isSubmitting ? 0.5 : 1 }}
        >
          Refuser
        </button>

        <button
          onClick={() => respond(true)}
          disabled={isSubmitting}
          className="flex-1 rounded-2xl flex items-center justify-center font-outfit text-base text-white"
          style={{ height: 48, backgroundColor: theme.primary, border: `1px solid ${theme.primary}`, opacity: isSubmitting ? 0.5 : 1 }}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
