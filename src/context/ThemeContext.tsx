import { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import { useUserStore } from '../store/userStore';

// Noms alignés sur les modes Figma (collection "Color modes" : Green / Orange / Red)
export type ThemeColor = 'green' | 'orange' | 'red';

export type Theme = {
  primary: string;     // Figma : Color
  gradient: string;    // Figma : Color-Gradient (2e couleur des dégradés)
  transparent: string; // Figma : Transparent (primary à 10 %)
  secondary: string;   // primary à 20 %
};

export const themeMap: Record<ThemeColor, Theme> = {
  green: { primary: '#00a16d', gradient: '#00ba7e', transparent: '#00a16d1a', secondary: '#00a16d33' },
  orange: { primary: '#ff9d00', gradient: '#ffb238', transparent: '#ff9d001a', secondary: '#ff9d0033' },
  red: { primary: '#ea4a1f', gradient: '#ff724d', transparent: '#ea4a1f1a', secondary: '#ea4a1f33' },
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

const ThemeContext = createContext<ThemeContextProps>({
  themeColor: 'green',
  theme: themeMap.green,
  setThemeColor: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const user = useUserStore(state => state.user);

  const userColor = normalizeThemeColor(user?.theme);
  const [themeColor, setThemeColor] = useState<ThemeColor>(userColor ?? 'green');

  // Le thème de l'utilisateur change (connexion, autre appareil) : on l'applique
  const [lastUserColor, setLastUserColor] = useState(userColor);
  if (userColor !== lastUserColor) {
    setLastUserColor(userColor);
    if (userColor) setThemeColor(userColor);
  }

  const theme = useMemo(() => themeMap[themeColor], [themeColor]);

  return (
    <ThemeContext.Provider value={{ themeColor, theme, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
