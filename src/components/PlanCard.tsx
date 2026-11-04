import { Check, Crown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

interface PlanCardProps {
  isPremium: boolean;
  loading?: boolean;
  onSubscribe: () => void; // « Passer Premium »
  onManage: () => void;    // « Gérer mon abonnement »
}

// Avantages affichés dans la carte (le 3e seulement en plan gratuit, comme sur la maquette)
const BENEFITS = [
  'Toutes les offres partenaires débloquées',
  'Activités exclusives près de chez vous',
  'Plus de points pour faire monter la Tribu',
];

// Carte de l'abonnement dans le profil (Figma : statut-abonnement, Plan=Gratuit / Plan=Premium)
export default function PlanCard({ isPremium, loading = false, onSubscribe, onManage }: PlanCardProps) {
  const { theme } = useTheme();
  const benefits = isPremium ? BENEFITS.slice(0, 2) : BENEFITS;

  return (
    <div
      className="bg-white flex flex-col shrink-0"
      style={{
        borderRadius: 20,
        padding: '20px 18px',
        gap: 16,
        // Premium : bordure à la couleur du thème
        border: isPremium ? `1.5px solid ${theme.primary}` : 'none',
      }}
    >
      {/* En-tête : icône couronne, nom du plan et pastille */}
      <div className="flex items-center" style={{ gap: 12 }}>
        <span
          className="flex items-center justify-center shrink-0"
          style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: isPremium ? theme.primary : theme.transparent }}
        >
          <Crown size={22} color={isPremium ? '#FFFFFF' : theme.primary} strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 2 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span className="font-outfit-bold text-base" style={{ color: '#161616' }}>
              {isPremium ? 'Membre Premium' : 'Plan gratuit'}
            </span>
            <span
              className="font-outfit"
              style={{
                fontSize: 14,
                borderRadius: 999,
                padding: '2px 10px',
                backgroundColor: isPremium ? theme.primary : '#F3F3F8',
                color: isPremium ? '#FFFFFF' : '#6B6B6B',
              }}
            >
              {isPremium ? 'Actif' : 'Gratuit'}
            </span>
          </div>
          <span className="font-outfit" style={{ fontSize: 14, color: '#6B6B6B' }}>
            {isPremium ? 'Sans engagement' : 'Accès aux activités gratuites de la Tribu'}
          </span>
        </div>
      </div>

      {/* Avantages */}
      <ul className="flex flex-col m-0" style={{ gap: 8, padding: 14, borderRadius: 16, backgroundColor: theme.transparent, listStyle: 'none' }}>
        {benefits.map(benefit => (
          <li key={benefit} className="flex items-center font-outfit" style={{ gap: 8, fontSize: 14, color: '#161616' }}>
            <Check size={16} color={theme.primary} strokeWidth={2} className="shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>

      {isPremium ? (
        <button
          onClick={onManage}
          className="font-outfit-bold text-base"
          style={{ minHeight: 44, color: theme.text, background: 'none', border: 'none', padding: 0 }}
        >
          Gérer mon abonnement
        </button>
      ) : (
        <div className="flex flex-col" style={{ gap: 16 }}>
          <Button
            title="Passer Premium"
            onPress={onSubscribe}
            loading={loading}
            icon={<Crown size={20} color="#FFFFFF" strokeWidth={2} />}
            iconPosition="left"
          />
          <span className="font-outfit text-center" style={{ fontSize: 14, color: '#6B6B6B' }}>
            Sans engagement, annulable à tout moment
          </span>
        </div>
      )}
    </div>
  );
}
