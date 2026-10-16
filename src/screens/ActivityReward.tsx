import type { CSSProperties } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ChevronLeft, CircleCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { getActivityImage, getAvatar } from '../assets';
import { CATEGORY_LABELS } from '../categories';
import type { Category, LevelInfo } from '../store/familyStore';
import type { Badge } from '../hooks/useFamilyBadges';
import BadgeCard from '../components/BadgeCard';
import Button from '../components/Button';
import Confetti from '../components/Confetti';
import useCountUp from '../hooks/useCountUp';

interface ActivityRewardState {
  familyName: string;
  pointsEarned: number;   // points gagnés par la Tribu
  familyPoints: number;   // total de la Tribu après l'activité
  previousLevel: number;  // niveau avant l'activité (pour détecter un passage de niveau)
  levelInfo: LevelInfo;
  newBadges?: Badge[];    // badges débloqués par l'activité (du plus rare au plus courant)
  // Activité terminée : photo (ou illustration) et catégorie en haut de l'écran
  activity?: { imageUrl?: string | null; category: Category };
}

const TEXT_DARK = '#161616';
const TEXT_GREY = '#6B6B6B';

// Couleurs des confettis en plus de celles du thème
const CONFETTI_EXTRA_COLORS = ['#FFC93C', '#7FD1FF', '#FF8FB1'];

// Écran affiché après "Terminer cette activité" (Figma : recompense1)
export default function ActivityReward() {
  const location = useLocation();
  const state = location.state as ActivityRewardState | null;
  // Ouvert sans données (ex : page rechargée) : retour à l'accueil
  if (!state) return <Navigate to="/" replace />;
  return <RewardContent {...state} />;
}

