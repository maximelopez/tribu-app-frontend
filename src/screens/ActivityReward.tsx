import { Navigate, useLocation, useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { mascotteActivity } from '../assets';
import type { LevelInfo } from '../store/familyStore';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';

interface ActivityRewardState {
  familyName: string;
  pointsEarned: number;   // points gagnés par la Tribu
  familyPoints: number;   // total de la Tribu après l'activité
  previousLevel: number;  // niveau avant l'activité (pour détecter un passage de niveau)
  levelInfo: LevelInfo;
}

// Écran affiché après "Terminer cette activité" (Figma : recompense (plein écran))
export default function ActivityReward() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const state = location.state as ActivityRewardState | null;
  // Ouvert sans données (ex : page rechargée) : retour à l'accueil
  if (!state) return <Navigate to="/" replace />;

  const { familyName, pointsEarned, familyPoints, previousLevel, levelInfo } = state;
  const hasLeveledUp = levelInfo.level > previousLevel;
  const progressPercent = Math.round(Math.min(1, Math.max(0, levelInfo.isMax ? 1 : levelInfo.progress)) * 100);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Pas de retour vers l'activité terminée : on passe par "Continuer" */}
      <ScreenHeader title="Récompense" showBack={false} />

      <div
        className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
        style={{ padding: '8px 16px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', gap: 14 }}
      >
        {/* Titre */}
        <div className="flex flex-col items-center" style={{ gap: 6 }}>
          <h1 className="font-outfit-bold text-center font-normal m-0" style={{ fontSize: 32, color: '#15201A' }}>
            Bravo, {familyName} !
          </h1>
          <p className="font-outfit text-base text-center m-0" style={{ color: '#677067', maxWidth: 280, paddingTop: 7 }}>
            Vous avez passé un moment ensemble, hors écran. Voici votre récompense.
          </p>
        </div>

        {/* Mascotte (TODO : remplacer par "mascotte-flottante" une fois exportée) */}
        <div
          className="flex items-center justify-center shrink-0 self-center rounded-full"
          style={{ width: 135, height: 135, backgroundColor: theme.transparent }}
        >
          <img src={mascotteActivity} alt="" style={{ width: 110, height: 110, objectFit: 'contain' }} />
        </div>

        {/* Points gagnés */}
        <div
          className="flex flex-col items-center justify-center shrink-0 bg-white"
          style={{ height: 74, gap: 4, borderRadius: 16 }}
        >
          <span className="font-outfit-bold" style={{ fontSize: 32, lineHeight: '40px', color: theme.primary }}>+{pointsEarned}</span>
          <span className="font-outfit" style={{ fontSize: 16, lineHeight: '20px', color: '#161616' }}>points gagnés</span>
        </div>

        {/* TODO (gamification) : carte du badge débloqué */}

        {/* Niveau */}
        <div
          className="flex flex-col shrink-0"
          style={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.08)', backgroundColor: theme.primary, borderRadius: 18, padding: 18, gap: 10 }}
        >
          <span className="font-outfit" style={{ fontSize: 14, color: '#FFFFFF', opacity: 0.95 }}>
            {hasLeveledUp ? 'NIVEAU SUPÉRIEUR' : `NIVEAU ${levelInfo.level}`}
          </span>
          <span className="font-outfit-bold" style={{ fontSize: 20, color: '#FFFFFF' }}>
            {hasLeveledUp
              ? `Vous êtes Niveau ${levelInfo.level} !`
              : levelInfo.isMax
                ? 'Niveau maximum atteint !'
                : `Plus que ${levelInfo.remaining} points !`}
          </span>

          {/* Barre d'XP */}
          <div className="overflow-hidden" style={{ height: 8, borderRadius: 100, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', borderRadius: 100, backgroundColor: '#FFFFFF' }} />
          </div>

          <div className="flex justify-between" style={{ opacity: 0.92 }}>
            <span className="font-outfit" style={{ fontSize: 11.5, color: '#FFFFFF' }}>{familyPoints} points</span>
            {!levelInfo.isMax && (
              <span className="font-outfit" style={{ fontSize: 11.5, color: '#FFFFFF' }}>
                Prochain niveau à {familyPoints + levelInfo.remaining}
              </span>
            )}
          </div>
        </div>

        <Button title="Continuer" onPress={() => navigate('/', { replace: true })} color={theme.primary} />
      </div>
    </div>
  );
}
