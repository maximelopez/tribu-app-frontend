import { useState, useMemo, type ReactNode } from 'react';
import { useUserStore } from '../store/userStore';
import { ThemeContext, themeMap, normalizeThemeColor } from '../context/ThemeContext';
import type { ThemeColor } from '../context/ThemeContext';

// Fournit le thème (couleur choisie) à toute l'app
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
