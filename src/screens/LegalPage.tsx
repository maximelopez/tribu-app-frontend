import ScreenHeader from '../components/ScreenHeader';
import LegalDocument from '../components/LegalDocument';
import { PRIVACY_POLICY, TERMS } from '../legal';

// Page « Politique de confidentialité » ou « Conditions d'utilisation » (ouverte depuis le profil)
export default function LegalPage({ type }: { type: 'privacy' | 'terms' }) {
  const text = type === 'privacy' ? PRIVACY_POLICY : TERMS;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title={type === 'privacy' ? 'Confidentialité' : 'CGU'} />

      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        tabIndex={0} // zone qui défile : atteignable au clavier (flèches pour lire)
        style={{ padding: '8px 20px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
      >
        <h1 className="font-outfit-bold font-normal m-0" style={{ fontSize: 24, color: '#161616', marginBottom: 6 }}>
          {text.title}
        </h1>
        <LegalDocument text={text} />
      </div>
    </div>
  );
}
