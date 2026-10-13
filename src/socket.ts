import { io } from 'socket.io-client';
import { SERVER_URL } from './config';
import { useUserStore } from './store/userStore';

// Le socket ne se connecte pas tout seul : il est ouvert quand l'utilisateur
// est connecté (voir useRealtime) et envoie son token à chaque connexion.
export const socket = io(SERVER_URL, {
  transports: ['websocket'],
  autoConnect: false,
  auth: (callback) => callback({ token: useUserStore.getState().token }),
});
