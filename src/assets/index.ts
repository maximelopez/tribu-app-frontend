// Images partagées entre les écrans (équivalent des require() de mobile)
import avatar1 from './images/avatar1.png';
import avatar2 from './images/avatar2.png';
import avatar3 from './images/avatar3.png';
import avatar4 from './images/avatar4.png';
import bgGreen from './images/bg-green.png';
import bgOrange from './images/bg-orange.png';
import bgRed from './images/bg-red.png';
import type { ThemeColor } from '../context/ThemeContext';

export { default as logoTribu } from './images/logo-tribu.png';
export { default as mascotte1 } from './images/mascotte-1.png';
export { default as mascotteActivity } from './images/mascotte-activity.png';
export { default as mascotteNoResults } from './images/mascotte-no-results.png';
export { default as mascotteTribu } from './images/mascotte-tribu.png';
export { default as usersGroupIcon } from './icons/users-group.svg';
export { default as chevronRightWhite } from './icons/chevron-right-white.svg';
export { default as chevronRightGrey } from './icons/chevron-right-grey.svg';
export { default as sendIcon } from './icons/sendBtn.svg';

export const AVATARS = [1, 2, 3, 4];

const avatarMap: Record<number, string> = { 1: avatar1, 2: avatar2, 3: avatar3, 4: avatar4 };

// Avatar par numéro (1 par défaut)
export const getAvatar = (avatar?: number | null) => avatarMap[avatar ?? 1] ?? avatar1;

// Fond à motifs de l'onboarding selon la couleur du thème
export const backgroundMap: Record<ThemeColor, string> = {
  green: bgGreen,
  orange: bgOrange,
  red: bgRed,
};
