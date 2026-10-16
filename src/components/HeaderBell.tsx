import { useState } from 'react';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';

// Cloche des notifications avec son panneau, pour l'en-tête des écrans principaux
export default function HeaderBell() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <NotificationBell onPress={() => setOpen(true)} />
      {open && <NotificationPanel onClose={() => setOpen(false)} />}
    </>
  );
}
