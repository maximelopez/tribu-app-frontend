import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { themeMap } from '../context/ThemeContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { api } from '../api';

// Avant l'onboarding, l'app est toujours en vert (couleurs de la maquette)
const BRAND = themeMap.green;

// Règle du mot de passe (identique au backend) : 10 caractères minimum + 4 critères
const PASSWORD_CHECKS = [
  (p: string) => /[a-z]/.test(p),
  (p: string) => /[A-Z]/.test(p),
  (p: string) => /\d/.test(p),
  (p: string) => /[^A-Za-z0-9]/.test(p),
];
const MIN_PASSWORD_LENGTH = 10;

type FieldRef = HTMLInputElement & HTMLTextAreaElement;

export default function Signup() {
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // "Suivant" sur le clavier passe au champ suivant
  const emailRef = useRef<FieldRef>(null);
  const passwordRef = useRef<FieldRef>(null);
  // Bloc mot de passe (règle + jauge) : ramené à l'écran au-dessus du clavier
  const passwordBlockRef = useRef<HTMLLabelElement>(null);

  // Jauge : un segment par critère respecté
  const passedChecks = PASSWORD_CHECKS.filter(check => check(password)).length;
  const isPasswordValid = passedChecks === PASSWORD_CHECKS.length && password.length >= MIN_PASSWORD_LENGTH;

  const handlePasswordFocus = () => {
    // Laisse le clavier s'ouvrir, puis montre la règle et la jauge
    setTimeout(() => passwordBlockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.`);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api('auth/register', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), password },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(response.status === 409 ? 'Cet email est déjà utilisé.' : data.error || 'Une erreur est survenue.');
        return;
      }

      useUserStore.getState().setToken(data.token);
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        familyId: data.user.familyId,
        avatar: data.user.avatar,
        theme: data.user.theme,
      });

      useUserStore.getState().setOnboardingCompleted(false);
    } catch (error) {
      console.error('Erreur signup :', error);
      setErrorMessage('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto no-scrollbar"
      style={{ padding: '90px 16px 24px', paddingTop: 'calc(90px + env(safe-area-inset-top))' }}
    >
      {/* Titre */}
      <div className="flex flex-col items-center" style={{ gap: 21, marginBottom: 26 }}>
        <h1 className="font-peachy text-center font-normal m-0" style={{ fontSize: 32, color: BRAND.primary }}>
          Inscription
        </h1>
        <p className="font-outfit text-base text-center m-0" style={{ color: '#161616' }}>
          Gratuite, aucune carte bancaire requise
        </p>
      </div>

      <form onSubmit={e => e.preventDefault()} className="flex flex-col">
        {/* Champs */}
        <div className="flex flex-col" style={{ gap: 16, marginBottom: 26 }}>
          <label className="flex flex-col" style={{ gap: 9 }}>
            <span className="font-outfit text-base" style={{ color: '#000' }}>Prénom :</span>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Ex : Camille"
              autoComplete="given-name"
              color={BRAND.primary}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </label>

          <label className="flex flex-col" style={{ gap: 9 }}>
            <span className="font-outfit text-base" style={{ color: '#000' }}>Votre adresse mail :</span>
            <Input
              ref={emailRef}
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

          <label ref={passwordBlockRef} className="flex flex-col" style={{ gap: 8 }}>
            <span className="font-outfit text-base" style={{ color: '#161616' }}>Renseignez votre mot de passe</span>
            <Input
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              placeholder="**********"
              secureTextEntry
              autoComplete="new-password"
              color={BRAND.primary}
              onFocus={handlePasswordFocus}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />
            <span className="font-outfit" style={{ fontSize: 14, color: '#161616' }}>
              {MIN_PASSWORD_LENGTH} caractères minimum, avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial
            </span>

            {/* Jauge de force */}
            <span className="flex" style={{ gap: 4 }}>
              {PASSWORD_CHECKS.map((_, index) => (
                <span
                  key={index}
                  style={{
                    width: 16,
                    height: 3,
                    borderRadius: 999,
                    backgroundColor: index < passedChecks ? '#35CF94' : '#E5E5E5',
                  }}
                />
              ))}
            </span>
          </label>
        </div>

        {errorMessage ? (
          <p className="font-outfit text-center m-0 mb-3" style={{ color: '#EA4A1F' }}>{errorMessage}</p>
        ) : null}

        <Button
          title="S'inscrire"
          onPress={handleSignup}
          loading={loading}
          gradient={[BRAND.primary, BRAND.gradient]}
        />
      </form>

      {/* Lien vers la connexion */}
      <div className="flex items-center justify-center" style={{ gap: 5, marginTop: 26 }}>
        <span className="font-outfit text-base" style={{ color: '#161616' }}>Déjà inscrit(e) ?</span>
        <button
          onClick={() => navigate('/connexion')}
          className="font-outfit-bold text-base text-white flex items-center"
          style={{
            height: 30,
            borderRadius: 16,
            padding: '0 10px',
            border: 'none',
            background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.gradient})`,
          }}
        >
          Connectez-vous
        </button>
      </div>
    </div>
  );
}
