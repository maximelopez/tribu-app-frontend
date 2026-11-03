import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import Spinner from './Spinner';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;              // couleur du fond (par défaut : celle du thème)
  pressedColor?: string;       // couleur quand on appuie (par défaut : Color-Gradient du thème)
  textColor?: string;
  icon?: ReactNode;
  borderColor?: string;
  type?: 'button' | 'submit';
  // Place de l'icône : avant ou après le texte
  iconPosition?: 'left' | 'right';
}

// Bouton principal (Figma Design System : button-general). Couleur unie, 48px, coins 16, légère ombre.
// Appuyé : couleur plus foncée (Color-Gradient). Désactivé : gris clair, texte blanc
// shrink-0 : garde ses 48px dans une zone qui défile (sinon flex peut l'écraser)
export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  color,
  pressedColor,
  textColor,
  icon,
  borderColor,
  type = 'button',
  iconPosition = 'right',
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = loading || disabled;
  const background = color ?? theme.primary;
  // Bouton blanc sur fond de couleur (Figma : button-on-fond-fonce) : gris très clair quand on appuie
  const pressed = pressedColor ?? (!color ? theme.gradient : color.toLowerCase() === '#ffffff' ? '#f3f3f8' : color);
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
      className="btn w-full shrink-0 flex items-center justify-center gap-2 rounded-2xl"
      style={{
        height: 48,
        border: borderColor ? `0.5px solid ${borderColor}` : 'none',
        backgroundColor: showDisabled ? '#E3E3E3' : background,
        boxShadow: showDisabled ? 'none' : '0px 4px 4px rgba(0, 0, 0, 0.08)',
        ['--btn-pressed' as string]: pressed,
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
