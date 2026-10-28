import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Smile, 
  Pin, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle,
  UserCheck,
  Crown
} from 'lucide-react';
import { ChatMessage, User, LiveStream } from '../../types';
import { AIService } from '../../services/aiService';

interface LiveChatProps {
  stream: LiveStream;
  currentUser: User;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onPinMessage: (messageId: string) => void;
  isAutoModEnabled: boolean;
  onOpenModerationModal: () => void;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  stream,
  currentUser,
  messages,
  onSendMessage,
  onDeleteMessage,
  onPinMessage,
  isAutoModEnabled,
  onOpenModerationModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const [slowModeCountdown, setSlowModeCountdown] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Slow mode timer
  useEffect(() => {
    if (slowModeCountdown > 0) {
      const timer = setTimeout(() => setSlowModeCountdown((p) => p - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [slowModeCountdown]);

  const pinnedMessage = messages.find((m) => m.isPinned);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (slowModeCountdown > 0 && currentUser.role === 'viewer') {
      alert(`Mode lent actif. Veuillez patienter ${slowModeCountdown}s avant votre prochain message.`);
      return;
    }

    if (stream.isSubOnly && currentUser.role === 'viewer') {
      alert('Ce chat est actuellement réservé aux abonnés.');
      return;
    }

    // AI Real-Time Toxicity Check
    if (isAutoModEnabled) {
      const check = await AIService.checkMessageToxicity(inputText, currentUser.name);
      if (!check.isSafe) {
        setModerationWarning(`Message bloqué par la modération IA : ${check.flaggedReason || 'Contenu inapproprié'}`);
        setTimeout(() => setModerationWarning(null), 4000);
        return;
      }
    }

    onSendMessage(inputText);
    setInputText('');

    if (stream.isSlowMode && currentUser.role === 'viewer') {
      setSlowModeCountdown(stream.slowModeSeconds || 5);
    }
  };

  const quickEmojis = ['🔥', '👏', '❤️', '🚀', '💯', '😂', '🎉', '💡'];

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden text-zinc-100">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Chat en direct</span>
            {stream.isSlowMode && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                Lent {stream.slowModeSeconds}s
              </span>
            )}
            {stream.isSubOnly && (
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                Abonnés
              </span>
            )}
          </h3>
          <p className="text-[11px] text-zinc-400">Interactions en temps réel avec la communauté</p>
        </div>

        {/* Moderation Suite Link for Creator / Moderator */}
        {(currentUser.role === 'creator' || currentUser.role === 'moderator' || currentUser.role === 'admin') && (
          <button
            onClick={onOpenModerationModal}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold border border-zinc-700 transition cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Outils Modération</span>
          </button>
        )}
      </div>

      {/* Pinned Message */}
      {pinnedMessage && (
        <div className="bg-rose-950/40 border-b border-rose-500/30 px-3 py-2 flex items-start justify-between gap-2 text-xs">
          <div className="flex items-start gap-2 min-w-0">
            <Pin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-bold text-rose-300 mr-1.5">{pinnedMessage.username}:</span>
              <span className="text-zinc-200">{pinnedMessage.text}</span>
            </div>
          </div>
        </div>
      )}

      {/* Warning Notice */}
      {moderationWarning && (
        <div className="p-2.5 bg-red-500/20 border-b border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{moderationWarning}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[220px]">
        {messages.map((msg) => {
          const isHost = msg.role === 'creator';
          const isMod = msg.role === 'moderator' || msg.role === 'admin';

          return (
            <div
              key={msg.id}
              className={`group flex items-start gap-2.5 p-1.5 rounded-xl transition ${
                msg.isSuperChat
                  ? 'bg-amber-500/15 border border-amber-500/30'
                  : 'hover:bg-zinc-800/40'
              }`}
            >
              <img
                src={msg.avatar}
                alt={msg.username}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs font-bold ${isHost ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-zinc-200'}`}>
                    {msg.username}
                  </span>

                  {isHost && (
                    <span className="px-1 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[9px] font-bold uppercase flex items-center gap-0.5">
                      <Crown className="w-2.5 h-2.5" /> Hôte
                    </span>
                  )}
                  {isMod && !isHost && (
                    <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-bold uppercase">
                      Mod
                    </span>
                  )}
                  {msg.isSuperChat && (
                    <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 rounded text-[10px] font-extrabold">
                      ⭐ Don {msg.tipAmount} €
                    </span>
                  )}

                  <span className="text-[10px] text-zinc-500 font-mono ml-auto">
                    {msg.timestamp}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 mt-0.5 break-words leading-relaxed">
                  {msg.text}
                </p>
              </div>

              {/* Message actions for Host/Mod */}
              {(currentUser.role === 'creator' || currentUser.role === 'moderator' || currentUser.role === 'admin') && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition">
                  <button
                    onClick={() => onPinMessage(msg.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 rounded transition"
                    title="Épingler"
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 rounded transition"
                    title="Supprimer ce message"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis Bar */}
      {showEmojis && (
        <div className="px-3 py-1.5 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInputText((prev) => prev + emoji);
              }}
              className="text-base hover:scale-125 transition p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 bg-zinc-900/90">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
            title="Émojis"
          >
            <Smile className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              slowModeCountdown > 0
                ? `Mode lent (${slowModeCountdown}s)...`
                : 'Envoyer un message au direct...'
            }
            disabled={slowModeCountdown > 0 && currentUser.role === 'viewer'}
            className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 text-white rounded-xl transition shadow-md shadow-rose-950/40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
