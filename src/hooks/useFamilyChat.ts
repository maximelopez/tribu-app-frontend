import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';

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
  const setUnreadCount = useFamilyStore(state => state.setUnreadCount);

  useEffect(() => {
    if (!familyId) return;

    // Chat affiché : tout est lu (point rouge de l'onglet retiré)
    const markAsRead = () => {
      socket.emit('markChatRead');
      setUnreadCount(0);
    };

    const handleHistory = (history: Message[]) => {
      setMessages(history);
      markAsRead();
    };
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      markAsRead();
    };

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
  }, [familyId, setUnreadCount]);

  const sendMessage = (content: string) => {
    if (!content.trim() || !user || !familyId) return;

    socket.emit('sendMessage', { content: content.trim() });
  };

  return {
    messages,
    sendMessage,
  };
}
