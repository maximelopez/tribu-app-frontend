import type { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import Spinner from './Spinner';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;              // couleur unie (sinon : dégradé)
  gradient?: [string, string]; // dégradé personnalisé (par défaut : celui du thème)
  textColor?: string;
  icon?: ReactNode;
  borderColor?: string;
  type?: 'button' | 'submit';
}

// Bouton principal (Figma : "Sign in" — dégradé Color → Color-Gradient, 48px, coins 16)
// shrink-0 : garde ses 48px dans une zone qui défile (sinon flex peut l'écraser)
export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  color,
  gradient,
  textColor,
  icon,
  borderColor,
  type = 'button',
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = loading || disabled;
  const [from, to] = gradient ?? [theme.primary, theme.gradient];

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
      className="w-full shrink-0 flex items-center justify-center gap-4 rounded-2xl transition-opacity active:opacity-80"
      style={{
        height: 48,
        border: borderColor ? `0.5px solid ${borderColor}` : 'none',
        background: color ?? `linear-gradient(90deg, ${from}, ${to})`,
        opacity: disabled && !loading ? 0.5 : 1,
      }}
    >
      {loading ? (
        <Spinner color={textColor || '#FFFFFF'} />
      ) : (
        <>
          <span className="font-outfit-bold text-base" style={{ color: textColor || '#FFFFFF' }}>
            {title}
          </span>
          {icon}
        </>
      )}
    </button>
  );
}
