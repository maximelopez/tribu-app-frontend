import type { Ref } from 'react';
import { useTheme } from '../context/ThemeContext';

type KeyboardType = 'default' | 'email-address' | 'numeric';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardType;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  secureTextEntry?: boolean;
  color?: string;
  multiline?: boolean;
  numberOfLines?: number;
  onFocus?: () => void;
  // Bouton du clavier : "next" (champ suivant) ou "done" (valider)
  returnKeyType?: 'next' | 'done' | 'search' | 'send';
  onSubmitEditing?: () => void;
  autoComplete?: string;
  ref?: Ref<HTMLInputElement & HTMLTextAreaElement>;
}

const BASE_STYLE = {
  border: '1px solid #969696',
  borderRadius: 16,
  backgroundColor: '#FAFAFA',
  padding: '0 12px',
  color: '#161616',
  outline: 'none',
};

// Champ de saisie (Figma : Input/Variant6)
export default function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  color,
  multiline = false,
  numberOfLines = 4,
  onFocus,
  returnKeyType,
  onSubmitEditing,
  autoComplete,
  ref,
}: InputProps) {
  const { theme } = useTheme();
  const caret = color || theme.primary;

  if (multiline) {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChangeText(e.target.value)}
        placeholder={placeholder}
        rows={numberOfLines}
        onFocus={onFocus}
        className="w-full font-outfit text-base placeholder:text-[#969696] resize-none"
        style={{ ...BASE_STYLE, minHeight: 100, padding: 12, caretColor: caret }}
      />
    );
  }

  const isEmail = keyboardType === 'email-address';

  return (
    <input
      ref={ref}
      value={value}
      onChange={e => onChangeText(e.target.value)}
      placeholder={placeholder}
      type={secureTextEntry ? 'password' : isEmail ? 'email' : 'text'}
      inputMode={isEmail ? 'email' : keyboardType === 'numeric' ? 'numeric' : 'text'}
      autoCapitalize={isEmail || secureTextEntry ? 'none' : autoCapitalize}
      autoCorrect="off"
      spellCheck={false}
      autoComplete={autoComplete}
      enterKeyHint={returnKeyType === 'done' ? 'done' : returnKeyType}
      onFocus={onFocus}
      onKeyDown={e => {
        if (e.key === 'Enter' && onSubmitEditing) {
          e.preventDefault();
          onSubmitEditing();
        }
      }}
      className="w-full font-outfit text-base placeholder:text-[#969696]"
      style={{ ...BASE_STYLE, height: 48, caretColor: caret }}
    />
  );
}
