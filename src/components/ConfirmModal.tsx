import { useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';

// Rouge réservé aux actions définitives, comme supprimer son compte
export const DANGER_COLOR = '#E5392A';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  // Couleur du bouton de confirmation (par défaut : celle du thème, comme sur la maquette)
  confirmColor?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Popup de confirmation, à la place de l'alerte du navigateur (Figma : modal-confirmation)
export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Retour',
  confirmColor,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { theme } = useTheme();
  // Échap ferme la popup (sauf pendant la requête)
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, loading, onCancel]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(22, 22, 22, 0.35)', padding: 28 }}
      onClick={() => !loading && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white w-full flex flex-col items-center"
        style={{ maxWidth: 337, borderRadius: 24, padding: '28px 24px 24px', gap: 16, boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.18)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col w-full" style={{ gap: 8 }}>
          <h2 className="font-outfit-bold font-normal text-center m-0" style={{ fontSize: 20, lineHeight: 'normal', color: '#161616' }}>
            {title}
          </h2>
          {message && (
            <p className="font-outfit m-0" style={{ fontSize: 16, lineHeight: 'normal', color: '#6B6B6B' }}>{message}</p>
          )}
        </div>

        <div className="flex flex-col w-full" style={{ gap: 10, paddingTop: 8 }}>
          <Button
            title={confirmLabel}
            onPress={onConfirm}
            loading={loading}
            color={confirmColor ?? theme.primary}
            icon={<X size={20} color="#FFFFFF" strokeWidth={2} />}
            iconPosition="left"
            shadow={false}
          />
          <Button
            title={cancelLabel}
            onPress={onCancel}
            disabled={loading}
            color="#F3F3F8"
            textColor="#161616"
            icon={<ChevronLeft size={20} color="#161616" strokeWidth={2} />}
            iconPosition="left"
            shadow={false}
          />
        </div>
      </div>
    </div>
  );
}
