import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import useFamilyChat from '../hooks/useFamilyChat';
import { useTheme } from '../context/ThemeContext';
import MessageBubble from '../components/MessageBubble';
import Button from '../components/Button';
import { mascotteNoResults, sendIcon } from '../assets';

// Couleurs Figma (écran chat)
const CHAT_BG = '#F3F3F8';
const TEXT_GREY = '#969696';
const INPUT_TEXT = '#0D1217';

export default function Chat() {
  const { theme } = useTheme();
  const { messages, sendMessage } = useFamilyChat();
  const user = useUserStore(state => state.user);
  const family = useFamilyStore(state => state.family);

  const navigate = useNavigate();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Zone de saisie qui s'agrandit avec le texte (jusqu'à environ 4 lignes)
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }, [text]);

  // Reste collé en bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: messages.length > 0 ? 'smooth' : 'auto' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  // Pas encore de Tribu (Figma : chat-empty-state)
  if (!user?.familyId) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center" style={{ padding: '0 28px', gap: 20 }}>
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 135, height: 135, backgroundColor: 'rgba(234, 74, 31, 0.1)' }}
        >
          <img src={mascotteNoResults} alt="" style={{ width: 110, height: 110, objectFit: 'contain' }} />
        </div>
        <p className="font-outfit text-base text-center m-0" style={{ color: '#111111' }}>
          Rejoins ou crée ta Tribu pour échanger avec ta famille !
        </p>
        <div className="w-full">
          <Button title="Trouver ma Tribu" onPress={() => navigate('/tribu/rechercher')} color={theme.primary} />
        </div>
      </div>
    );
  }

  const membersCount = family?.members?.length ?? 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col" style={{ backgroundColor: CHAT_BG }}>
      {/* En-tête */}
      <div
        className="bg-white flex flex-col shrink-0"
        style={{ padding: '16px 17px 8px', paddingTop: 'calc(16px + env(safe-area-inset-top))', gap: 4 }}
      >
        <span className="font-outfit-bold text-base" style={{ color: theme.primary }}>Famille {family?.name}</span>
        <span className="font-outfit text-base" style={{ color: TEXT_GREY }}>
          {membersCount} membre{membersCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col" style={{ padding: '12px 18px 16px' }}>
        {messages.map((item, index) => {
          const isMe = item.sender?._id === user.id;
          const previous = messages[index - 1];
          const next = messages[index + 1];
          const isFirstOfGroup = previous?.sender?._id !== item.sender?._id;
          const isLastOfGroup = next?.sender?._id !== item.sender?._id;

          return (
            // Espace plus grand entre deux auteurs différents
            <div key={item._id} className="flex flex-col" style={{ marginTop: isFirstOfGroup ? 16 : 4 }}>
              <MessageBubble
                content={item.content}
                createdAt={item.createdAt}
                isMe={isMe}
                senderName={item.sender?.name}
                senderAvatar={item.sender?.avatar}
                showName={isFirstOfGroup}
                showAvatar={isLastOfGroup}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="flex items-center shrink-0" style={{ backgroundColor: CHAT_BG, padding: '7px 16px', gap: 12 }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            // Entrée = envoyer (Maj + Entrée = retour à la ligne) sur ordinateur
            if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Écris un message..."
          rows={1}
          className="font-outfit text-base placeholder:text-[#969696] resize-none"
          style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: 16,
            minHeight: 56,
            maxHeight: 120,
            lineHeight: '22px',
            color: INPUT_TEXT,
            border: 'none',
            outline: 'none',
            caretColor: theme.primary,
          }}
        />

        <button
          onClick={handleSend}
          aria-label="Envoyer"
          className="flex items-center justify-center shrink-0"
          style={{
            backgroundColor: theme.primary,
            borderRadius: 21,
            width: 42,
            height: 42,
            border: 'none',
            boxShadow: '0px 4px 6px rgba(13, 10, 44, 0.06)',
          }}
        >
          <img src={sendIcon} alt="" width={26} height={26} />
        </button>
      </div>
    </div>
  );
}
