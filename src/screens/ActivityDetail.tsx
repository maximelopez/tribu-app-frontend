import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import type { ReactNode } from 'react';
import { Award, Check, ChevronLeft, CircleCheck, Image as ImageIcon, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import type { Activity, FamilyActivity } from '../store/familyStore';
import { getActivityImage, getAvatar } from '../assets';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { CATEGORY_LABELS } from '../components/ActivityTile';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../api';

// Couleurs Figma
const TEXT_DARK = '#161616';
const TEXT_GREY = '#6B6B6B';
const CHECKBOX_BORDER = '#8C9590';
// Activité réalisée : vert « réussite », quelle que soit la couleur du thème
const SUCCESS = '#00A16D';
const SUCCESS_LIGHT = 'rgba(0, 161, 110, 0.1)';

// Étiquette arrondie (catégorie, gratuite, déjà réalisée)
const Tag = ({ children, color, background }: { children: ReactNode; color: string; background: string }) => (
  <span className="font-outfit flex items-center rounded-full" style={{ fontSize: 14, padding: '4px 12px', gap: 6, color, backgroundColor: background }}>
    {children}
  </span>
);

// Case à cocher (Figma : checkbox)
const Checkbox = ({ checked, color }: { checked: boolean; color: string }) => (
  <span
    className="flex items-center justify-center shrink-0"
    style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${checked ? color : CHECKBOX_BORDER}`, backgroundColor: checked ? color : '#FFFFFF' }}
  >
    {checked && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
  </span>
);

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
  // Popup de confirmation avant d'abandonner
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!activity) {
    return (
      <div className="flex-1 flex flex-col">
        <ScreenHeader title="Détail de l'activité" />
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
    ? new Date(completed.completedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
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
          newBadges: data.newBadges ?? [], // badges débloqués par cette activité
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

  // Retour : page précédente si elle existe, sinon l'accueil
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/', { replace: true });
  };

  const image = getActivityImage(activity);

  // Ligne d'un membre : avatar, prénom, case à cocher
  const participantRow = (member: { id: string; name: string; avatar?: number | null }, checked: boolean, color: string, onPress?: () => void) => {
    const content = (
      <>
        <img
          src={getAvatar(member.avatar)}
          alt=""
          className="shrink-0"
          style={{ width: 36, height: 36, borderRadius: 18, border: '3px solid #FFFFFF', objectFit: 'cover' }}
        />
        <span className="flex-1 min-w-0 font-outfit text-base truncate" style={{ color: TEXT_DARK }}>{member.name}</span>
        <Checkbox checked={checked} color={color} />
      </>
    );
    const style = { height: 56, borderRadius: 16, padding: '10px 16px', gap: 12, border: 'none' };
    return onPress ? (
      <button key={member.id} onClick={onPress} role="checkbox" aria-checked={checked} className="flex items-center bg-white text-left w-full" style={style}>
        {content}
      </button>
    ) : (
      <div key={member.id} className="flex items-center bg-white" style={style}>{content}</div>
    );
  };

  // Barre du bas avec les actions (Figma : barre-action)
  const actionBar = (children: ReactNode) => (
    <div
      className="bg-white flex flex-col shrink-0"
      style={{
        padding: '16px 16px 28px',
        paddingBottom: 'calc(16px + max(12px, env(safe-area-inset-bottom)))',
        gap: 10,
        borderRadius: '24px 24px 0 0',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      {errorText}
      {children}
    </div>
  );

  const infoText = (text: string) => (
    <p className="font-outfit text-center m-0" style={{ fontSize: 14, color: '#969696' }}>{text}</p>
  );

  // Boutons selon l'état de l'activité
  let actions: ReactNode = null;
  if (ongoing) {
    actions = isStarter ? (
      <>
        <Button title="Terminer cette activité" onPress={handleCompleteActivity} loading={loading} color={theme.primary} />
        {/* Abandonner : aucun point, avec confirmation (Figma : confirmation-pour-cloturer) */}
        <Button
          title="Abandonner"
          onPress={() => setShowCancelConfirm(true)}
          disabled={loading}
          color="#F3F3F8"
          textColor="#161616"
          borderColor="#CBD5E0"
        />
      </>
    ) : (
      infoText(`Activité en cours, lancée par ${starterName ?? 'un membre de la Tribu'} : c'est lui ou elle qui la validera.`)
    );
  } else if (completed) {
    actions = null;
  } else if (activity.isActive === false) {
    // Retirée du catalogue : on peut la consulter (historique), plus la choisir
    actions = infoText("Cette activité n'est plus proposée.");
  } else if (hasFamily) {
    actions = <Button title="Choisir cette activité" onPress={handleChooseActivity} loading={loading} color={theme.primary} />;
  } else {
    // Sans Tribu : on invite à en rejoindre une
    actions = (
      <>
        {infoText('Rejoins ou crée une Tribu pour faire cette activité en famille')}
        <Button title="Rejoindre une Tribu" onPress={() => navigate('/tribu/rechercher')} color={theme.primary} />
      </>
    );
  }

  // Participants affichés : ceux de l'activité en cours ou réalisée, sinon les membres à cocher
  const fixedParticipants = ongoing?.participants ?? completed?.participants;
  const participantsColor = completed ? SUCCESS : theme.primary;
  const pointsEarned = completed?.pointsPerMember ?? points;
  const participantsCount = completed?.participants.length ?? 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col relative">
      {/* Bouton retour, toujours visible par-dessus la photo */}
      <button
        onClick={goBack}
        aria-label="Retour"
        className="absolute z-10 flex items-center justify-center bg-white active:opacity-80"
        style={{ left: 16, top: 'calc(12px + env(safe-area-inset-top))', width: 44, height: 44, borderRadius: 22, border: 'none', boxShadow: '0px 2px 4px rgba(13, 23, 18, 0.1)' }}
      >
        <ChevronLeft size={24} color={TEXT_DARK} strokeWidth={2} />
      </button>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Photo en grand (sinon l'illustration de la catégorie) */}
        <div className="relative w-full overflow-hidden" style={{ height: 340, backgroundColor: theme.transparent }}>
          {image ? (
            <img src={image} alt="" className="w-full h-full block" style={{ objectFit: activity.imageUrl ? 'cover' : 'contain', padding: activity.imageUrl ? 0 : '60px 40px' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={48} color={theme.primary} strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Contenu, posé sur la photo (Figma : contenu) */}
        <div
          className="relative flex flex-col"
          style={{ marginTop: -40, padding: '24px 16px 24px', gap: 20, borderRadius: '28px 28px 0 0', backgroundColor: '#F3F3F8' }}
        >
          {/* Étiquettes */}
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            <Tag color={theme.primary} background={theme.transparent}>{CATEGORY_LABELS[activity.category] ?? 'Maison'}</Tag>
            {completed ? (
              <Tag color={SUCCESS} background={SUCCESS_LIGHT}>
                <CircleCheck size={16} color={SUCCESS} strokeWidth={2} />
                Déjà réalisée
              </Tag>
            ) : (
              <Tag color={theme.primary} background={theme.transparent}>
                {activity.isPartner ? activity.offer || 'Partenariat' : 'Gratuite'}
              </Tag>
            )}
          </div>

          {/* Titre et description */}
          <div className="flex flex-col" style={{ gap: 8 }}>
            <h1 className="font-outfit-bold font-normal m-0" style={{ fontSize: 32, lineHeight: 'normal', color: TEXT_DARK }}>{activity.name}</h1>
            <p className="font-outfit text-base m-0" style={{ lineHeight: 'normal', color: TEXT_GREY }}>{activity.description}</p>
          </div>

          {/* Activité déjà réalisée par la Tribu (Figma : bandeau-realisee) */}
          {completed && (
            <div
              className="flex items-center"
              style={{ padding: 16, gap: 12, borderRadius: 20, border: `1.5px solid ${SUCCESS}`, backgroundColor: SUCCESS_LIGHT }}
            >
              <span className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: SUCCESS }}>
                <CircleCheck size={20} color="#FFFFFF" strokeWidth={2} />
              </span>
              <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
                <span className="font-outfit-bold text-base" style={{ color: TEXT_DARK }}>
                  {completedDate ? `Activité réalisée le ${completedDate}` : 'Activité réalisée'}
                </span>
                <span className="font-outfit" style={{ fontSize: 14, color: TEXT_GREY }}>
                  Bravo ! Votre Tribu l’a déjà vécue ensemble.
                </span>
              </div>
            </div>
          )}

          {/* Infos pratiques : le lieu (seulement si l'activité a une ville) */}
          {activity.city && (
            <div className="bg-white flex flex-col" style={{ padding: 16, gap: 14, borderRadius: 20 }}>
              <div className="flex items-center" style={{ gap: 12 }}>
                <span className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.transparent }}>
                  <MapPin size={20} color={theme.primary} strokeWidth={2} />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-outfit" style={{ fontSize: 14, color: TEXT_GREY }}>Lieu</span>
                  <span className="font-outfit-bold text-base" style={{ color: TEXT_DARK }}>{activity.city}</span>
                </div>
              </div>
            </div>
          )}

          {/* Récompense (Figma : recompense) */}
          {(() => {
            const color = completed ? SUCCESS : theme.primary;
            const light = completed ? SUCCESS_LIGHT : theme.transparent;
            return (
              <div className="bg-white flex flex-col" style={{ padding: 16, gap: 14, borderRadius: 20, border: `1.5px solid ${color}` }}>
                <div className="flex items-center" style={{ gap: 12 }}>
                  <span className="flex items-center justify-center shrink-0" style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: color }}>
                    <Award size={20} color="#FFFFFF" strokeWidth={2} />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-outfit-bold text-base" style={{ color: TEXT_DARK }}>
                      {completed ? 'Récompense obtenue' : 'Récompense Tribu'}
                    </span>
                    {completed && (
                      <span className="font-outfit" style={{ fontSize: 14, color }}>Ajoutée au niveau de votre Tribu</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center text-center" style={{ padding: 16, gap: 4, borderRadius: 16, backgroundColor: light }}>
                  <span className="font-outfit-bold" style={{ fontSize: 20, color }}>
                    {completed ? `+ ${pointsEarned} points gagnés` : `+ ${points} points par membre`}
                  </span>
                  <span className="font-outfit" style={{ fontSize: 14, color: TEXT_GREY }}>
                    {completed
                      ? `par chacun des ${participantsCount} participant${participantsCount > 1 ? 's' : ''}`
                      : 'Validez l’activité ensemble pour les gagner'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Participants : à choisir, ou ceux de l'activité en cours / réalisée */}
          {(fixedParticipants || (hasFamily && activity.isActive !== false)) && (
            <div className="flex flex-col" style={{ gap: 8 }}>
              <span className="font-outfit-bold text-base" style={{ color: TEXT_DARK }}>
                {completed ? 'Qui a participé ?' : 'Qui participe ?'}
              </span>
              {fixedParticipants
                ? fixedParticipants.map(p => participantRow(p, true, participantsColor))
                : members.map(member => participantRow(member, participants.includes(member.id), theme.primary, () => toggleParticipant(member.id)))}
            </div>
          )}
        </div>
      </div>

      {actions && actionBar(actions)}

      <ConfirmModal
        visible={showCancelConfirm}
        title="Abandonner cette activité ?"
        message={`Votre Tribu ne gagnera pas les points de « ${activity.name} ». Vous pourrez toujours choisir une autre activité ensemble.`}
        confirmLabel="Oui, abandonner"
        cancelLabel="Continuer l’activité"
        loading={loading}
        onConfirm={handleCancelActivity}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
}