// Contenu animé : confettis, points qui défilent, badges qui apparaissent, barre de niveau qui se remplit
function RewardContent({ familyName, pointsEarned, familyPoints, previousLevel, levelInfo, newBadges = [], activity }: ActivityRewardState) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const avatar = useUserStore(state => state.user?.avatar);
  const displayedPoints = useCountUp(pointsEarned);

  const hasLeveledUp = levelInfo.level > previousLevel;
  const progressPercent = Math.round(Math.min(1, Math.max(0, levelInfo.isMax ? 1 : levelInfo.progress)) * 100);
  const image = activity ? getActivityImage(activity) : null;
  const goHome = () => navigate('/', { replace: true });

  const pill = (label: string, extra?: CSSProperties) => (
    <span
      className="font-outfit flex items-center"
      style={{ fontSize: 14, padding: '4px 12px', borderRadius: 999, backgroundColor: theme.transparent, color: theme.primary, ...extra }}
    >
      {label}
    </span>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col relative">
      <Confetti colors={[theme.primary, theme.gradient, ...CONFETTI_EXTRA_COLORS]} />

      {/* Retour : à l'accueil (pas vers l'activité terminée) */}
      <button
        onClick={goHome}
        aria-label="Retour à l'accueil"
        className="absolute z-10 flex items-center justify-center bg-white active:opacity-80"
        style={{ left: 16, top: 'calc(12px + env(safe-area-inset-top))', width: 44, height: 44, borderRadius: 22, border: 'none', boxShadow: '0px 2px 4px rgba(13, 23, 18, 0.1)' }}
      >
        <ChevronLeft size={24} color={TEXT_DARK} strokeWidth={2} />
      </button>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Photo de l'activité (sinon l'illustration de sa catégorie) */}
        <div className="relative w-full overflow-hidden" style={{ height: 230, backgroundColor: theme.transparent }}>
          {image && (
            <img
              src={image}
              alt=""
              className="w-full h-full block"
              style={{ objectFit: activity?.imageUrl ? 'cover' : 'contain', padding: activity?.imageUrl ? 0 : '30px 40px 60px' }}
            />
          )}
        </div>

        <div
          className="relative flex flex-col"
          style={{ marginTop: -30, padding: '24px 16px 24px', gap: 16, borderRadius: '28px 28px 0 0', backgroundColor: '#F3F3F8' }}
        >
          {/* Avatar de l'utilisateur, à cheval sur la photo */}
          <img
            src={getAvatar(avatar)}
            alt=""
            className="absolute pop-in"
            style={{ right: 20, top: -43, width: 80, height: 80, borderRadius: 40, border: '3.75px solid #FFFFFF', boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.09)', objectFit: 'cover', backgroundColor: '#FFFFFF' }}
          />

          {/* Catégorie et « Terminée » */}
          <div className="flex" style={{ gap: 8 }}>
            {activity && pill(CATEGORY_LABELS[activity.category] ?? 'Maison')}
            {pill('Terminée')}
          </div>

          {/* Titre */}
          <div className="flex flex-col" style={{ gap: 8 }}>
            <h1 className="font-outfit-bold font-normal m-0" style={{ fontSize: 32, lineHeight: 'normal', color: TEXT_DARK }}>
              Bravo, {familyName} !
            </h1>
            <p className="font-outfit text-base m-0" style={{ color: TEXT_GREY }}>
              Vous avez passé un moment ensemble, hors écran. Voici votre récompense.
            </p>
          </div>

          {/* Points gagnés */}
          <div
            className="pop-in flex flex-col items-center"
            style={{ padding: 16, gap: 4, borderRadius: 16, backgroundColor: theme.transparent, '--pop-delay': '0.1s' } as CSSProperties}
          >
            <span className="font-outfit-bold" style={{ fontSize: 32, color: theme.primary }}>+{displayedPoints} points</span>
            <span className="font-outfit" style={{ fontSize: 14, color: TEXT_GREY }}>Ajoutés au niveau de la Tribu</span>
          </div>

          {/* Badges débloqués par cette activité */}
          {newBadges.length > 0 && (
            <div className="flex flex-col" style={{ gap: 8 }}>
              <span className="font-outfit-bold text-base" style={{ color: TEXT_DARK }}>
                {newBadges.length > 1 ? 'Nouveaux badges débloqués' : 'Nouveau badge débloqué'}
              </span>
              {newBadges.map((badge, i) => (
                <div key={badge.id} className="pop-in" style={{ '--pop-delay': `${0.9 + i * 0.15}s` } as CSSProperties}>
                  <BadgeCard badge={badge} />
                </div>
              ))}
            </div>
          )}

          {/* Niveau */}
          <div className="bg-white flex flex-col items-start" style={{ padding: 18, gap: 12, borderRadius: 20 }}>
            {hasLeveledUp && pill('Niveau supérieur', { fontSize: 13, padding: '4px 10px', fontWeight: 600 })}
            <span className="font-outfit-bold" style={{ fontSize: 22, color: TEXT_DARK }}>
              {hasLeveledUp
                ? `Vous êtes Niveau ${levelInfo.level} !`
                : levelInfo.isMax
                  ? 'Niveau maximum atteint !'
                  : `Niveau ${levelInfo.level} : plus que ${levelInfo.remaining} points !`}
            </span>
            <div className="w-full overflow-hidden" style={{ height: 10, borderRadius: 999, backgroundColor: '#F3F3F8' }}>
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%`, height: '100%', borderRadius: 999, backgroundColor: theme.primary, '--progress-delay': '0.6s' } as CSSProperties}
              />
            </div>
            <div className="w-full flex justify-between font-outfit" style={{ fontSize: 14 }}>
              <span style={{ color: TEXT_DARK }}>{familyPoints} points</span>
              {!levelInfo.isMax && <span style={{ color: TEXT_GREY }}>Prochain niveau à {familyPoints + levelInfo.remaining}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Barre du bas (Figma : barre-action) */}
      <div
        className="bg-white shrink-0"
        style={{ padding: '16px 16px 28px', paddingBottom: 'calc(28px + env(safe-area-inset-bottom))', borderRadius: '24px 24px 0 0', boxShadow: '0px -4px 16px rgba(0, 0, 0, 0.06)' }}
      >
        <Button
          title="Continuer"
          onPress={goHome}
          color={theme.primary}
          icon={<CircleCheck size={20} color="#FFFFFF" strokeWidth={2} />}
          iconPosition="left"
        />
      </div>
    </div>
  );
}
