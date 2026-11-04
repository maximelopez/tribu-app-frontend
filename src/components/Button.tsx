import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import Spinner from './Spinner';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;              // couleur du fond (par défaut : celle du thème)
  textColor?: string;
  icon?: ReactNode;
  borderColor?: string;
  type?: 'button' | 'submit';
  // Place de l'icône : avant ou après le texte
  iconPosition?: 'left' | 'right';
  // Légère ombre sous le bouton (pas dans les popups, comme sur la maquette)
  shadow?: boolean;
}

// Bouton principal (Figma Design System : button-general). Couleur unie, 48px, coins 16, légère ombre.
// Appuyé : léger assombrissement (index.css). Désactivé : gris clair, texte blanc
// shrink-0 : garde ses 48px dans une zone qui défile (sinon flex peut l'écraser)
export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  color,
  textColor,
  icon,
  borderColor,
  type = 'button',
  iconPosition = 'right',
  shadow = true,
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = loading || disabled;
  const background = color ?? theme.primary;
  const showDisabled = disabled && !loading;

  const handleClick = () => {
    if (isDisabled) return;
    // Petit retour haptique quand le téléphone le permet (Android)
    navigator.vibrate?.(10);
    onPress();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className="w-full shrink-0 flex items-center justify-center gap-2 rounded-2xl"
      style={{
        height: 48,
        border: borderColor ? `0.5px solid ${borderColor}` : 'none',
        backgroundColor: showDisabled ? '#E3E3E3' : background,
        boxShadow: showDisabled || !shadow ? 'none' : '0px 4px 4px rgba(0, 0, 0, 0.08)',
      }}
    >
      {loading ? (
        <Spinner color={textColor || '#FFFFFF'} />
      ) : (
        <>
          {iconPosition === 'left' && icon}
          <span className="font-outfit-bold text-base" style={{ color: showDisabled ? '#FFFFFF' : textColor || '#FFFFFF' }}>
            {title}
          </span>
          {iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
}
