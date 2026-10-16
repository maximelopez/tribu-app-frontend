import { X } from 'lucide-react';
import type { LegalText } from '../legal';
import LegalDocument from './LegalDocument';

// Texte légal (CGU ou politique de confidentialité) ouvert par-dessus l'écran : l'écran reste tel quel
export default function LegalOverlay({ text, onClose }: { text: LegalText; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={text.title}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ backgroundColor: '#F3F3F8', paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between shrink-0" style={{ padding: '12px 16px 8px 20px', gap: 12 }}>
        <h2 className="font-outfit-bold font-normal m-0" style={{ fontSize: 20, color: '#161616' }}>{text.title}</h2>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="flex items-center justify-center bg-white shrink-0"
          style={{ width: 44, height: 44, borderRadius: 22, border: 'none', boxShadow: '0px 2px 4px rgba(13, 23, 18, 0.1)' }}
        >
          <X size={20} color="#161616" strokeWidth={2} />
        </button>
      </div>
      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        style={{ padding: '8px 20px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
      >
        <LegalDocument text={text} />
      </div>
    </div>
  );
}
