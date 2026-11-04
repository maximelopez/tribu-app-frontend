import { useState, useMemo, type ReactNode } from 'react';
import { useUserStore } from '../store/userStore';
import { ThemeContext, themeMap, normalizeThemeColor } from '../context/ThemeContext';
import type { ThemeColor } from '../context/ThemeContext';

// Fournit le thème (couleur choisie) à toute l'app
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const user = useUserStore(state => state.user);

  const userColor = normalizeThemeColor(user?.theme);
  const [themeColor, setThemeColor] = useState<ThemeColor>(userColor ?? 'green');

  // Le thème de l'utilisateur change (connexion, autre appareil) : on l'applique.
  // Déconnexion (plus de thème) : retour au vert de la marque, pour la connexion et l'inscription
  const [lastUserColor, setLastUserColor] = useState(userColor);
  if (userColor !== lastUserColor) {
    setLastUserColor(userColor);
    setThemeColor(userColor ?? 'green');
  }

  const theme = useMemo(() => themeMap[themeColor], [themeColor]);

  return (
    <ThemeContext.Provider value={{ themeColor, theme, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
