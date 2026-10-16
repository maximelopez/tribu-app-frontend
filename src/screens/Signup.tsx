import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, X } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { themeMap } from '../context/ThemeContext';
import Input from '../components/Input';
import Button from '../components/Button';
import LegalDocument from '../components/LegalDocument';
import { PRIVACY_POLICY, TERMS } from '../legal';
import { api } from '../api';

// Avant l'onboarding, l'app est toujours en vert (couleurs de la maquette)
const BRAND = themeMap.green;

// Règle du mot de passe (identique au backend) : 5 critères, dont 10 caractères minimum
const MIN_PASSWORD_LENGTH = 10;
const PASSWORD_CHECKS = [
  (p: string) => p.length >= MIN_PASSWORD_LENGTH,
  (p: string) => /[a-z]/.test(p),
  (p: string) => /[A-Z]/.test(p),
  (p: string) => /\d/.test(p),
  (p: string) => /[^A-Za-z0-9]/.test(p),
];

type FieldRef = HTMLInputElement & HTMLTextAreaElement;

export default function Signup() {
  const navigate = useNavigate();
  const setUser = useUserStore(state => state.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // CGU et politique de confidentialité : case obligatoire (RGPD)
  const [acceptTerms, setAcceptTerms] = useState(false);
  // Texte légal ouvert par-dessus le formulaire (le formulaire reste rempli)
  const [legalText, setLegalText] = useState<typeof TERMS | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // "Suivant" sur le clavier passe au champ suivant
  const emailRef = useRef<FieldRef>(null);
  const passwordRef = useRef<FieldRef>(null);
  // Bloc mot de passe (règle + jauge) : ramené à l'écran au-dessus du clavier
  const passwordBlockRef = useRef<HTMLLabelElement>(null);

  // Jauge : un segment par critère respecté
  const passedChecks = PASSWORD_CHECKS.filter(check => check(password)).length;
  const isPasswordValid = passedChecks === PASSWORD_CHECKS.length;

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

    if (!acceptTerms) {
      setErrorMessage("Acceptez les conditions d'utilisation et la politique de confidentialité pour continuer.");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api('auth/register', {
        method: 'POST',
        body: { name: name.trim(), email: email.trim(), password, acceptTerms },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          response.status === 409 ? 'Cet email est déjà utilisé.'
            : response.status === 429 ? data.message || 'Trop de tentatives. Réessaie dans quelques minutes.'
            : data.error || 'Une erreur est survenue.'
        );
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

        {/* Acceptation des CGU et de la politique de confidentialité */}
        <div className="flex items-start" style={{ gap: 10, marginBottom: 20 }}>
          <button
            type="button"
            role="checkbox"
            aria-checked={acceptTerms}
            aria-label="J'accepte les conditions d'utilisation et la politique de confidentialité"
            onClick={() => setAcceptTerms(value => !value)}
            className="flex items-center justify-center shrink-0 p-0"
            style={{
              width: 24,
              height: 24,
              marginTop: 1,
              borderRadius: 6,
              border: `2px solid ${BRAND.primary}`,
              backgroundColor: acceptTerms ? BRAND.primary : '#FFFFFF',
            }}
          >
            {acceptTerms && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
          </button>
          <p className="font-outfit m-0" style={{ fontSize: 14, lineHeight: 1.4, color: '#161616' }}>
            J'accepte les{' '}
            <button type="button" onClick={() => setLegalText(TERMS)} className="font-outfit-bold p-0" style={{ fontSize: 14, color: BRAND.primary, background: 'none', border: 'none', textDecoration: 'underline' }}>
              conditions d'utilisation
            </button>{' '}
            et la{' '}
            <button type="button" onClick={() => setLegalText(PRIVACY_POLICY)} className="font-outfit-bold p-0" style={{ fontSize: 14, color: BRAND.primary, background: 'none', border: 'none', textDecoration: 'underline' }}>
              politique de confidentialité
            </button>
            . J'ai 15 ans ou plus, ou l'accord de mes parents.
          </p>
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

      {/* Texte légal (CGU ou politique de confidentialité) par-dessus le formulaire */}
      {legalText && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={legalText.title}
          className="absolute inset-0 z-50 flex flex-col"
          style={{ backgroundColor: '#F3F3F8', paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center justify-between shrink-0" style={{ padding: '12px 16px 8px 20px', gap: 12 }}>
            <h2 className="font-outfit-bold font-normal m-0" style={{ fontSize: 20, color: '#161616' }}>{legalText.title}</h2>
            <button
              onClick={() => setLegalText(null)}
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
            <LegalDocument text={legalText} />
          </div>
        </div>
      )}
    </div>
  );
}
