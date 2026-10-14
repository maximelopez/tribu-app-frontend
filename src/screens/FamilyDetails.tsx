import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import type { LevelInfo } from '../store/familyStore';
import { useTheme } from '../context/ThemeContext';
import { getAvatar } from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import BadgeCard from '../components/BadgeCard';
import useFamilyBadges from '../hooks/useFamilyBadges';
import { api } from '../api';

// Tribu vue par quelqu'un qui veut la rejoindre (GET /families/:id)
interface FamilyInfo {
  id: string;
  name: string;
  city: string;
  points: number;
  levelInfo: LevelInfo;
  membersCount: number;
  members: { id: string; name: string; avatar: number | null }[];
}

// Couleurs Figma (famille-details)
const TEXT_DARK = '#161616';
const WHITE_SOFT = 'rgba(255, 255, 255, 0.85)';
const WHITE_LINE = 'rgba(255, 255, 255, 0.25)';

// Écran "Rejoindre une Tribu" : présentation de la Tribu + envoi de la demande
export default function FamilyDetails() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const user = useUserStore(state => state.user);
  const setPendingRequest = useFamilyStore(state => state.setPendingRequest);
  const badgesData = useFamilyBadges(familyId).data;

  const [family, setFamily] = useState<FamilyInfo | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const response = await api(`families/${familyId}`);
        const data = await response.json();
        if (response.ok) setFamily(data.family);
        else setLoadError(true);
      } catch (error) {
        console.error('Erreur fetch famille :', error);
        setLoadError(true);
      }
    };
    fetchFamily();
  }, [familyId]);

  const handleJoinFamily = async () => {
    if (!user || !family || loading) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const response = await api(`families/${family.id}/join-requests`, { method: 'POST' });

      if (!response.ok) {
        // Ex : demande déjà envoyée, déjà dans une Tribu
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.message || 'Impossible de rejoindre cette Tribu.');
        return;
      }

      // L'Accueil affiche alors "Demande envoyée"
      setPendingRequest({ familyId: family.id, name: family.name, city: family.city });
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur rejoindre famille :', error);
      setErrorMessage('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Derniers badges gagnés : les 3 plus récents
  const recentBadges = (badgesData?.badges ?? [])
    .filter(b => b.unlocked)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  const level = family?.levelInfo;
  // Points nécessaires pour le niveau suivant (ex : 620 / 1000 pts)
  const nextLevelPoints = family && level ? family.points + level.remaining : 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title="Rejoindre une Tribu" />

      {!family ? (
        <div className="flex-1 flex items-center justify-center" style={{ padding: 24 }}>
          {loadError ? (
            <p className="font-outfit text-center m-0" style={{ fontSize: 14, color: '#969696' }}>
              Impossible de charger cette Tribu.
            </p>
          ) : (
            <Spinner size={36} color={theme.primary} />
          )}
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
          style={{ padding: '8px 16px 20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', gap: 20 }}
        >
          {/* Carte de la Tribu : nom, membres, ville, niveau */}
          <div className="flex flex-col" style={{ backgroundColor: theme.primary, borderRadius: 20, padding: '18px 20px', gap: 14 }}>
            <div className="flex flex-col" style={{ gap: 4 }}>
              <span className="font-outfit-bold text-white" style={{ fontSize: 32, lineHeight: 'normal' }}>{family.name}</span>
              <span className="font-outfit" style={{ fontSize: 15, color: WHITE_SOFT }}>
                {family.membersCount} membre{family.membersCount > 1 ? 's' : ''}, {family.city}
              </span>
            </div>

            <div style={{ height: 1, backgroundColor: WHITE_LINE }} />

            <div className="flex flex-col" style={{ gap: 10 }}>
              <div className="flex items-center justify-between">
                <span className="font-outfit-bold text-white" style={{ fontSize: 17 }}>Niveau {level!.level}</span>
                {!level!.isMax && (
                  <span className="font-outfit" style={{ fontSize: 13, fontWeight: 500, color: WHITE_SOFT }}>
                    {family.points} / {nextLevelPoints} pts
                  </span>
                )}
              </div>
              <div className="relative overflow-hidden" style={{ height: 10, borderRadius: 5, backgroundColor: WHITE_LINE }}>
                <div
                  className="absolute left-0 top-0 bg-white"
                  style={{ height: 10, borderRadius: 5, width: `${Math.round(level!.progress * 100)}%` }}
                />
              </div>
              <span className="font-outfit" style={{ fontSize: 13, color: WHITE_SOFT }}>
                {level!.isMax
                  ? 'Niveau maximum atteint'
                  : `Encore ${level!.remaining} pts avant le niveau ${level!.level + 1}`}
              </span>
            </div>
          </div>

          {/* Membres */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            <span className="font-outfit-bold" style={{ fontSize: 16, color: TEXT_DARK }}>Membres</span>
            <div className="flex overflow-x-auto no-scrollbar" style={{ gap: 16, margin: '0 -16px', padding: '0 16px' }}>
              {family.members.map(member => (
                <div key={member.id} className="flex flex-col items-center shrink-0" style={{ gap: 8, minWidth: 56, maxWidth: 84 }}>
                  <img
                    src={getAvatar(member.avatar)}
                    alt=""
                    className="rounded-full bg-white"
                    style={{ width: 56, height: 56, border: '2.5px solid #FFFFFF', objectFit: 'cover' }}
                  />
                  <span
                    className="font-outfit w-full text-center overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ fontSize: 14, color: TEXT_DARK }}
                  >
                    {member.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Derniers badges gagnés (seulement si la Tribu en a) */}
          {recentBadges.length > 0 && (
            <div className="flex flex-col" style={{ gap: 12 }}>
              <span className="font-outfit-bold" style={{ fontSize: 16, color: TEXT_DARK }}>Derniers badges gagnés</span>
              {recentBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          )}

          {/* Envoyer une demande */}
          <div className="flex flex-col" style={{ gap: 8 }}>
            {errorMessage ? (
              <p className="font-outfit text-center m-0" style={{ fontSize: 14, color: '#EA4A1F' }}>{errorMessage}</p>
            ) : null}
            <Button title="Envoyer une demande" onPress={handleJoinFamily} loading={loading} color={theme.primary} />
          </div>
        </div>
      )}
    </div>
  );
}
