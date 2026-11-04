import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../../src/components/Button';
import ConfirmModal from '../../src/components/ConfirmModal';
import BadgeCard from '../../src/components/BadgeCard';
import type { Badge } from '../../src/hooks/useFamilyBadges';
import { ThemeProvider } from '../../src/components/ThemeProvider';
import { useTheme } from '../../src/context/ThemeContext';
import { useUserStore } from '../../src/store/userStore';
import { loginAs } from '../helpers';

// Affiche le nom du thème en cours
function CurrentTheme() {
  return <p>{useTheme().themeColor}</p>;
}

describe('ThemeProvider', () => {
  it('prend le thème de l\'utilisateur, puis revient au vert à la déconnexion', () => {
    loginAs({ theme: 'red' });
    render(<ThemeProvider><CurrentTheme /></ThemeProvider>);
    expect(screen.getByText('red')).toBeInTheDocument();

    act(() => useUserStore.getState().logout());
    expect(screen.getByText('green')).toBeInTheDocument();
  });
});

describe('Button', () => {
  it('appelle onPress au clic', async () => {
    const onPress = vi.fn();
    render(<Button title="Valider" onPress={onPress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ne fait rien quand il est désactivé', async () => {
    const onPress = vi.fn();
    render(<Button title="Valider" onPress={onPress} disabled />);
    await userEvent.click(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('affiche le chargement à la place du texte et bloque le clic', async () => {
    const onPress = vi.fn();
    render(<Button title="Valider" onPress={onPress} loading />);
    expect(screen.queryByText('Valider')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('ConfirmModal', () => {
  const setup = (visible = true) => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmModal visible={visible} title="Annuler ta demande ?" message="Ta demande sera supprimée."
        confirmLabel="Annuler la demande" onConfirm={onConfirm} onCancel={onCancel} />
    );
    return { onConfirm, onCancel };
  };

  it('ne s\'affiche pas quand elle est fermée', () => {
    setup(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('affiche le titre et le message', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'Annuler ta demande ?' })).toBeInTheDocument();
    expect(screen.getByText('Ta demande sera supprimée.')).toBeInTheDocument();
  });

  it('confirme ou revient en arrière', async () => {
    const { onConfirm, onCancel } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Annuler la demande' }));
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('se ferme avec la touche Échap', async () => {
    const { onCancel } = setup();
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('BadgeCard', () => {
  const badge = (unlocked: boolean) => ({
    id: 'premier-pas', tier: 'bronze', category: null, name: 'Premier pas', description: 'Termine ta première activité',
    details: '', goal: 10, progress: unlocked ? 10 : 3, unlocked, unlockedAt: unlocked ? '2026-10-12T10:00:00.000Z' : null,
    remainingText: null, nextBadge: null,
  }) as Badge;

  it('affiche la date d\'un badge obtenu', () => {
    render(<BadgeCard badge={badge(true)} />);
    expect(screen.getByText('Premier pas')).toBeInTheDocument();
    expect(screen.getByText('Obtenu le 12 oct.')).toBeInTheDocument();
  });

  it('affiche la progression d\'un badge pas encore obtenu', () => {
    render(<BadgeCard badge={badge(false)} />);
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
    expect(screen.queryByText(/Obtenu le/)).not.toBeInTheDocument();
  });
});
