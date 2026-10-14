import { Award } from 'lucide-react';
import type { Category } from '../store/familyStore';
import type { Badge, BadgeTier } from '../hooks/useFamilyBadges';
import { getActivityIllustration } from '../assets';

// Couleur de chaque badge : bordure du détail et ombre des cartes (Figma : badge-nature, variantes)
export const BADGE_COLORS: Record<Category, { color: string; shadow: string }> = {
  nature: { color: '#00A16D', shadow: 'rgba(0, 161, 109, 0.1)' },
  sport: { color: '#EA4A1F', shadow: 'rgba(234, 74, 31, 0.1)' },
  culture: { color: '#FF9D00', shadow: 'rgba(255, 157, 0, 0.1)' },
  maison: { color: '#777777', shadow: 'rgba(150, 150, 150, 0.1)' },
};

// Couleur des niveaux (provisoire, en attendant la maquette) : badges sans catégorie
export const TIER_COLORS: Record<BadgeTier, { color: string; background: string; shadow: string }> = {
  bronze: { color: '#9A5A2C', background: '#F3D3B8', shadow: 'rgba(208, 136, 80, 0.15)' },
  argent: { color: '#5E6977', background: '#E1E5EB', shadow: 'rgba(135, 146, 160, 0.15)' },
  or: { color: '#9C7200', background: '#FBE7A6', shadow: 'rgba(242, 194, 48, 0.18)' },
  platine: { color: '#3D5F7A', background: '#D6EAF6', shadow: 'rgba(127, 166, 196, 0.18)' },
};

// Couleurs d'un badge : celles de sa catégorie, sinon celles de son niveau
export const getBadgeColors = (badge: Badge) =>
  (badge.category && BADGE_COLORS[badge.category]) || TIER_COLORS[badge.tier] || BADGE_COLORS.maison;

const LOCKED_SHADOW = 'rgba(150, 150, 150, 0.1)';

// Illustration du badge : celle des activités de sa catégorie, sinon un carré à la couleur de son niveau
// (provisoire, en attendant la maquette). Pas encore obtenu : en gris
export function BadgeIllustration({ badge, size, radius }: { badge: Badge; size: number; radius: number }) {
  const illustration = getActivityIllustration(badge.category);

  if (!illustration) {
    const tier = TIER_COLORS[badge.tier] ?? TIER_COLORS.bronze;
    return (
      <span
        className="shrink-0 flex items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: tier.background,
          filter: badge.unlocked ? 'none' : 'grayscale(1)',
          opacity: badge.unlocked ? 1 : 0.5,
        }}
      >
        <Award size={Math.round(size * 0.5)} color={tier.color} strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <img
      src={illustration}
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
  const colors = getBadgeColors(badge);

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
