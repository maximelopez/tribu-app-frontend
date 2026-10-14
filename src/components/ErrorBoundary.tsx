import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

// Filet de sécurité : si un écran plante, on affiche un message avec "Recharger" au lieu d'une page blanche.
// (Seuls les composants "classe" peuvent intercepter les erreurs d'affichage dans React.)
export default class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur d\'affichage :', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="h-full flex flex-col items-center justify-center text-center"
        style={{ padding: '0 28px', gap: 16, backgroundColor: '#F3F3F8' }}
      >
        <p className="font-outfit-bold m-0" style={{ fontSize: 20, color: '#161616' }}>Oups, un problème est survenu</p>
        <p className="font-outfit m-0" style={{ fontSize: 16, color: '#777777' }}>
          Recharge l'app pour continuer. Si le problème revient, préviens-nous.
        </p>
        <button
          onClick={() => window.location.replace('/')}
          className="font-outfit-bold text-white"
          style={{ height: 48, padding: '0 32px', borderRadius: 16, border: 'none', backgroundColor: '#00A16D', fontSize: 16 }}
        >
          Recharger
        </button>
      </div>
    );
  }
}
