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
  Minimize,
  Volume2, 
  VolumeX, 
  Check, 
  Smartphone,
  Wifi,
  Film
} from 'lucide-react';
import { LiveStream, User, ChatMessage, VideoFilterSettings, MicRequest } from '../../types';
import { LiveChat } from '../Chat/LiveChat';
import { StorageService } from '../../services/storage';
import { realtime } from '../../services/realtime';

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
  const [currentStreamState, setCurrentStreamState] = useState<LiveStream>(stream);
  const [messages, setMessages] = useState<ChatMessage[]>(StorageService.getChatMessages(stream.id));
  const [liveViewerCount, setLiveViewerCount] = useState<number>(stream.viewerCount || 1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasRequestedMic, setHasRequestedMic] = useState(false);
  const [myMicRequestId, setMyMicRequestId] = useState<string | null>(null);
  const [isMicGranted, setIsMicGranted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [viewerLocalStream, setViewerLocalStream] = useState<MediaStream | null>(null);

  // Fullscreen State
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Video & Audio Streaming State
  const [hasWebRTCStream, setHasWebRTCStream] = useState(false);
  const [liveVideoFrame, setLiveVideoFrame] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(1);
  const [showUnmuteAlert, setShowUnmuteAlert] = useState(false);
  const [isBroadcasterOnline, setIsBroadcasterOnline] = useState(true);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

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
  const [playerFormat, setPlayerFormat] = useState<'16:9' | '9:16'>(
    stream.aspectRatio || (typeof window !== 'undefined' && window.innerWidth < 768 ? '9:16' : '16:9')
  );

  // FULLSCREEN TOGGLE
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    } else {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // REAL-TIME WEBSOCKET & WEBRTC SYNC ENGINE
  useEffect(() => {
    // 1. Join room as viewer
    realtime.join(stream.id, 'viewer', currentUser);

    // 2. Real-time Viewer count update
    const unsubViewers = realtime.on('viewer_count_updated', ({ viewerCount }) => {
      if (typeof viewerCount === 'number') {
        setLiveViewerCount(viewerCount);
      }
    });

    // 3. Real-time Stream Updates (Ads, sponsor video, banner ticker, lower-third)
    const unsubStream = realtime.on('stream_update', ({ data }) => {
      if (data) {
        setCurrentStreamState((prev) => ({ ...prev, ...data }));
        if (data.aspectRatio) setPlayerFormat(data.aspectRatio);
      }
    });

    const unsubSSE = StorageService.subscribeToSyncEvents((event) => {
      if (event.type === 'stream_updated') {
        const streamData = event.data?.stream;
        if (streamData && streamData.id === stream.id) {
          setCurrentStreamState((prev) => ({ ...prev, ...streamData }));
          if (streamData.aspectRatio) setPlayerFormat(streamData.aspectRatio);
        }
      }
    });

    // 4. Real-time Video Frame Snapshots (Zero latency visual feed fallback)
    const unsubFrame = realtime.on('video_frame', ({ frame }) => {
      if (frame) {
        setLiveVideoFrame(frame);
      }
    });

    // 5. Broadcaster Online / Offline Status
    const unsubBroadcasterOnline = realtime.on('broadcaster_online', () => {
      setIsBroadcasterOnline(true);
    });

    const unsubBroadcasterOffline = realtime.on('broadcaster_offline', () => {
      setIsBroadcasterOnline(false);
      setHasWebRTCStream(false);
    });

    // 6. Real-time Chat Messages
    const unsubChat = realtime.on('chat_message', ({ message }) => {
      if (message && message.streamId === stream.id) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      }
    });

    // 7. Initial Room State from Server
    const unsubInitial = realtime.on('initial_state', ({ stream: initStream, lastFrame, viewerCount }) => {
      if (initStream) setCurrentStreamState((prev) => ({ ...prev, ...initStream }));
      if (lastFrame) setLiveVideoFrame(lastFrame);
      if (typeof viewerCount === 'number') setLiveViewerCount(viewerCount);
    });

    // 8. Real-time Hand Raise / Mic Status from Host
    const unsubMics = realtime.on('mic_status_changed', async ({ requestId, action, isMuted }) => {
      if (myMicRequestId && requestId === myMicRequestId) {
        if (action === 'accept') {
          setIsMicGranted(true);
          setHasRequestedMic(false);
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setViewerLocalStream(micStream);
          } catch (err) {
            console.warn('Accès microphone bloqué:', err);
          }
        } else if (action === 'decline' || action === 'remove') {
          setIsMicGranted(false);
          setHasRequestedMic(false);
          if (viewerLocalStream) {
            viewerLocalStream.getTracks().forEach((t) => t.stop());
            setViewerLocalStream(null);
          }
        } else if (action === 'mute') {
          setIsMicMuted(!!isMuted);
          if (viewerLocalStream) {
            viewerLocalStream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
          }
        }
      }
    });

    // 9. WebRTC Signaling Listener (Receives broadcaster audio/video offer)
    const unsubSignal = realtime.on('webrtc_signal', async ({ senderId, signal }) => {
      try {
        if (signal.type === 'offer') {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
          }

          const pc = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          });

          peerConnectionRef.current = pc;

          pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
              setHasWebRTCStream(true);
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.volume = audioVolume;
                remoteVideoRef.current.play().then(() => {
                  setShowUnmuteAlert(false);
                }).catch(() => {
                  if (remoteVideoRef.current) {
                    remoteVideoRef.current.muted = true;
                    remoteVideoRef.current.play().catch(() => {});
                    setIsAudioMuted(true);
                    setShowUnmuteAlert(true);
                  }
                });
              }
            }
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              realtime.sendWebRTCSignal(stream.id, stream.creatorId, currentUser.id, {
                type: 'candidate',
                candidate: event.candidate,
              });
            }
          };

          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          realtime.sendWebRTCSignal(stream.id, stream.creatorId, currentUser.id, {
            type: 'answer',
            sdp: pc.localDescription,
          });
        } else if (signal.type === 'candidate' && signal.candidate && peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn('[WebRTC Viewer] Erreur signal:', err);
      }
    });

    return () => {
      unsubViewers();
      unsubStream();
      unsubFrame();
      unsubBroadcasterOnline();
      unsubBroadcasterOffline();
      unsubChat();
      unsubInitial();
      unsubMics();
      unsubSignal();
      unsubSSE();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (viewerLocalStream) {
        viewerLocalStream.getTracks().forEach((t) => t.stop());
      }
      realtime.leave(stream.id, currentUser.id);
    };
  }, [stream.id, currentUser.id, myMicRequestId, viewerLocalStream, audioVolume]);

  // Unmute creator's voice
  const handleEnableAudio = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = audioVolume || 1;
      remoteVideoRef.current.play().then(() => {
        setIsAudioMuted(false);
        setShowUnmuteAlert(false);
      }).catch(() => {});
    }
  };

  const handleToggleMute = () => {
    if (remoteVideoRef.current) {
      const nextMuted = !isAudioMuted;
      remoteVideoRef.current.muted = nextMuted;
      setIsAudioMuted(nextMuted);
      if (!nextMuted) setShowUnmuteAlert(false);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setAudioVolume(newVol);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = newVol;
      if (newVol > 0 && isAudioMuted) {
        remoteVideoRef.current.muted = false;
        setIsAudioMuted(false);
        setShowUnmuteAlert(false);
      }
    }
  };

  // Real Hand Raise / Mic Request
  const handleRequestMic = () => {
    const reqId = `req_${Date.now()}`;
    setMyMicRequestId(reqId);
    setHasRequestedMic(true);

    const micRequest: MicRequest = {
      id: reqId,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    StorageService.sendMicAction('request', stream.id, { micRequest });

    // Announce in live chat
    const reqMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
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
  };

  const handleToggleViewerMic = () => {
    const nextMuted = !isMicMuted;
    setIsMicMuted(nextMuted);
    if (viewerLocalStream) {
      viewerLocalStream.getAudioTracks().forEach((t) => (t.enabled = !nextMuted));
    }
  };

  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      streamId: stream.id,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      role: currentUser.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  // AD / MEDIA DETECTION (Real-time synchronization for full screen and PiP ads)
  const isAdOrMediaSolo =
    currentStreamState.activeSource === 'media' || currentStreamState.activeSource === 'poster';

  const activeMediaUrl =
    currentStreamState.currentMediaUrl ||
    currentStreamState.sponsorVideoUrl ||
    (currentStreamState.currentMediaId
      ? StorageService.getMediaAssets().find((m) => m.id === currentStreamState.currentMediaId)?.url
      : null);

  const isMediaVideo =
    currentStreamState.activeSource === 'media' ||
    currentStreamState.currentMediaType === 'video' ||
    (activeMediaUrl && !activeMediaUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) && !activeMediaUrl.startsWith('data:image'));

  const parallelMediaUrl =
    currentStreamState.parallelMediaUrl ||
    (currentStreamState.parallelMediaId
      ? StorageService.getMediaAssets().find((m) => m.id === currentStreamState.parallelMediaId)?.url
      : null);

  const isParallelVideo =
    currentStreamState.parallelMediaType === 'video' ||
    (parallelMediaUrl && !parallelMediaUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) && !parallelMediaUrl.startsWith('data:image'));

  const parallelMediaTitle = currentStreamState.parallelMediaName || 'Publicité sponsor';

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
          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition cursor-pointer shadow-sm"
            title="Agrandir en plein écran (Fullscreen)"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 text-rose-400" /> : <Maximize className="w-3.5 h-3.5 text-rose-400" />}
            <span>{isFullscreen ? 'Quitter Plein écran' : 'Plein écran'}</span>
          </button>

          {/* Format Toggle for Mobile vs Landscape Viewer */}
          <button
            onClick={() => setPlayerFormat((p) => (p === '16:9' ? '9:16' : '16:9'))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              playerFormat === '9:16'
                ? 'bg-purple-600/25 border-purple-500 text-purple-200 shadow'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
            title="Changer de mode d'affichage (Smartphone 9:16 ou Écran 16:9)"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>{playerFormat === '9:16' ? '📱 Mode Téléphone (9:16)' : '💻 Mode Paysage (16:9)'}</span>
          </button>

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
          <div 
            ref={playerContainerRef}
            onClick={handleEnableAudio}
            onDoubleClick={handleSendHeart}
            className={`relative ${
              isFullscreen 
                ? 'fixed inset-0 z-50 w-screen h-screen rounded-none bg-black'
                : playerFormat === '9:16'
                ? 'w-full max-w-sm mx-auto aspect-[9/16] min-h-[540px] max-h-[640px] rounded-3xl'
                : 'aspect-video w-full rounded-2xl'
            } bg-zinc-950 overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer select-none`}
            title="Cliquez pour le son · Double-cliquez pour un cœur ❤️"
          >
            {/* FLOATING PROMPT TO UNMUTE CREATOR'S AUDIO */}
            {showUnmuteAlert && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnableAudio();
                }}
                className="absolute top-16 inset-x-6 z-40 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-3 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between text-white animate-bounce cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Volume2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-extrabold text-xs">🔊 La voix du créateur est en direct !</p>
                    <p className="text-[11px] text-white/90">Cliquez ici pour activer le son et l'entendre parler</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white text-zinc-950 font-black text-xs rounded-xl shadow">
                  Écouter
                </span>
              </div>
            )}

            {/* CASE 1: SPONSOR VIDEO / AD BROADCAST SOLO BY CREATOR */}
            {isAdOrMediaSolo && activeMediaUrl ? (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                {isMediaVideo ? (
                  <video
                    src={activeMediaUrl}
                    autoPlay
                    loop
                    playsInline
                    muted={isAudioMuted}
                    className="w-full h-full object-contain"
                    style={filterStyle}
                  />
                ) : (
                  <img
                    src={activeMediaUrl}
                    alt="Publicité"
                    className="w-full h-full object-contain"
                    style={filterStyle}
                  />
                )}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg">
                  <Film className="w-3.5 h-3.5" />
                  <span>📢 Publicité / Clip Partenaire en direct</span>
                </div>
              </div>
            ) : (
              /* CASE 2: LIVE BROADCAST FEED (WEBRTC AUDIO/VIDEO + FALLBACK FRAMES) */
              <div className="absolute inset-0 overflow-hidden" style={filterStyle}>
                {/* Real-time WebRTC Video & Microphone Stream */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted={isAudioMuted}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${hasWebRTCStream ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Instant visual fallback frame while WebRTC connects (guarantees NO black screen) */}
                {liveVideoFrame && !hasWebRTCStream && (
                  <img
                    src={liveVideoFrame}
                    alt="Direct"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                )}

                {/* Initializing fallback (high definition studio background, never black) */}
                {!hasWebRTCStream && !liveVideoFrame && (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                      <Radio className="w-8 h-8 text-rose-500 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">Connexion au direct en temps réel...</h4>
                      <p className="text-xs text-zinc-400 mt-1">Réception du signal vidéo et de la voix du créateur</p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-black/20 pointer-events-none" />
              </div>
            )}

            {/* PARALLEL PICTURE-IN-PICTURE AD (IF BROADCASTER LAUNCHED PIP AD) */}
            {parallelMediaUrl && (
              <div className="absolute bottom-12 right-4 z-30 w-44 sm:w-56 aspect-video bg-black rounded-xl overflow-hidden border-2 border-purple-500 shadow-2xl animate-in zoom-in-95">
                {isParallelVideo ? (
                  <video
                    src={parallelMediaUrl}
                    autoPlay
                    loop
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={parallelMediaUrl}
                    alt={parallelMediaTitle}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-1 left-1 bg-purple-950/90 text-purple-200 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-400/30">
                  📢 Encart Publicité
                </div>
              </div>
            )}

            {/* Floating Live Badge & Real-Time Viewer Count */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>DIRECT</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md text-zinc-200 text-xs px-2.5 py-1 rounded-lg font-mono border border-white/10 flex items-center gap-1">
                <Eye className="w-3 h-3 text-rose-400" />
                <span className="font-bold">{liveViewerCount}</span>
              </div>
              {hasWebRTCStream && (
                <div className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-xs px-2 py-1 rounded-lg font-bold border border-emerald-500/40 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span>HD 1080p Direct</span>
                </div>
              )}
            </div>

            {/* Floating Player Actions (Top Right Fullscreen Toggle) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 transition cursor-pointer"
                title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>

            {/* Lower-Third Title Overlay if set by broadcaster */}
            {currentStreamState.lowerThirdTitle && (
              <div className="absolute bottom-12 left-4 z-20 bg-zinc-950/90 backdrop-blur-md border-l-4 border-rose-500 px-3 py-2 rounded-r-xl shadow-2xl max-w-sm pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                <p className="text-xs font-bold text-white">{currentStreamState.lowerThirdTitle}</p>
                {currentStreamState.lowerThirdSubtitle && (
                  <p className="text-[11px] text-zinc-400">{currentStreamState.lowerThirdSubtitle}</p>
                )}
              </div>
            )}

            {/* NEWS TICKER MARQUEE - DISPLAYS ONLY WHAT THE CREATOR WRITES (NO FILLER / NO HARDCODED STRINGS) */}
            {currentStreamState.activeBannerText && currentStreamState.activeBannerText.trim() && (
              <div className="absolute bottom-0 inset-x-0 h-8 bg-zinc-950/95 backdrop-blur-md border-t border-rose-500/50 flex items-center text-xs text-zinc-100 z-30 shadow-xl overflow-hidden select-none">
                <div className="flex-1 overflow-hidden relative h-full flex items-center px-3">
                  <div className={`flex items-center gap-8 ${currentStreamState.isTickerActive !== false ? 'animate-tv-ticker' : 'overflow-x-auto'}`}>
                    <span className="shrink-0 font-bold text-xs text-white">
                      {currentStreamState.activeBannerText.trim()}
                    </span>
                    <span className="shrink-0 font-bold text-xs text-white" aria-hidden="true">
                      {currentStreamState.activeBannerText.trim()}
                    </span>
                    <span className="shrink-0 font-bold text-xs text-white" aria-hidden="true">
                      {currentStreamState.activeBannerText.trim()}
                    </span>
                  </div>
                </div>
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

          {/* Audio Equalizer, Volume Controller & Fullscreen Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleMute}
                className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold transition cursor-pointer ${
                  isAudioMuted
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                }`}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                <span>{isAudioMuted ? 'Son coupé (Activer)' : 'Voix du créateur active'}</span>
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isAudioMuted ? 0 : audioVolume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-24 accent-rose-500 cursor-pointer"
                  title="Régler le volume sonore du direct"
                />
                <span className="font-mono text-zinc-400 text-[11px]">
                  {isAudioMuted ? '0%' : `${Math.round(audioVolume * 100)}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 font-semibold transition cursor-pointer"
              >
                {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                <span>{isFullscreen ? 'Réduire' : 'Plein écran'}</span>
              </button>

              {/* On-Air Guest Indicator if viewer has mic granted */}
              {isMicGranted && (
                <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/60 px-3 py-1.5 rounded-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-emerald-300 text-xs">🎙️ Votre micro est en direct !</span>
                  <button
                    onClick={handleToggleViewerMic}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer"
                    title={isMicMuted ? 'Activer votre micro' : 'Couper votre micro'}
                  >
                    {isMicMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Viewer Mic Control Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentStreamState.creatorAvatar}
                  alt={currentStreamState.creatorName}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-rose-500/40"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">
                  {currentStreamState.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => onViewChannel(currentStreamState.creatorId)}
                    className="text-xs font-semibold text-rose-400 hover:underline cursor-pointer"
                  >
                    @{currentStreamState.creatorName}
                  </button>
                  <span className="text-zinc-600">·</span>
                  <span className="text-xs text-zinc-400">{currentStreamState.category}</span>
                </div>
              </div>
            </div>

            {/* Viewer Action Buttons: Raise Hand / Speak */}
            <div className="flex items-center gap-2.5">
              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
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
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-rose-400 rounded-xl text-xs font-bold transition active:scale-125 cursor-pointer"
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
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer active:scale-95'
                  }`}
                >
                  <Hand className="w-4 h-4" />
                  <span>
                    {hasRequestedMic ? '✋ Main levée... En attente du créateur' : 'Demander la parole au micro'}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500 px-3 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1 text-emerald-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Micro ouvert</span>
                  </div>
                  <button
                    onClick={handleToggleViewerMic}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs cursor-pointer"
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
            stream={currentStreamState}
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
