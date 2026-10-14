import { useEffect, useState } from 'react';

// Champ où l'on tape du texte (ouvre le clavier sur téléphone)
const isTextField = (el: Element | null) =>
  !!el &&
  (el.tagName === 'TEXTAREA' ||
    (el.tagName === 'INPUT' && !['button', 'checkbox', 'radio', 'submit', 'range', 'file'].includes((el as HTMLInputElement).type)) ||
    (el as HTMLElement).isContentEditable);

// Sur téléphone (écran tactile) : vrai tant qu'un champ de texte a le focus, donc que le clavier est ouvert
export default function useKeyboardOpen() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return;

    const update = () => setOpen(isTextField(document.activeElement));
    // Au focusout, le focus peut passer à un autre champ : on vérifie juste après
    const onFocusOut = () => setTimeout(update, 0);

    document.addEventListener('focusin', update);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return open;
}
