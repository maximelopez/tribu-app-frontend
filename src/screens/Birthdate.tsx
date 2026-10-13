import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { themeMap } from '../context/ThemeContext';
import { backgroundMap } from '../assets';
import Button from '../components/Button';
import OnboardingLayout from '../components/OnboardingLayout';
import { API_URL } from '../config';

// Avant le choix du thème, l'onboarding est en vert (maquette)
const BRAND = themeMap.green;

// Champ date (Figma : Date Input Field)
const DATE_INPUT_STYLE = {
  flex: 1,
  minWidth: 0,
  height: 40,
  borderRadius: 16,
  border: '1px solid #D9D9D9',
  backgroundColor: '#FFFFFF',
  padding: '0 16px',
  color: '#161616',
  outline: 'none',
};

export default function Birthdate() {
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  // Garde uniquement les chiffres
  const digits = (text: string, max: number) => text.replace(/\D/g, '').slice(0, max);

  const handleNext = async () => {
    setError('');

    if (!day || !month || !year) {
      setError('Merci de remplir tous les champs.');
      return;
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (
      isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) ||
      dayNum < 1 || dayNum > 31 ||
      monthNum < 1 || monthNum > 12 ||
      yearNum < 1900 || yearNum > new Date().getFullYear()
    ) {
      setError('Date invalide.');
      return;
    }

    const birthdate = `${String(yearNum).padStart(4, '0')}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    if (!user?.id) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}users/${user.id}/birthdate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthdate }),
      });

      if (!response.ok) {
        setError('Erreur lors de la mise à jour');
        return;
      }

      const updatedUser = await response.json();
      useUserStore.getState().setUser(prev => prev ? { ...prev, birthdate: updatedUser.birthdate } : prev);

      navigate('/bienvenue/couleur');
    } catch (err) {
      console.error('Erreur sauvegarde date de naissance :', err);
      setError('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout background={backgroundMap.green} backgroundColor={BRAND.primary}>
      {/* Date de naissance */}
      <div className="flex flex-col" style={{ marginTop: 100, gap: 8 }}>
        <label className="font-outfit text-base text-white" htmlFor="birth-day">
          Quelle est ta date de naissance ?
        </label>

        <div className="flex" style={{ gap: 8 }}>
          <input
            id="birth-day"
            value={day}
            onChange={e => {
              const text = digits(e.target.value, 2);
              setDay(text);
              if (text.length === 2) monthRef.current?.focus();
            }}
            placeholder="JJ"
            inputMode="numeric"
            enterKeyHint="next"
            className="font-outfit text-base placeholder:text-[#969696]"
            style={DATE_INPUT_STYLE}
          />
          <input
            ref={monthRef}
            value={month}
            onChange={e => {
              const text = digits(e.target.value, 2);
              setMonth(text);
              if (text.length === 2) yearRef.current?.focus();
            }}
            placeholder="MM"
            inputMode="numeric"
            enterKeyHint="next"
            className="font-outfit text-base placeholder:text-[#969696]"
            style={DATE_INPUT_STYLE}
          />
          <input
            ref={yearRef}
            value={year}
            onChange={e => setYear(digits(e.target.value, 4))}
            onKeyDown={e => { if (e.key === 'Enter') handleNext(); }}
            placeholder="AAAA"
            inputMode="numeric"
            enterKeyHint="done"
            className="font-outfit text-base placeholder:text-[#969696]"
            style={DATE_INPUT_STYLE}
          />
        </div>

        {error ? <p className="font-outfit text-white m-0">{error}</p> : null}
      </div>

      {/* Suivant */}
      <div style={{ marginTop: 90 }}>
        <Button title="Suivant" onPress={handleNext} loading={loading} color="#FFFFFF" textColor={BRAND.primary} />
      </div>
    </OnboardingLayout>
  );
}
