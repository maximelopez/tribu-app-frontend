import { useNavigate } from 'react-router';
import { useTheme, THEME_COLORS, themeMap } from '../context/ThemeContext';
import type { ThemeColor } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { backgroundMap } from '../assets';
import Button from '../components/Button';
import { ChevronRight } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';

// Ronds de couleur (Figma : color-green / color-orange / color-red)
const CIRCLE_SIZE = 64;

export default function ThemeSelection() {
  const { theme, themeColor, setThemeColor } = useTheme();
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();

  // Couleur gardée dans l'app : envoyée au serveur seulement après l'accord (écran consentement)
  const changeTheme = (color: ThemeColor) => {
    setThemeColor(color);
    if (!user?.id) return;
    useUserStore.getState().setUser(prev => prev ? { ...prev, theme: color } : prev);
  };

  return (
    <OnboardingLayout background={backgroundMap[themeColor]} backgroundColor={theme.primary} showBack>
      {/* Choix de la couleur */}
      <div className="flex flex-col" style={{ marginTop: 87, gap: 26 }}>
        <span className="font-outfit text-base text-white">Choisissez la couleur de thème :</span>

        <div className="flex justify-center" style={{ gap: 31 }}>
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
                  border: '3px solid #FFFFFF',
                  // Sélection : anneau blanc semi-transparent autour (Figma : color-selected)
                  outline: isSelected ? '5px solid rgba(255, 255, 255, 0.5)' : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Suivant */}
      <div style={{ marginTop: 91 }}>
        <Button
          title="Suivant"
          onPress={() => navigate('/bienvenue/avatar')}
          color="#FFFFFF"
          textColor={theme.primary}
          icon={<ChevronRight size={20} color={theme.primary} strokeWidth={2.5} />}
        />
      </div>
    </OnboardingLayout>
  );
}
