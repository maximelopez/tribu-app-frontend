import { describe, expect, it } from 'vitest';
import { sortByNewest } from '../../src/hooks/useCatalog';
import { toCatalogActivity } from '../../src/store/familyStore';
import type { Activity, FamilyActivity } from '../../src/store/familyStore';
import { CATEGORY_LABELS } from '../../src/categories';
import { getActivityIllustration, getActivityImage, getAvatar } from '../../src/assets';

const activity = (id: string, createdAt?: string) => ({ _id: id, createdAt }) as Activity;

describe('Activités', () => {
  it('trie les plus récentes en premier, sans modifier la liste de départ', () => {
    const list = [activity('a', '2026-01-01'), activity('b', '2026-03-01'), activity('c', '2026-02-01')];
    expect(sortByNewest(list).map(a => a._id)).toEqual(['b', 'c', 'a']);
    expect(list.map(a => a._id)).toEqual(['a', 'b', 'c']);
  });

  it('met les activités sans date à la fin', () => {
    const list = [activity('sans-date'), activity('b', '2026-03-01')];
    expect(sortByNewest(list).map(a => a._id)).toEqual(['b', 'sans-date']);
  });

  it('convertit une activité de la Tribu au format du catalogue (id → _id)', () => {
    const familyActivity = { activity: { id: 'act1', name: 'Pique-nique', category: 'nature' } } as unknown as FamilyActivity;
    expect(toCatalogActivity(familyActivity)).toEqual({ _id: 'act1', name: 'Pique-nique', category: 'nature' });
  });

  it('a un libellé pour chaque catégorie', () => {
    expect(CATEGORY_LABELS).toEqual({ nature: 'Nature', culture: 'Culture', sport: 'Sport', maison: 'Maison' });
  });
});

describe('Images', () => {
  it('prend la photo de l\'activité si elle en a une', () => {
    expect(getActivityImage({ imageUrl: 'https://img.test/photo.jpg', category: 'sport' })).toBe('https://img.test/photo.jpg');
  });

  it('prend l\'illustration de la catégorie sinon', () => {
    expect(getActivityImage({ imageUrl: null, category: 'sport' })).toBe(getActivityIllustration('sport'));
  });

  it('ne renvoie rien pour une catégorie inconnue', () => {
    expect(getActivityIllustration('inconnue')).toBeNull();
    expect(getActivityIllustration(null)).toBeNull();
  });

  it('prend l\'avatar 1 par défaut', () => {
    expect(getAvatar(null)).toBe(getAvatar(1));
    expect(getAvatar(99)).toBe(getAvatar(1));
    expect(getAvatar(3)).not.toBe(getAvatar(1));
  });
});
