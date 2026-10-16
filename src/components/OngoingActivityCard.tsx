import { Eye, Flag } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getActivityImage } from '../assets';
import { CATEGORY_LABELS } from '../categories';
import type { FamilyActivity } from '../store/familyStore';
import Button from './Button';

interface OngoingActivityCardProps {
  activity: FamilyActivity;
  city?: string | null;
  isStarter: boolean;
  onOpen: () => void;
}

// Activité en cours de la Tribu, en haut de l'Accueil (Figma : carte-activite-en-cours)
export default function OngoingActivityCard({ activity, city, isStarter, onOpen }: OngoingActivityCardProps) {
  const { theme } = useTheme();
  const image = getActivityImage(activity.activity);
  const subtitle = [CATEGORY_LABELS[activity.activity.category], city].filter(Boolean).join(' · ');

  return (
    <div className="bg-white flex flex-col" style={{ padding: 16, gap: 16, borderRadius: 24, boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.06)' }}>
      <div className="flex items-center" style={{ gap: 14 }}>
        {image && <img src={image} alt="" className="shrink-0" style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover' }} />}
        <div className="flex-1 min-w-0 flex flex-col items-start" style={{ gap: 4 }}>
          <span
            className="flex items-center font-outfit-bold"
            style={{ gap: 6, padding: '4px 10px', borderRadius: 999, backgroundColor: theme.transparent, fontSize: 13, color: '#161616' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary }} />
            En cours
          </span>
          <span className="font-outfit-bold w-full truncate" style={{ fontSize: 18, color: '#161616' }}>{activity.activity.name}</span>
          {subtitle && <span className="font-outfit w-full truncate" style={{ fontSize: 14, color: '#5F5F5F' }}>{subtitle}</span>}
        </div>
      </div>
      {/* Celui qui l'a lancée la termine. Les autres membres peuvent la voir */}
      <Button
        title={isStarter ? "Terminer l'activité" : "Voir l'activité"}
        onPress={onOpen}
        color={theme.primary}
        icon={isStarter ? <Flag size={20} color="#FFFFFF" strokeWidth={2} /> : <Eye size={20} color="#FFFFFF" strokeWidth={2} />}
        iconPosition="left"
      />
    </div>
  );
}
