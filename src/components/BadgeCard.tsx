import type { Badge, BadgeTier } from '../hooks/useFamilyBadges';
import { getActivityIllustration, getBadgeImage } from '../assets';

// Ombre de chaque niveau : cartes et détail d'un badge obtenu
export const TIER_COLORS: Record<BadgeTier, { shadow: string }> = {
  bronze: { shadow: 'rgba(208, 136, 80, 0.15)' },
  argent: { shadow: 'rgba(135, 146, 160, 0.15)' },
  or: { shadow: 'rgba(242, 194, 48, 0.18)' },
  platine: { shadow: 'rgba(127, 166, 196, 0.18)' },
};

export const getBadgeColors = (badge: Badge) => TIER_COLORS[badge.tier] ?? TIER_COLORS.bronze;

const LOCKED_SHADOW = 'rgba(150, 150, 150, 0.1)';

// Image du badge (assets/badges/<id>.svg). Pas encore obtenu : en gris.
// Si l'image manque, l'illustration de sa catégorie sert de secours.
export function BadgeIllustration({ badge, size }: { badge: Badge; size: number }) {
  const image = getBadgeImage(badge.id);
  const src = image ?? getActivityIllustration(badge.category);

  return (
    <img
      src={src ?? undefined}
      alt=""
      className="shrink-0 block"
      style={{
        width: size,
        height: size,
        borderRadius: image ? 0 : size * 0.22,
        objectFit: 'contain',
        filter: badge.unlocked ? 'none' : 'grayscale(1)',
        opacity: badge.unlocked ? 1 : 0.45,
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
  const colors = getBadgeColors(badge);

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress}
      className="w-full shrink-0 bg-white flex items-center text-left active:opacity-85"
      style={{
        minHeight: 82,
        padding: '14px 20px 14px 14px',
        gap: 14,
        borderRadius: 16,
        border: 'none',
        filter: `drop-shadow(0px 4px 6px ${badge.unlocked ? colors.shadow : LOCKED_SHADOW})`,
        cursor: onPress ? 'pointer' : 'default',
      }}
    >
      <BadgeIllustration badge={badge} size={56} />

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
