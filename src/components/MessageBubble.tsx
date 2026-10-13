import { useTheme } from '../context/ThemeContext';
import { getAvatar } from '../assets';

// Couleurs Figma (écran chat)
const SENDER_NAME = '#7D7D7D';
const TEXT_OTHER = '#2C2D3A';
const TIME_OTHER = '#D0D1DB';
const TIME_ME = '#F0F0F3';

const AVATAR_SIZE = 40;
const AVATAR_GAP = 11;

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isMe: boolean;
  senderName?: string;
  senderAvatar?: number | null;
  showName?: boolean;   // 1er message d'une série du même auteur
  showAvatar?: boolean; // dernier message d'une série du même auteur
}

// "10:15"
const formatTime = (date: string) => {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function MessageBubble({
  content,
  createdAt,
  isMe,
  senderName,
  senderAvatar,
  showName = true,
  showAvatar = true,
}: MessageBubbleProps) {
  const { theme } = useTheme();

  // Mes messages : bulle couleur du thème, à droite
  if (isMe) {
    return (
      <div
        className="flex flex-col items-end self-end"
        style={{
          maxWidth: '80%',
          backgroundColor: theme.primary,
          padding: '12px 16px',
          borderRadius: 16,
          borderBottomRightRadius: 0,
          gap: 8,
        }}
      >
        <span className="font-outfit text-base text-white whitespace-pre-wrap break-words">{content}</span>
        <span className="font-outfit text-xs" style={{ color: TIME_ME }}>{formatTime(createdAt)}</span>
      </div>
    );
  }

  // Messages des autres : nom au-dessus, avatar à gauche, bulle blanche
  return (
    <div className="self-start" style={{ maxWidth: '85%' }}>
      {showName && (
        <div className="font-outfit text-base" style={{ color: SENDER_NAME, marginLeft: AVATAR_SIZE + AVATAR_GAP, marginBottom: 13 }}>
          {senderName || 'Utilisateur inconnu'}
        </div>
      )}

      <div className="flex items-end" style={{ gap: AVATAR_GAP }}>
        {showAvatar ? (
          <img
            src={getAvatar(senderAvatar)}
            alt=""
            className="shrink-0"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, objectFit: 'cover' }}
          />
        ) : (
          // Garde l'alignement des bulles d'une même série
          <div className="shrink-0" style={{ width: AVATAR_SIZE }} />
        )}

        <div
          className="bg-white flex flex-col min-w-0"
          style={{ padding: '12px 16px', borderRadius: 16, borderBottomLeftRadius: 0, gap: 8 }}
        >
          <span className="font-outfit text-base whitespace-pre-wrap break-words" style={{ color: TEXT_OTHER }}>{content}</span>
          <span className="font-outfit text-xs" style={{ color: TIME_OTHER }}>{formatTime(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
