import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Pencil, X } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useFamilyStore, toCatalogActivity } from '../store/familyStore';
import type { FamilyActivity } from '../store/familyStore';
import { useTheme } from '../context/ThemeContext';
import { AVATARS, getAvatar } from '../assets';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Button from '../components/Button';
import ActivityCard from '../components/ActivityCard';
import BadgeCard from '../components/BadgeCard';
import useFamilyBadges from '../hooks/useFamilyBadges';
import Spinner from '../components/Spinner';
import { api } from '../api';

// Âge en années à partir de la date de naissance (ISO)
const getAge = (birthdate?: string | null) => {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthday) age--;
  return age;
};

export default function Profile() {
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  const logout = useUserStore(state => state.logout);
  const clearFamily = useFamilyStore(state => state.clearFamily);
  const completedActivities = useFamilyStore(state => state.completedActivities);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const lastBadge = useFamilyBadges().data?.lastUnlocked ?? null;

  const [showModal, setShowModal] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const age = getAge(user.birthdate);

  // 3 dernières activités auxquelles l'utilisateur a participé
  const myActivities = completedActivities.filter(fa => fa.participants.some(p => p.id === user.id));
  const myLatestActivities = myActivities.slice(0, 3);

  const openActivityDetail = (familyActivity: FamilyActivity) => {
    const activity = toCatalogActivity(familyActivity);
    navigate(`/activites/${activity._id}`, { state: { activity } });
  };

  const logoutUser = () => {
    logout();
    clearFamily();
  };

  const openModal = () => {
    setPendingAvatar(user.avatar ?? null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const saveAvatar = async () => {
    if (!pendingAvatar || saving) return;

    // Rien n'a changé : on ferme simplement
    if (pendingAvatar === user.avatar) {
      setShowModal(false);
      return;
    }

    setSaving(true);
    try {
      const response = await api(`users/${user.id}/avatar`, {
        method: 'PATCH',
        body: { avatar: pendingAvatar },
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, avatar: pendingAvatar } : prev);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Erreur avatar:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* En-tête */}
      <div className="flex items-center justify-center shrink-0" style={{ height: 50, marginTop: 'env(safe-area-inset-top)' }}>
        <h1 className="font-outfit-bold font-normal m-0" style={{ fontSize: 20, color: '#161616' }}>Profil</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col" style={{ padding: '18px 16px 24px 17px', gap: 18 }}>
        {/* Carte profil */}
        <div
          className="flex items-center shrink-0"
          style={{ backgroundColor: theme.primary, borderRadius: 22, padding: 20, gap: 16, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          <button onClick={openModal} aria-label="Changer d'avatar" className="relative shrink-0 p-0" style={{ background: 'none', border: 'none' }}>
            <img
              src={getAvatar(user.avatar)}
              alt=""
              className="block"
              style={{ width: 72, height: 72, borderRadius: 36, border: '2px solid #FFFFFF', objectFit: 'cover' }}
            />
            {/* Pastille crayon */}
            <span
              className="absolute flex items-center justify-center bg-white"
              style={{ left: 47, top: 46, width: 28, height: 28, borderRadius: 14, border: '2px solid #FFFFFF' }}
            >
              <Pencil size={16} color="#161616" strokeWidth={1.5} />
            </span>
          </button>

          <div className="flex-1 min-w-0 flex flex-col items-start" style={{ gap: 4 }}>
            <span className="font-outfit-bold text-white truncate w-full" style={{ fontSize: 20 }}>{user.name}</span>
            {age !== null && (
              <span className="font-outfit-bold text-base" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>{age} ans</span>
            )}
            <span
              className="bg-white font-outfit truncate"
              style={{ borderRadius: 99, padding: '4px 10px 3px', maxWidth: '100%', fontSize: 14, color: theme.primary }}
            >
              {user.email}
            </span>
          </div>
        </div>

        {/* Thème */}
        <ThemeSwitcher />

        {/* Dernier badge obtenu par la Tribu */}
        {lastBadge && (
          <div className="flex flex-col" style={{ gap: 10, padding: '4px 0' }}>
            <div className="flex items-center justify-between">
              <span className="font-outfit-bold text-base" style={{ color: '#111' }}>Dernier badge obtenu</span>
              <button
                onClick={() => navigate('/recompenses/badges')}
                className="font-outfit"
                style={{ fontSize: 14, color: theme.primary, background: 'none', border: 'none', borderBottom: `1px solid ${theme.primary}`, padding: 0 }}
              >
                Voir plus →
              </button>
            </div>
            <BadgeCard badge={lastBadge} onPress={() => navigate(`/recompenses/badges/${lastBadge.id}`)} />
          </div>
        )}

        {/* Dernières activités */}
        {myLatestActivities.length > 0 && (
          <div className="flex flex-col" style={{ gap: 10, padding: '4px 0' }}>
            <div className="flex items-center justify-between">
              <span className="font-outfit-bold text-base" style={{ color: '#111' }}>Dernières activités</span>
              {/* Historique complet si plus de 3 activités */}
              {myActivities.length > myLatestActivities.length && (
                <button
                  onClick={() => navigate('/historique?mode=me')}
                  className="font-outfit"
                  style={{ fontSize: 14, color: theme.primary, background: 'none', border: 'none', borderBottom: `1px solid ${theme.primary}`, padding: 0 }}
                >
                  Voir plus →
                </button>
              )}
            </div>
            <div className="flex flex-col" style={{ gap: 12 }}>
              {myLatestActivities.map(fa => (
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
          </div>
        )}

        {/* Déconnexion (Figma : bouton plein à la couleur du thème, en bas du profil) */}
        <Button title="Se déconnecter" onPress={logoutUser} color={theme.primary} />
      </div>

      {/* Modale : choisir un avatar (Figma : profil-choix-avatar) */}
      {showModal && (
        <div
          className="absolute inset-0 z-50 flex items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0 22px' }}
          onClick={closeModal}
        >
          {/* Un clic dans la carte ne ferme pas la modale */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choisir un avatar"
            className="bg-white w-full flex flex-col"
            style={{ borderRadius: 24, padding: 20, gap: 16, boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between">
              <span className="font-outfit-bold" style={{ fontSize: 20, color: '#161616' }}>Choisir un avatar</span>
              <button
                onClick={closeModal}
                aria-label="Fermer"
                className="flex items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F3F8', border: 'none' }}
              >
                <X size={16} color="#161616" strokeWidth={2} />
              </button>
            </div>

            <p className="font-outfit m-0" style={{ fontSize: 14, color: '#161616' }}>
              Sélectionnez un avatar pour personnaliser votre profil.
            </p>

            {/* Avatars */}
            <div className="flex justify-center" style={{ gap: 12 }}>
              {AVATARS.map(avatar => {
                const isSelected = pendingAvatar === avatar;
                return (
                  <button
                    key={avatar}
                    onClick={() => setPendingAvatar(avatar)}
                    aria-label={`Avatar ${avatar}`}
                    aria-pressed={isSelected}
                    className="overflow-hidden p-0 shrink-0"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      border: '3px solid #FFFFFF',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.09)',
                      // Sélection : anneau à la couleur du thème (un anneau blanc serait invisible sur fond blanc)
                      outline: isSelected ? `3px solid ${theme.primary}` : 'none',
                      background: '#FFFFFF',
                    }}
                  >
                    <img src={getAvatar(avatar)} alt="" className="w-full h-full block" style={{ objectFit: 'cover' }} />
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex" style={{ gap: 12, marginTop: 4 }}>
              <button
                onClick={closeModal}
                className="flex-1 flex items-center justify-center font-outfit-bold text-base"
                style={{ height: 44, borderRadius: 16, backgroundColor: '#F3F3F8', color: '#161616', border: 'none' }}
              >
                Annuler
              </button>
              <button
                onClick={saveAvatar}
                disabled={!pendingAvatar || saving}
                className="flex-1 flex items-center justify-center font-outfit-bold text-base text-white"
                style={{ height: 44, borderRadius: 16, backgroundColor: theme.primary, opacity: pendingAvatar ? 1 : 0.5, border: 'none' }}
              >
                {saving ? <Spinner size={20} /> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
