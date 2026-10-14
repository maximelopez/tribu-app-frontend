import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { useFamilyStore, toCatalogActivity } from '../store/familyStore';
import type { FamilyActivity } from '../store/familyStore';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/NotificationBell';
import NotificationPanel from '../components/NotificationPanel';
import FamilyLeaderboard from '../components/FamilyLeaderboard';
import ActivityCard from '../components/ActivityCard';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../api';
import { chevronRightGrey, chevronRightWhite, getActivityImage, mascotte1, mascotteActivity, usersGroupIcon } from '../assets';

const CARD_SHADOW = '0px 4px 6px rgba(22, 22, 22, 0.08)';

export default function Home() {
  const user = useUserStore(state => state.user);
  const family = useFamilyStore(state => state.family);
  const isLoadingFamily = useFamilyStore(state => state.isLoadingFamily);
  const currentActivity = useFamilyStore(state => state.currentActivity);
  const completedActivities = useFamilyStore(state => state.completedActivities);
  const pendingRequest = useFamilyStore(state => state.pendingRequest);
  const setPendingRequest = useFamilyStore(state => state.setPendingRequest);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Annulation de la demande en attente (avec confirmation)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const cancelRequest = async () => {
    if (!pendingRequest || cancelling) return;
    setCancelling(true);
    setCancelError('');
    try {
      const response = await api(`families/${pendingRequest.familyId}/join-requests`, { method: 'DELETE' });
      // 404 : la demande n'existe déjà plus (acceptée ou refusée entre-temps)
      if (response.ok || response.status === 404) {
        setPendingRequest(null);
        setShowCancelModal(false);
      } else {
        setCancelError("Impossible d'annuler la demande. Réessaie plus tard.");
        setShowCancelModal(false);
      }
    } catch (error) {
      console.error('Erreur annulation demande :', error);
      setCancelError('Impossible de se connecter au serveur.');
      setShowCancelModal(false);
    } finally {
      setCancelling(false);
    }
  };

  // Carte du haut quand on n'a pas de Tribu : mascotte + texte
  const introCard = (text: string) => (
    <div
      className="w-full bg-white flex flex-col items-center p-4 gap-3 mb-4"
      style={{ borderRadius: 24, boxShadow: '0px 4px 6px rgba(22, 22, 22, 0.04)' }}
    >
      <div className="w-full flex items-center justify-center" style={{ height: 160 }}>
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 135, height: 135, backgroundColor: 'rgba(32, 193, 177, 0.1)' }}
        >
          <img src={mascotte1} alt="" style={{ width: 115, height: 115, objectFit: 'contain' }} />
        </div>
      </div>
      <p className="font-outfit text-base text-center m-0" style={{ color: '#161616' }}>{text}</p>
    </div>
  );

  // Ouvre le détail d'une activité de la Tribu (en cours ou terminée)
  const openActivityDetail = (familyActivity: FamilyActivity) => {
    const activity = toCatalogActivity(familyActivity);
    navigate(`/activites/${activity._id}`, { state: { activity } });
  };

  // Nombre d'activités terminées par membre (pour le classement)
  const activityCounts: Record<string, number> = {};
  completedActivities.forEach(fa =>
    fa.participants.forEach(p => {
      activityCounts[p.id] = (activityCounts[p.id] ?? 0) + 1;
    })
  );
  const latestActivities = completedActivities.slice(0, 3);
  const isActivityStarter = currentActivity?.startedBy === user.id;
  const currentIllustration = currentActivity ? getActivityImage(currentActivity.activity) : null;

  const smallButton = (label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className="rounded-2xl flex items-center justify-center font-outfit-bold text-base text-white"
      style={{ height: 30, padding: '0 12px', backgroundColor: theme.primary, border: 'none' }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 24 }}>
      {/* Bonjour, Prénom + cloche des notifications */}
      <div className="w-full px-4 pt-4 flex items-center justify-between" style={{ gap: 12 }}>
        <h1 className="font-outfit-bold text-2xl font-normal m-0 min-w-0 truncate" style={{ color: '#161616' }}>
          Bonjour, <span style={{ color: theme.primary }}>{user.name}</span>
        </h1>
        <NotificationBell onPress={() => setShowNotifications(true)} />
      </div>
      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}

      <div className="px-4 mt-4">
        {isLoadingFamily && !family ? (
          <div className="mt-6 flex justify-center">
            <Spinner size={36} color={theme.primary} />
          </div>
        ) : family ? (
          <div className="w-full flex flex-col gap-3">
            {/* Carte tribu : nom, niveau, classement */}
            <FamilyLeaderboard
              familyName={family.name}
              members={family.members ?? []}
              currentUserId={user.id}
              levelInfo={family.levelInfo}
              activityCounts={activityCounts}
            />

            {/* Activité en cours, ou rien de prévu */}
            <div
              className="flex items-center bg-white rounded-2xl p-5"
              style={{ border: `1px solid ${theme.primary}`, boxShadow: `0px 4px 10px ${theme.transparent}`, gap: 10 }}
            >
              {/* Activité en cours : sa photo ou son illustration (Figma : activy-validate). Sinon : la mascotte */}
              {currentIllustration ? (
                <img
                  src={currentIllustration}
                  alt=""
                  className="shrink-0"
                  style={{ width: 65, height: 65, borderRadius: 16, objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 65, height: 65, backgroundColor: theme.transparent }}
                >
                  <img src={mascotteActivity} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                </div>
              )}
              <div className="flex-1 flex flex-col items-start" style={{ gap: 10 }}>
                {currentActivity ? (
                  <>
                    <div className="flex flex-col" style={{ gap: 2 }}>
                      <span className="font-outfit-bold text-base" style={{ color: '#161616' }}>
                        {currentActivity.activity.name} à valider
                      </span>
                      <span className="font-outfit text-sm" style={{ color: '#161616' }}>
                        {isActivityStarter ? 'Validez-la pour gagner vos points !' : 'Activité en cours dans votre Tribu'}
                      </span>
                    </div>
                    {smallButton(isActivityStarter ? 'Valider' : 'Voir', () => openActivityDetail(currentActivity))}
                  </>
                ) : (
                  <>
                    <span className="font-outfit-bold text-base" style={{ color: '#161616' }}>
                      Rien de prévu cette semaine
                    </span>
                    {smallButton('Trouver une activité', () => navigate('/activites'))}
                  </>
                )}
              </div>
            </div>

            {/* Dernières activités de la Tribu */}
            {latestActivities.length > 0 && (
              <div className="flex flex-col" style={{ gap: 12, marginTop: 6 }}>
                <div className="flex items-center justify-between">
                  <span className="font-outfit-bold text-base" style={{ color: '#000000' }}>Dernières activités</span>
                  {/* Historique complet si plus de 3 activités */}
                  {completedActivities.length > latestActivities.length && (
                    <button
                      onClick={() => navigate('/historique?mode=family')}
                      className="font-outfit"
                      style={{ fontSize: 14, color: theme.primary, background: 'none', border: 'none', borderBottom: `1px solid ${theme.primary}`, padding: 0 }}
                    >
                      Voir plus →
                    </button>
                  )}
                </div>
                {latestActivities.map(fa => (
                  <ActivityCard
                    key={fa.id}
                    name={fa.activity.name}
                    description={fa.activity.description}
                    isPartner={fa.activity.isPartner}
                    offer={fa.activity.offer}
                    imageUrl={fa.activity.imageUrl}
                    category={fa.activity.category}
                    onPress={() => openActivityDetail(fa)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : pendingRequest ? (
          <>
            {/* Demande en attente (Figma : homepage-demande-en-attente) */}
            {introCard('Ta demande est en cours de validation.')}

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
        ) : (
          <>
            {/* Carte illustration */}
            {introCard('Commencez par rejoindre ou créer votre Tribu pour vivre des activités en famille')}

            {/* Boutons Rejoindre / Créer */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => navigate('/tribu/rechercher')}
                className="flex items-center text-left"
                style={{
                  gap: 16,
                  borderRadius: 16,
                  height: 101,
                  padding: '0 21px',
                  border: 'none',
                  boxShadow: CARD_SHADOW,
                  // Dégradé Figma : Color -> Color-Gradient, de gauche à droite
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.gradient})`,
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <img src={usersGroupIcon} alt="" width={24} height={24} />
                </span>
                <span className="flex-1 flex flex-col gap-0.5">
                  <span className="font-outfit-bold text-base text-white">Rejoindre une Tribu</span>
                  <span className="font-outfit text-sm" style={{ color: 'rgba(255,255,255,0.88)' }}>
                    Trouve ta Tribu dans la liste de recherche
                  </span>
                </span>
                <img src={chevronRightWhite} alt="" width={24} height={24} />
              </button>

              <button
                onClick={() => navigate('/tribu/creer')}
                className="flex items-center gap-4 bg-white text-left"
                style={{ boxShadow: CARD_SHADOW, borderRadius: 20, height: 101, padding: '0 20px', border: 'none' }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#CBD5E0', fontSize: 24, color: '#000' }}
                >
                  ＋
                </span>
                <span className="flex-1 flex flex-col gap-0.5">
                  <span className="font-outfit-bold text-base" style={{ color: '#111' }}>Créer une Tribu</span>
                  <span className="font-outfit text-sm" style={{ color: '#888' }}>Lance ton groupe et invite tes proches</span>
                </span>
                <img src={chevronRightGrey} alt="" width={24} height={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
