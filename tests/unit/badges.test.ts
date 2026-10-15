import { describe, expect, it } from 'vitest';
import { formatUnlockedDate, getBadgeColors, TIER_COLORS } from '../../src/badges';
import type { Badge } from '../../src/hooks/useFamilyBadges';

const badge = (tier: string) => ({ tier }) as Badge;

describe('Badges', () => {
  it('écrit la date d\'obtention en court (« 12 oct. »)', () => {
    expect(formatUnlockedDate('2026-10-12T10:00:00.000Z')).toBe('12 oct.');
    expect(formatUnlockedDate('2026-01-03T10:00:00.000Z')).toBe('3 janv.');
  });

  it('donne l\'ombre du niveau du badge', () => {
    expect(getBadgeColors(badge('or'))).toBe(TIER_COLORS.or);
    expect(getBadgeColors(badge('platine'))).toBe(TIER_COLORS.platine);
  });

  it('prend l\'ombre bronze si le niveau est inconnu', () => {
    expect(getBadgeColors(badge('diamant'))).toBe(TIER_COLORS.bronze);
  });
});
