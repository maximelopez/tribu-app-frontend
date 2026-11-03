import { createContext, useContext } from 'react';

// Noms alignés sur les modes Figma (collection "Color modes" : Green / Orange / Red)
export type ThemeColor = 'green' | 'orange' | 'red';

export type Theme = {
  primary: string;     // Figma : Color (boutons, éléments actifs)
  gradient: string;    // Figma : Color-Gradient (bouton appuyé / survolé)
  text: string;        // Figma : Color-texte (texte de couleur sur fond clair)
  transparent: string; // Figma : Transparent (fonds clairs : étiquettes, cartes)
  secondary: string;   // couleur de la charte à 20 %
};

// Valeurs du Design System Figma (Couleurs > Thèmes). Les couleurs des boutons
// sont plus foncées que celles de la charte, pour un meilleur contraste avec le texte blanc
export const themeMap: Record<ThemeColor, Theme> = {
  green: { primary: '#00865b', gradient: '#00744f', text: '#007e56', transparent: '#00a16d1a', secondary: '#00a16d33' },
  orange: { primary: '#ff9d00', gradient: '#ffb238', text: '#ff9d00', transparent: '#ff9d001a', secondary: '#ff9d0033' },
  red: { primary: '#d63d14', gradient: '#bf3511', text: '#ca3a13', transparent: '#ea4a1f1a', secondary: '#ea4a1f33' },
};

export const THEME_COLORS = Object.keys(themeMap) as ThemeColor[];

const isThemeColor = (value: unknown): value is ThemeColor =>
  THEME_COLORS.includes(value as ThemeColor);

// Retourne la valeur si c'est un thème valide, sinon undefined.
export const normalizeThemeColor = (value: unknown): ThemeColor | undefined =>
  isThemeColor(value) ? value : undefined;

interface ThemeContextProps {
  themeColor: ThemeColor;
  theme: Theme;
  setThemeColor: (color: ThemeColor) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  themeColor: 'green',
  theme: themeMap.green,
  setThemeColor: () => {},
});

export const useTheme = () => useContext(ThemeContext);
