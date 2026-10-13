import { useEffect } from 'react';
import Button from './Button';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Popup de confirmation (remplace l'alerte du navigateur — à adapter quand la maquette sera prête)
export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Retour',
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
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: 24 }}
      onClick={() => !loading && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white w-full flex flex-col"
        style={{ maxWidth: 360, borderRadius: 20, padding: 20, gap: 12, boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-outfit-bold font-normal text-center m-0" style={{ fontSize: 20, color: '#15201A' }}>{title}</h2>
        {message && (
          <p className="font-outfit text-center m-0" style={{ fontSize: 14, color: '#969696' }}>{message}</p>
        )}
        <div className="flex flex-col" style={{ gap: 4, marginTop: 4 }}>
          <Button title={confirmLabel} onPress={onConfirm} loading={loading} />
          <button
            onClick={onCancel}
            disabled={loading}
            className="font-outfit self-center"
            style={{ fontSize: 14, color: '#969696', background: 'none', border: 'none', padding: 8 }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
