import type { Category } from '../store/familyStore';
import type { Badge } from '../hooks/useFamilyBadges';
import { getActivityIllustration } from '../assets';

// Couleur de chaque badge : bordure du détail et ombre des cartes (Figma : badge-nature, variantes)
export const BADGE_COLORS: Record<Category, { color: string; shadow: string }> = {
  nature: { color: '#00A16D', shadow: 'rgba(0, 161, 109, 0.1)' },
  sport: { color: '#EA4A1F', shadow: 'rgba(234, 74, 31, 0.1)' },
  culture: { color: '#FF9D00', shadow: 'rgba(255, 157, 0, 0.1)' },
  maison: { color: '#777777', shadow: 'rgba(150, 150, 150, 0.1)' },
};

const LOCKED_SHADOW = 'rgba(150, 150, 150, 0.1)';

// Illustration du badge (la même que les activités de sa catégorie). Pas encore obtenu : en gris
export function BadgeIllustration({ badge, size, radius }: { badge: Badge; size: number; radius: number }) {
  return (
    <img
      src={getActivityIllustration(badge.category) ?? undefined}
      alt=""
      className="shrink-0 block"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        objectFit: 'cover',
        filter: badge.unlocked ? 'none' : 'grayscale(1)',
        opacity: badge.unlocked ? 1 : 0.5,
      }}
    />
  );
}

interface BadgeCardProps {
  badge: Badge;
  onPress?: () => void;
}

// Carte d'un badge. Pas encore obtenu : grisée avec la progression (ex : 1 / 3)
export default function BadgeCard({ badge, onPress }: BadgeCardProps) {
  const colors = BADGE_COLORS[badge.category] ?? BADGE_COLORS.maison;

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress}
      className="w-full shrink-0 bg-white flex items-center text-left active:opacity-85"
      style={{
        minHeight: 82,
        padding: 20,
        gap: 16,
        borderRadius: 16,
        border: 'none',
        filter: `drop-shadow(0px 4px 6px ${badge.unlocked ? colors.shadow : LOCKED_SHADOW})`,
        cursor: onPress ? 'pointer' : 'default',
      }}
    >
      <BadgeIllustration badge={badge} size={48} radius={11} />

      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 2 }}>
        <span className="font-outfit-bold text-base" style={{ lineHeight: 'normal', color: badge.unlocked ? '#111111' : '#969696' }}>
          {badge.name}
        </span>
        <span className="font-outfit" style={{ fontSize: 14, lineHeight: 'normal', color: '#777777' }}>{badge.description}</span>
      </div>

      {!badge.unlocked && (
        <span className="font-outfit shrink-0" style={{ fontSize: 14, color: '#969696' }}>
          {badge.progress} / {badge.goal}
        </span>
      )}
    </button>
  );
}
