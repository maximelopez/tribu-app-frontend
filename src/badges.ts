import type { Badge, BadgeTier } from './hooks/useFamilyBadges';

// Ombre de chaque niveau : cartes et détail d'un badge obtenu
export const TIER_COLORS: Record<BadgeTier, { shadow: string }> = {
  bronze: { shadow: 'rgba(208, 136, 80, 0.15)' },
  argent: { shadow: 'rgba(135, 146, 160, 0.15)' },
  or: { shadow: 'rgba(242, 194, 48, 0.18)' },
  platine: { shadow: 'rgba(127, 166, 196, 0.18)' },
};

export const getBadgeColors = (badge: Badge) => TIER_COLORS[badge.tier] ?? TIER_COLORS.bronze;

// « Obtenu le 12 oct. »
export const formatUnlockedDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
