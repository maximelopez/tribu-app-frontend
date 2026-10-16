import { useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import Button from './Button';

// Rouge des actions qui suppriment ou abandonnent quelque chose (Figma : btn-danger)
const DANGER_COLOR = '#E5392A';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  // Couleur du bouton de confirmation (par défaut : rouge, action destructive)
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
  confirmColor = DANGER_COLOR,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
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
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: 28 }}
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
            <p className="font-outfit m-0" style={{ fontSize: 16, lineHeight: 'normal', color: '#777777' }}>{message}</p>
          )}
        </div>

        <div className="flex flex-col w-full" style={{ gap: 10, paddingTop: 8 }}>
          <Button
            title={confirmLabel}
            onPress={onConfirm}
            loading={loading}
            color={confirmColor}
            icon={<X size={18} color="#FFFFFF" strokeWidth={2.5} />}
            iconPosition="left"
          />
          <Button
            title={cancelLabel}
            onPress={onCancel}
            disabled={loading}
            color="#F3F3F8"
            textColor="#161616"
            icon={<ChevronLeft size={18} color="#161616" strokeWidth={2.5} />}
            iconPosition="left"
          />
        </div>
      </div>
    </div>
  );
}
