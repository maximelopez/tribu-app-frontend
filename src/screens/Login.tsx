import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { normalizeThemeColor, themeMap } from '../context/ThemeContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { API_URL } from '../config';

// Avant l'onboarding, l'app est toujours en vert (couleurs de la maquette)
const BRAND = themeMap.green;

export default function Login() {
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // "Suivant" sur le clavier passe au mot de passe
  const passwordRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(API_URL + 'auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(response.status === 401 ? 'Email ou mot de passe incorrect.' : 'Une erreur est survenue.');
        return;
      }

      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        familyId: data.user.familyId,
        avatar: data.user.avatar,
        theme: normalizeThemeColor(data.user.theme),
        points: data.user.points,
        birthdate: data.user.birthdate,
      });

      const isComplete = !!(data.user.theme && data.user.avatar);
      useUserStore.getState().setOnboardingCompleted(isComplete);
    } catch (error) {
      console.error('Erreur login :', error);
      setErrorMessage('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto no-scrollbar"
      style={{ padding: '100px 16px 24px', paddingTop: 'calc(100px + env(safe-area-inset-top))' }}
    >
      {/* Titre */}
      <div className="flex flex-col items-center" style={{ gap: 16, marginBottom: 27 }}>
        <h1 className="font-peachy text-center font-normal m-0" style={{ fontSize: 32, color: BRAND.primary }}>
          Bon retour
        </h1>
        <p className="font-outfit text-base text-center m-0" style={{ color: '#161616' }}>
          Saisissez vos informations ci-dessous
        </p>
      </div>

      <form
        onSubmit={e => e.preventDefault()}
        className="flex flex-col"
      >
        {/* Champs */}
        <div className="flex flex-col" style={{ gap: 16, marginBottom: 26 }}>
          <label className="flex flex-col" style={{ gap: 9 }}>
            <span className="font-outfit text-base" style={{ color: '#000' }}>Votre adresse mail :</span>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Ex : camille@email.fr"
              keyboardType="email-address"
              autoComplete="email"
              color={BRAND.primary}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </label>

          <label className="flex flex-col" style={{ gap: 9 }}>
            <span className="font-outfit text-base" style={{ color: '#000' }}>Mot de passe :</span>
            <Input
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              placeholder="**********"
              secureTextEntry
              autoComplete="current-password"
              color={BRAND.primary}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </label>
        </div>

        {errorMessage ? (
          <p className="font-outfit text-center m-0 mb-3" style={{ color: '#EA4A1F' }}>{errorMessage}</p>
        ) : null}

        <Button
          title="Se connecter"
          onPress={handleLogin}
          loading={loading}
          gradient={[BRAND.primary, BRAND.gradient]}
        />
      </form>

      {/* Lien vers l'inscription */}
      <div className="flex items-center justify-center" style={{ gap: 5, marginTop: 30 }}>
        <span className="font-outfit text-base" style={{ color: '#161616' }}>Pas encore de compte ?</span>
        <button
          onClick={() => navigate('/inscription', { replace: true })}
          className="font-outfit-bold text-base text-white flex items-center"
          style={{
            height: 30,
            borderRadius: 16,
            padding: '0 10px',
            border: 'none',
            background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.gradient})`,
          }}
        >
          Inscrivez-vous
        </button>
      </div>
    </div>
  );
}
