import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { useUserStore } from '../store/userStore';

export interface Message {
  _id: string;
  familyId: string;
  sender: {
    _id: string;
    name: string;
    avatar?: number | null;
  };
  content: string;
  createdAt: string;
}

export default function useFamilyChat() {
  const user = useUserStore(state => state.user);
  const familyId = user?.familyId;

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!familyId) return;

    const handleHistory = (history: Message[]) => setMessages(history);
    const handleNewMessage = (message: Message) =>
      setMessages(prev => [...prev, message]);

    // Charger l'historique (la room de la Tribu est rejointe par useRealtime)
    const loadHistory = () => socket.emit('getHistory');
    loadHistory();

    socket.on('chatHistory', handleHistory);
    socket.on('newMessage', handleNewMessage);
    socket.on('connect', loadHistory); // après une reconnexion : messages manqués

    return () => {
      socket.off('chatHistory', handleHistory);
      socket.off('newMessage', handleNewMessage);
      socket.off('connect', loadHistory);
    };
  }, [familyId]);

  const sendMessage = (content: string) => {
    if (!content.trim() || !user || !familyId) return;

    socket.emit('sendMessage', { content: content.trim() });
  };

  return {
    messages,
    sendMessage,
  };
}
