import { useEffect, useState } from 'react';

// Écart de hauteur à partir duquel on considère que le clavier est affiché (px)
const KEYBOARD_MIN_HEIGHT = 120;

// Champ où l'on tape du texte (ouvre le clavier sur téléphone)
const isTextField = (el: Element | null) =>
  !!el &&
  (el.tagName === 'TEXTAREA' ||
    (el.tagName === 'INPUT' && !['button', 'checkbox', 'radio', 'submit', 'range', 'file'].includes((el as HTMLInputElement).type)) ||
    (el as HTMLElement).isContentEditable);

// Sur téléphone (écran tactile) : vrai tant que le clavier est affiché.
// Il faut un champ de texte actif ET un écran visible réduit : sur iPhone, fermer le clavier ne retire
// pas le focus du champ, c'est la hauteur visible qui permet de savoir qu'il est refermé.
export default function useKeyboardOpen() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return;

    const viewport = window.visualViewport;
    // Hauteur de l'écran sans clavier (la plus grande vue)
    let fullHeight = Math.max(window.innerHeight, viewport?.height ?? 0);

    const update = () => {
      const visibleHeight = viewport?.height ?? window.innerHeight;
      fullHeight = Math.max(fullHeight, visibleHeight);
      const shrunk = viewport ? fullHeight - visibleHeight > KEYBOARD_MIN_HEIGHT : true;
      setOpen(isTextField(document.activeElement) && shrunk);
    };
    // Au focusout, le focus peut passer à un autre champ : on vérifie juste après
    const onFocusOut = () => setTimeout(update, 0);
    // Rotation de l'écran : nouvelle hauteur de référence
    const onRotate = () => {
      fullHeight = 0;
      setTimeout(update, 300);
    };

    document.addEventListener('focusin', update);
    document.addEventListener('focusout', onFocusOut);
    viewport?.addEventListener('resize', update);
    window.addEventListener('orientationchange', onRotate);
    return () => {
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', onFocusOut);
      viewport?.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', onRotate);
    };
  }, []);

  return open;
}
