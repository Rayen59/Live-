import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Radio, 
  Eye, 
  Mic, 
  MicOff, 
  Hand, 
  Sliders, 
  Sparkles, 
  Share2, 
  Heart, 
  Maximize, 
  Volume2, 
  VolumeX, 
  Check, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { LiveStream, User, ChatMessage, VideoFilterSettings } from '../../types';
import { LiveChat } from '../Chat/LiveChat';
import { StorageService } from '../../services/storage';

interface LiveViewerProps {
  stream: LiveStream;
  currentUser: User;
  allUsers: User[];
  onBack: () => void;
  onViewChannel: (userId: string) => void;
}

export const LiveViewer: React.FC<LiveViewerProps> = ({
  stream,
  currentUser,
  allUsers,
  onBack,
  onViewChannel,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(StorageService.getChatMessages(stream.id));
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasRequestedMic, setHasRequestedMic] = useState(false);
  const [isMicGranted, setIsMicGranted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [viewerFilters, setViewerFilters] = useState<VideoFilterSettings>({
    brightness: 100,
    contrast: 105,
    saturation: 100,
    clarity: 50,
    blur: 0,
    isMirrored: false,
    resolution: '1080p',
  });
  const [showClarityPanel, setShowClarityPanel] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [heartsCount, setHeartsCount] = useState(148);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: number }[]>([]);

  // Simulate viewer mic approval after host grant
  const handleRequestMic = () => {
    setHasRequestedMic(true);
    // Notify in chat
    const reqMsg: ChatMessage = {
      id: `req_${Date.now()}`,
      streamId: stream.id,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      role: currentUser.role,
      text: `✋ A levé la main et demande la parole au micro !`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    StorageService.saveChatMessage(reqMsg);
    setMessages((prev) => [...prev, reqMsg]);

    // Simulate approval for demo excitement if requested
    setTimeout(() => {
      setIsMicGranted(true);
    }, 2500);
  };

  const handleSendMessage = (text: string, isSuperChat?: boolean, tipAmount?: number) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      streamId: stream.id,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      role: currentUser.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSuperChat,
      tipAmount,
    };
    StorageService.saveChatMessage(newMsg);
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleSendHeart = () => {
    setHeartsCount((p) => p + 1);
    const newHeart = { id: Date.now(), left: Math.floor(Math.random() * 60) + 20 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1500);
  };

  const clarityBonusContrast = (viewerFilters.clarity / 100) * 20;
  const filterStyle: React.CSSProperties = {
    filter: `brightness(${viewerFilters.brightness}%) contrast(${viewerFilters.contrast + clarityBonusContrast}%) saturate(${viewerFilters.saturation}%)`,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Back button & Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux lives</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Lien copié !' : 'Partager'}</span>
          </button>

          {/* Clarity filter toggle */}
          <button
            onClick={() => setShowClarityPanel(!showClarityPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              showClarityPanel
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span>Filtres de clarté</span>
          </button>
        </div>
      </div>

      {/* Clarity Adjuster Drawer for Viewer */}
      {showClarityPanel && (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-4 animate-in fade-in text-xs">
          <div>
            <div className="flex justify-between text-zinc-300 mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Netteté & Clarté
              </span>
              <span className="font-mono text-zinc-400">{viewerFilters.clarity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={viewerFilters.clarity}
              onChange={(e) => setViewerFilters((p) => ({ ...p, clarity: Number(e.target.value) }))}
              className="w-full accent-rose-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-300 mb-1">
              <span>Luminosité</span>
              <span className="font-mono text-zinc-400">{viewerFilters.brightness}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="130"
              value={viewerFilters.brightness}
              onChange={(e) => setViewerFilters((p) => ({ ...p, brightness: Number(e.target.value) }))}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-300 mb-1">
              <span>Contraste</span>
              <span className="font-mono text-zinc-400">{viewerFilters.contrast}%</span>
            </div>
            <input
              type="range"
              min="70"
              max="130"
              value={viewerFilters.contrast}
              onChange={(e) => setViewerFilters((p) => ({ ...p, contrast: Number(e.target.value) }))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setViewerFilters({ brightness: 100, contrast: 100, saturation: 100, clarity: 0, blur: 0, isMirrored: false, resolution: '1080p' })}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Main Stream Player & Chat Grid */}
      <div className={`grid grid-cols-1 ${isTheaterMode ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-4 items-start`}>
        {/* Video Player Column */}
        <div className={isTheaterMode ? 'w-full space-y-4' : 'lg:col-span-8 space-y-4'}>
          <div className="relative aspect-video w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
            {/* Simulated Live Stream Feed or Video */}
            <div className="absolute inset-0 overflow-hidden" style={filterStyle}>
              {stream.activeSource === 'media' ? (
                <video
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/40" />
                </div>
              )}
            </div>

            {/* Floating Live Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>DIRECT</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md text-zinc-200 text-xs px-2.5 py-1 rounded-lg font-mono border border-white/10 flex items-center gap-1">
                <Eye className="w-3 h-3 text-rose-400" />
                <span>{stream.viewerCount}</span>
              </div>
            </div>

            {/* Bottom Stream Info Overlay */}
            {stream.activeBannerText && (
              <div className="absolute bottom-0 inset-x-0 bg-zinc-950/90 backdrop-blur-sm border-t border-rose-500/30 py-2 px-4 flex items-center gap-2 text-xs text-zinc-200 z-20">
                <span className="px-1.5 py-0.5 bg-rose-600 text-white font-extrabold text-[9px] uppercase rounded">
                  DIRECT
                </span>
                <span className="truncate">{stream.activeBannerText}</span>
              </div>
            )}

            {/* Floating Hearts Animation */}
            {floatingHearts.map((h) => (
              <div
                key={h.id}
                style={{ left: `${h.left}%` }}
                className="absolute bottom-12 text-rose-500 text-2xl animate-bounce pointer-events-none select-none z-30"
              >
                ❤️
              </div>
            ))}
          </div>

          {/* Interactive Viewer Mic Control Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={stream.creatorAvatar}
                  alt={stream.creatorName}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-rose-500/40"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  {stream.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => onViewChannel(stream.creatorId)}
                    className="text-xs font-semibold text-rose-400 hover:underline"
                  >
                    @{stream.creatorName}
                  </button>
                  <span className="text-zinc-600">·</span>
                  <span className="text-xs text-zinc-400">{stream.category}</span>
                </div>
              </div>
            </div>

            {/* Viewer Action Buttons: Raise Hand / Speak */}
            <div className="flex items-center gap-2.5">
              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  isFollowing
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                }`}
              >
                {isFollowing ? 'Abonné ✓' : "S'abonner"}
              </button>

              {/* Heart Button */}
              <button
                onClick={handleSendHeart}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-rose-400 rounded-xl text-xs font-bold transition active:scale-125"
                title="Envoyer un like"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>{heartsCount}</span>
              </button>

              {/* Raise Hand / Open Mic Button */}
              {!isMicGranted ? (
                <button
                  onClick={handleRequestMic}
                  disabled={hasRequestedMic}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    hasRequestedMic
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  <span>
                    {hasRequestedMic ? 'Demande de micro envoyée...' : 'Demander à parler au micro'}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500 px-3 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1 text-emerald-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Micro ouvert en direct !</span>
                  </div>
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs"
                    title={isMicMuted ? 'Activer le micro' : 'Couper le micro'}
                  >
                    {isMicMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Chat Column */}
        <div className="lg:col-span-4 h-[640px] sticky top-20">
          <LiveChat
            stream={stream}
            currentUser={currentUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            onDeleteMessage={() => {}}
            onPinMessage={() => {}}
            isAutoModEnabled={true}
            onOpenModerationModal={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
