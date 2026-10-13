import { useTheme, THEME_COLORS, themeMap } from '../context/ThemeContext';
import type { ThemeColor } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { API_URL } from '../config';

const CIRCLE_SIZE = 34;

// Carte "Thème de l'appli" du Profil (Figma : profile > Theme)
export default function ThemeSwitcher() {
  const { themeColor, setThemeColor } = useTheme();
  const user = useUserStore(state => state.user);

  const changeTheme = async (color: ThemeColor) => {
    try {
      // 1 - mise à jour immédiate de l'UI
      setThemeColor(color);

      if (!user?.id) return;

      // 2 - sauvegarde dans le backend
      await fetch(`${API_URL}users/${user.id}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: color }),
      });

      // 3 - mise à jour dans le store (localStorage)
      useUserStore.getState().setUser(prev => prev ? { ...prev, theme: color } : prev);
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error);
    }
  };

  return (
    <div
      className="bg-white w-full flex flex-col"
      style={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.08)', borderRadius: 20, padding: '20px 18px', gap: 20 }}
    >
      <span className="font-outfit text-base" style={{ color: '#111' }}>Thème de l'appli :</span>

      <div className="flex justify-center items-center" style={{ gap: 20 }}>
        {THEME_COLORS.map((color) => {
          const isSelected = themeColor === color;
          return (
            <button
              key={color}
              onClick={() => changeTheme(color)}
              aria-label={`Thème ${color}`}
              aria-pressed={isSelected}
              style={{
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                backgroundColor: themeMap[color].primary,
                // Sélection : bordure gris clair (Figma)
                border: isSelected ? '3px solid #CBD5E0' : 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
