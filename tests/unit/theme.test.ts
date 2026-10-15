import { describe, expect, it } from 'vitest';
import { normalizeThemeColor, THEME_COLORS, themeMap } from '../../src/context/ThemeContext';

describe('Thème', () => {
  it('garde une couleur valide', () => {
    expect(normalizeThemeColor('green')).toBe('green');
    expect(normalizeThemeColor('orange')).toBe('orange');
    expect(normalizeThemeColor('red')).toBe('red');
  });

  it('refuse une couleur inconnue ou vide', () => {
    expect(normalizeThemeColor('blue')).toBeUndefined();
    expect(normalizeThemeColor('')).toBeUndefined();
    expect(normalizeThemeColor(undefined)).toBeUndefined();
    expect(normalizeThemeColor(null)).toBeUndefined();
    expect(normalizeThemeColor(42)).toBeUndefined();
  });

  it('a les 3 couleurs de la maquette, chacune avec ses 4 teintes', () => {
    expect(THEME_COLORS).toEqual(['green', 'orange', 'red']);
    for (const color of THEME_COLORS) {
      expect(Object.keys(themeMap[color])).toEqual(['primary', 'gradient', 'transparent', 'secondary']);
    }
  });
});
