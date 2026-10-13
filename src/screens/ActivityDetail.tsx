import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Award, Check, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import type { Activity, Category, FamilyActivity } from '../store/familyStore';
import { getAvatar } from '../assets';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../api';

const CATEGORY_LABELS: Record<Category, string> = {
  cinema: 'Cinéma',
  sport: 'Sport',
  culture: 'Culture',
  parcs: 'Parcs',
  autre: 'Autre',
};

const CARD_SHADOW = '0px 4px 6px rgba(0, 0, 0, 0.08)';

export default function ActivityDetail() {
  const { activityId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const user = useUserStore(state => state.user);
  const family = useFamilyStore(state => state.family);
  const setFamily = useFamilyStore(state => state.setFamily);
  const currentActivity = useFamilyStore(state => state.currentActivity);
  const setCurrentActivity = useFamilyStore(state => state.setCurrentActivity);
  const completedActivities = useFamilyStore(state => state.completedActivities);

  // L'activité arrive par la navigation ; si on ouvre l'adresse directement, on la charge
  const [activity, setActivity] = useState<Activity | null>(location.state?.activity ?? null);

  useEffect(() => {
    if (activity || !activityId) return;
    const fetchActivity = async () => {
      try {
        const response = await api(`activities/${activityId}`);
        if (response.ok) setActivity(await response.json());
        else navigate('/activites', { replace: true });
      } catch (error) {
        console.error('Erreur fetch activité :', error);
      }
    };
    fetchActivity();
  }, [activity, activityId, navigate]);

  const hasFamily = !!user?.familyId;
  const members = family?.members ?? [];

  // Membres cochés pour participer
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Copie figée de l'activité en cours pendant qu'on quitte l'écran
  // (évite d'afficher un instant la liste des membres une fois l'activité terminée/annulée)
  const [leavingActivity, setLeavingActivity] = useState<FamilyActivity | null>(null);

  if (!activity) {
    return (
      <div className="flex-1 flex flex-col">
        <ScreenHeader />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size={36} color={theme.primary} />
        </div>
      </div>
    );
  }

  const points = activity.points ?? 0;

  // Cette activité est celle en cours dans la Tribu ?
  const ongoing = leavingActivity
    ?? (currentActivity && currentActivity.activity.id === activity._id ? currentActivity : null);
  const isStarter = !!ongoing && ongoing.startedBy === user?.id;
  const starterName = ongoing ? members.find(m => m.id === ongoing.startedBy)?.name : undefined;

  // Déjà faite par la Tribu ? (une Tribu ne fait chaque activité qu'une fois)
  const completed = !ongoing ? completedActivities.find(fa => fa.activity.id === activity._id) : undefined;
  const completedDate = completed?.completedAt
    ? new Date(completed.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const toggleParticipant = (memberId: string) => {
    setParticipants(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  // Lance l'activité pour la Tribu avec les membres cochés
  const handleChooseActivity = async () => {
    if (!user?.familyId || loading) return;

    if (participants.length === 0) {
      setErrorMessage('Choisis au moins un participant.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api(`families/${user.familyId}/activities`, {
        method: 'POST',
        body: { activityId: activity._id, participants },
      });
      const data = await response.json();

      if (!response.ok) {
        // Ex : une activité est déjà en cours, ou déjà faite par la Tribu
        setErrorMessage(data.message || 'Une erreur est survenue.');
        return;
      }

      setCurrentActivity(data.familyActivity);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur lancement activité :', error);
      setErrorMessage('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Terminer : chaque participant gagne les points (seulement celui qui l'a lancée)
  const handleCompleteActivity = async () => {
    if (!ongoing || !user?.familyId || loading) return;

    setLoading(true);
    setErrorMessage('');
    // Figé dès maintenant : le serveur prévient la Tribu en temps réel (familyActivityUpdated)
    // avant même de répondre, ce qui vide l'activité en cours pendant la requête
    setLeavingActivity(ongoing);

    try {
      const response = await api(`families/${user.familyId}/activities/${ongoing.id}/complete`, {
        method: 'PATCH',
      });
      const data = await response.json();

      if (!response.ok) {
        setLeavingActivity(null);
        setErrorMessage(data.message || 'Une erreur est survenue.');
        return;
      }

      // Écran récompense (remplace le détail : pas de retour possible dessus)
      navigate('/recompense', {
        replace: true,
        state: {
          familyName: family?.name ?? 'la Tribu',
          pointsEarned: data.familyPointsEarned,
          familyPoints: data.familyPoints,
          previousLevel: family?.levelInfo?.level ?? data.levelInfo.level,
          levelInfo: data.levelInfo,
        },
      });

      // Points et niveau de la Tribu à jour tout de suite (le temps réel recharge le reste)
      setFamily(prev => (prev ? { ...prev, points: data.familyPoints, levelInfo: data.levelInfo } : prev));
      setCurrentActivity(null);
    } catch (error) {
      setLeavingActivity(null);
      console.error("Erreur fin d'activité :", error);
      setErrorMessage('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Popup de confirmation avant d'annuler
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Annuler : aucun point, l'activité pourra être relancée
  const handleCancelActivity = async () => {
    if (!ongoing || !user?.familyId) return;

    setLoading(true);
    setErrorMessage('');
    setLeavingActivity(ongoing); // même raison que pour "Terminer"

    try {
      const response = await api(`families/${user.familyId}/activities/${ongoing.id}/cancel`, {
        method: 'PATCH',
      });
      const data = await response.json();

      if (!response.ok) {
        setLeavingActivity(null);
        setShowCancelConfirm(false);
        setErrorMessage(data.message || 'Une erreur est survenue.');
        return;
      }

      navigate('/', { replace: true });
      setCurrentActivity(null);
    } catch (error) {
      setLeavingActivity(null);
      setShowCancelConfirm(false);
      console.error('Erreur annulation activité :', error);
      setErrorMessage('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const errorText = errorMessage ? (
    <p className="font-outfit text-center m-0" style={{ fontSize: 14, color: '#EA4A1F' }}>{errorMessage}</p>
  ) : null;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader />

      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '8px 14px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
        <div className="bg-white flex flex-col" style={{ borderRadius: 16, padding: 12, gap: 12 }}>
          {/* Pastilles : catégorie (+ partenariat) */}
          <div className="flex" style={{ gap: 6 }}>
            <span
              className="font-outfit flex items-center justify-center"
              style={{ height: 21, minWidth: 81, padding: '0 10px', borderRadius: 999, backgroundColor: theme.secondary, color: theme.primary, fontSize: 14 }}
            >
              {CATEGORY_LABELS[activity.category] ?? 'Autre'}
            </span>
            {activity.isPartner && (
              <span
                className="font-outfit flex items-center justify-center"
                style={{ height: 21, padding: '0 10px', borderRadius: 999, backgroundColor: theme.transparent, color: theme.primary, fontSize: 14 }}
              >
                Partenariat
              </span>
            )}
          </div>

          {/* Illustration (TODO : illustration selon la catégorie) */}
          <div
            className="flex items-center justify-center"
            style={{ height: 260, borderRadius: 16, backgroundColor: theme.transparent }}
          >
            <ImageIcon size={48} color={theme.primary} strokeWidth={1.5} />
          </div>

          {/* Titre + description */}
          <h1 className="font-outfit-bold font-normal m-0" style={{ fontSize: 32, color: '#15201A' }}>{activity.name}</h1>
          <p className="font-outfit m-0" style={{ fontSize: 14, color: '#969696' }}>{activity.description}</p>

          {/* Récompense */}
          <div className="flex items-center bg-white" style={{ boxShadow: CARD_SHADOW, borderRadius: 20, padding: 20, gap: 16 }}>
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 50, height: 50, borderRadius: 25, border: `2px solid ${theme.primary}` }}
            >
              <Award size={24} color={theme.primary} strokeWidth={2} />
            </div>
            <div className="flex flex-col" style={{ gap: 2 }}>
              <span className="font-outfit-bold text-base" style={{ color: '#111' }}>Récompense</span>
              <span className="font-outfit-bold" style={{ fontSize: 20, color: theme.primary }}>
                + {points} points{ongoing ? ' par membre' : ''}
              </span>
            </div>
          </div>

          {ongoing ? (
            <>
              {/* Activité en cours */}
              {errorText}
              {isStarter ? (
                <>
                  <Button title="Terminer cette activité" onPress={handleCompleteActivity} loading={loading} color={theme.primary} />
                  {/* Annuler (pas dans la maquette : volontairement discret) */}
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={loading}
                    className="font-outfit self-center"
                    style={{ fontSize: 14, color: '#969696', background: 'none', border: 'none', padding: 4 }}
                  >
                    Annuler l'activité
                  </button>
                </>
              ) : (
                <p className="font-outfit text-center m-0" style={{ fontSize: 14, color: '#969696' }}>
                  Activité en cours, lancée par {starterName ?? 'un membre de la Tribu'} : c'est lui ou elle qui la validera.
                </p>
              )}
            </>
          ) : completed ? (
            /* Activité déjà faite par la Tribu */
            <div
              className="flex flex-col items-center"
              style={{ backgroundColor: theme.transparent, borderRadius: 16, padding: '14px 16px', gap: 4 }}
            >
              <div className="flex items-center" style={{ gap: 6 }}>
                <Check size={18} color={theme.primary} strokeWidth={3} />
                <span className="font-outfit-bold text-base" style={{ color: theme.primary }}>
                  Activité faite par votre Tribu
                </span>
              </div>
              <span className="font-outfit text-center" style={{ fontSize: 14, color: '#161616' }}>
                {completedDate ? `Le ${completedDate}, ` : ''}avec {completed.participants.map(p => p.name).join(', ')}
              </span>
            </div>
          ) : hasFamily ? (
            <>
              {/* Qui participe ? */}
              <span className="font-outfit" style={{ fontSize: 14, color: '#161616' }}>Qui participe ?</span>

              {members.map(member => {
                const isChecked = participants.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleParticipant(member.id)}
                    role="checkbox"
                    aria-checked={isChecked}
                    className="flex items-center bg-white text-left"
                    style={{ boxShadow: CARD_SHADOW, borderRadius: 16, padding: '10px 20px', gap: 27, border: 'none' }}
                  >
                    <img
                      src={getAvatar(member.avatar)}
                      alt=""
                      style={{ width: 36, height: 36, borderRadius: 18, border: '3px solid #FFFFFF', objectFit: 'cover' }}
                    />
                    <span className="flex-1 font-outfit truncate" style={{ fontSize: 14, color: '#161616' }}>{member.name}</span>

                    {/* Case à cocher */}
                    <span
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 2,
                        border: `2px solid ${isChecked ? theme.primary : '#969696'}`,
                        backgroundColor: isChecked ? theme.primary : 'transparent',
                      }}
                    >
                      {isChecked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}

              {errorText}

              <Button title="Choisir cette activité" onPress={handleChooseActivity} loading={loading} color={theme.primary} />
            </>
          ) : (
            <>
              {/* Sans Tribu : on invite à en rejoindre une */}
              <p className="font-outfit text-center m-0" style={{ fontSize: 14, color: '#969696' }}>
                Rejoins ou crée une Tribu pour faire cette activité en famille
              </p>
              <Button title="Rejoindre une Tribu" onPress={() => navigate('/tribu/rechercher')} color={theme.primary} />
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        visible={showCancelConfirm}
        title="Annuler l'activité ?"
        message="Aucun point ne sera gagné. Vous pourrez la relancer plus tard."
        confirmLabel="Oui, annuler"
        cancelLabel="Non, continuer"
        loading={loading}
        onConfirm={handleCancelActivity}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}
