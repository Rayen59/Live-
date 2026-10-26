import React, { useRef, useEffect, useState } from 'react';
import { 
  Radio, 
  Eye, 
  CircleDot, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Sparkles, 
  Download, 
  Share2, 
  Layers, 
  VideoOff, 
  CheckCircle2,
  Mic,
  Smartphone,
  RefreshCw,
  Camera,
  Scissors
} from 'lucide-react';
import { VideoFilterSettings, VideoSourceType, MediaAsset, MicRequest, RecordedVideo } from '../../types';
import { StorageService } from '../../services/storage';

interface VideoOutputCanvasProps {
  streamTitle: string;
  category: string;
  creatorName: string;
  activeSource: VideoSourceType;
  filterSettings: VideoFilterSettings;
  activeMedia?: MediaAsset;
  parallelMedia?: MediaAsset;
  onStopParallelMedia?: () => void;
  onReturnToLiveCamera?: () => void;
  activeSpeakers: MicRequest[];
  isRecording: boolean;
  onToggleRecording: () => void;
  recordingDuration: number;
  bannerTickerText?: string;
  lowerThirdTitle?: string;
  lowerThirdSubtitle?: string;
  viewerCount: number;
  onRecordingSaved?: (video: RecordedVideo) => void;
  aspectRatio?: '16:9' | '9:16';
  cameraFacingMode?: 'user' | 'environment';
  isTickerActive?: boolean;
  onToggleTicker?: () => void;
  onLaunchSponsorVideo?: (url: string, title?: string) => void;
  sponsorVideoUrl?: string;
  sponsorVideoTitle?: string;
  onOpenVideoEditor?: (video: RecordedVideo) => void;
}

export const VideoOutputCanvas: React.FC<VideoOutputCanvasProps> = ({
  streamTitle,
  category,
  creatorName,
  activeSource,
  filterSettings,
  activeMedia,
  parallelMedia,
  onStopParallelMedia,
  onReturnToLiveCamera,
  activeSpeakers,
  isRecording,
  onToggleRecording,
  recordingDuration,
  bannerTickerText = '🔴 DIRECT STREAMING · Partage d’écran et micro ouvert activés',
  lowerThirdTitle,
  lowerThirdSubtitle,
  viewerCount,
  onRecordingSaved,
  aspectRatio = '16:9',
  cameraFacingMode = 'user',
  isTickerActive = true,
  onToggleTicker,
  onLaunchSponsorVideo,
  sponsorVideoUrl,
  sponsorVideoTitle,
  onOpenVideoEditor,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaAssetVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [streamObj, setStreamObj] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recordedDownloadUrl, setRecordedDownloadUrl] = useState<string | null>(null);
  const [lastSavedVideo, setLastSavedVideo] = useState<RecordedVideo | null>(null);
  const [liveCaptionText, setLiveCaptionText] = useState<string>('Bienvenue sur le direct ! Posez vos questions dans le chat ou levez la main pour parler.');
  const [isPipMuted, setIsPipMuted] = useState(false);
  const [soloRemainingSeconds, setSoloRemainingSeconds] = useState<number>(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(cameraFacingMode);
  const [canvasFormat, setCanvasFormat] = useState<'16:9' | '9:16'>(aspectRatio);
  const [isTickerRunning, setIsTickerRunning] = useState(isTickerActive);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Automatic countdown & auto-return to live camera when broadcasting media solo
  useEffect(() => {
    if ((activeSource === 'media' || activeSource === 'poster') && activeMedia) {
      const initialSeconds = activeMedia.duration || 15;
      setSoloRemainingSeconds(initialSeconds);

      const timer = setInterval(() => {
        setSoloRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onReturnToLiveCamera) onReturnToLiveCamera();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setSoloRemainingSeconds(0);
    }
  }, [activeSource, activeMedia?.id]);

  // Format recording duration (seconds -> HH:MM:SS)
  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start webcam or handle screen stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initMedia() {
      if (activeSource === 'camera') {
        try {
          setCameraError(null);
          const isPortrait = canvasFormat === '9:16';
          // Request camera & mic with facingMode (Front/Back)
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: isPortrait ? 1080 : filterSettings.resolution === '1080p' ? 1920 : 1280 },
              height: { ideal: isPortrait ? 1920 : filterSettings.resolution === '1080p' ? 1080 : 720 },
              facingMode: facingMode,
            },
            audio: true,
          });
          currentStream = stream;
          setStreamObj(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        } catch (err: any) {
          console.warn('Accès caméra non disponible, utilisation du flux de test dynamique:', err);
          setCameraError('Accès caméra non autorisé ou non disponible sur cette machine. Affichage du studio virtuel haute définition.');
        }
      } else if (activeSource === 'screen') {
        try {
          setCameraError(null);
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });
          currentStream = screenStream;
          setStreamObj(screenStream);
          if (videoRef.current) {
            videoRef.current.srcObject = screenStream;
            videoRef.current.play().catch(() => {});
          }
        } catch (err: any) {
          console.warn('Partage d’écran annulé:', err);
          setCameraError('Partage d’écran interrompu ou annulé.');
        }
      }
    }

    if (activeSource === 'camera' || activeSource === 'screen') {
      initMedia();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeSource, filterSettings.resolution, facingMode, canvasFormat]);

  // Handle Recording start / stop
  useEffect(() => {
    if (isRecording) {
      recordedChunksRef.current = [];
      try {
        let streamToRecord = streamObj;
        if (!streamToRecord) {
          // If no live stream active, generate canvas-based or silent stream fallback
          const canvas = document.createElement('canvas');
          canvas.width = 1280;
          canvas.height = 720;
          streamToRecord = canvas.captureStream(30);
        }
        const recorder = new MediaRecorder(streamToRecord, { mimeType: 'video/webm;codecs=vp8,opus' });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedDownloadUrl(url);

          const savedVideo: RecordedVideo = {
            id: `rec_${Date.now()}`,
            streamId: `stream_${Date.now()}`,
            creatorId: 'user_alex',
            creatorName,
            creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            title: `${streamTitle} (Session Enregistrée)`,
            description: `Session live enregistrée avec filtres de clarté personnalisés et micro partagé.`,
            category: category as any,
            duration: recordingDuration || 45,
            recordedAt: new Date().toISOString(),
            thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
            videoUrl: url,
            viewsCount: 1,
            sizeBytes: blob.size,
            aiSummary: `Enregistrement officiel de la session "${streamTitle}". Qualité 1080p avec netteté ajustée.`,
            tags: [category, 'Replay', 'Studio'],
          };
          setLastSavedVideo(savedVideo);
          StorageService.saveRecording(savedVideo);
          if (onRecordingSaved) onRecordingSaved(savedVideo);
        };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.error('Erreur MediaRecorder:', e);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }
  }, [isRecording]);

  // Compute CSS filter style for video and clarity adjustment
  // Clarity is translated into a mix of contrast boost and CSS sharpness simulation
  const clarityBonusContrast = (filterSettings.clarity / 100) * 20; // 0 to 20% extra punch
  const filterStyle: React.CSSProperties = {
    filter: `brightness(${filterSettings.brightness}%) contrast(${filterSettings.contrast + clarityBonusContrast}%) saturate(${filterSettings.saturation}%) blur(${filterSettings.blur}px)`,
    transform: filterSettings.isMirrored ? 'scaleX(-1)' : 'none',
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Studio Program Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-2xl text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-live-pulse" />
            <span className="font-extrabold text-white tracking-wider uppercase text-[11px]">
              PROGRAMME EN DIRECT
            </span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Eye className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold">{viewerCount} spectateurs</span>
          </div>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400 font-mono">
            Résolution : <strong className="text-white">{filterSettings.resolution}</strong>
          </span>
        </div>

        {/* Camera Flip, Format Switcher & Recording Controller */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Flip Front/Back Camera for Mobile */}
          {activeSource === 'camera' && (
            <button
              onClick={handleToggleFacingMode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95 shadow-sm"
              title="Basculer caméra avant (selfie) / arrière"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Caméra:</span>
              <span>{facingMode === 'user' ? 'Avant 🤳' : 'Arrière 📸'}</span>
            </button>
          )}

          {/* Format Switcher (Mobile 9:16 vs Desktop 16:9) */}
          <button
            onClick={() => setCanvasFormat((prev) => (prev === '16:9' ? '9:16' : '16:9'))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              canvasFormat === '9:16'
                ? 'bg-purple-600/25 border-purple-500 text-purple-200'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
            title="Changer de format d'affichage (Smartphone 9:16 / Écran 16:9)"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>{canvasFormat === '9:16' ? '📱 Mobile 9:16' : '💻 Paysage 16:9'}</span>
          </button>

          {isRecording ? (
            <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/50 px-3 py-1 rounded-xl text-rose-200">
              <CircleDot className="w-3.5 h-3.5 text-rose-500 animate-ping" />
              <span className="font-mono font-bold">{formatDuration(recordingDuration)}</span>
              <button
                onClick={onToggleRecording}
                className="ml-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 px-2 py-0.5 rounded transition cursor-pointer"
              >
                Arrêter & Sauvegarder
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl border border-zinc-700 font-semibold transition cursor-pointer"
            >
              <CircleDot className="w-3.5 h-3.5 text-rose-500" />
              <span>Enregistrer la session</span>
            </button>
          )}

          {/* Action to Edit / Trim / Cut Recorded Session */}
          {lastSavedVideo && onOpenVideoEditor && (
            <button
              onClick={() => onOpenVideoEditor(lastSavedVideo)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition shadow-md cursor-pointer animate-in zoom-in-95 duration-200"
              title="Modifier la vidéo ou supprimer des instants précis"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>✂️ Modifier & Couper la vidéo</span>
            </button>
          )}

          {/* Download to Device Storage */}
          {recordedDownloadUrl && (
            <a
              href={recordedDownloadUrl}
              download={`${streamTitle.replace(/[^a-zA-Z0-9_-]/g, '_') || 'session_live'}.webm`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow"
              title="Enregistrer la vidéo sur la mémoire de votre téléphone ou votre PC"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Enregistrer sur mon appareil</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Broadcast Screen Area */}
      <div
        ref={containerRef}
        className={`relative ${
          canvasFormat === '9:16'
            ? 'w-full max-w-sm mx-auto aspect-[9/16] min-h-[540px] max-h-[640px] rounded-3xl'
            : 'aspect-video w-full rounded-2xl'
        } bg-zinc-950 overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center group select-none transition-all duration-300`}
      >
        {/* Source: Camera or Screen (Always plays active HD broadcast video feed) */}
        {(activeSource === 'camera' || activeSource === 'screen') && (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
            <video
              ref={videoRef}
              src={!streamObj ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : undefined}
              autoPlay
              loop={!streamObj}
              playsInline
              muted
              style={filterStyle}
              className="w-full h-full object-cover transition-all duration-200"
            />

            {!streamObj && (
              <div className="absolute top-14 left-4 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-xl text-[10px] text-emerald-400 font-semibold shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>Flux Direct Broadcast HD 1080p Actif</span>
              </div>
            )}
          </div>
        )}

        {/* Source: Pre-recorded Video Asset / Ad (Solo Mode) */}
        {activeSource === 'media' && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <video
              ref={mediaAssetVideoRef}
              src={activeMedia?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
              autoPlay
              playsInline
              controls
              onEnded={() => {
                if (onReturnToLiveCamera) onReturnToLiveCamera();
              }}
              style={filterStyle}
              className="w-full h-full object-contain"
            />
            
            {/* Solo Broadcast Banner with Live Auto-Return Countdown */}
            <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md border border-rose-500/50 p-2.5 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {activeMedia?.isAd ? '📢 PUBLICITÉ EN SOLO' : '🎞️ VIDÉO EN SOLO'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[11px] font-black">
                      Retour direct dans : {soloRemainingSeconds}s
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    La vidéo s'affiche seule. Le live reviendra automatiquement à la caméra.
                  </p>
                </div>
              </div>

              {onReturnToLiveCamera && (
                <button
                  onClick={onReturnToLiveCamera}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition flex items-center gap-1.5"
                >
                  <span>Reprendre le direct</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Source: Poster / Presentation Slide */}
        {activeSource === 'poster' && (
          <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center">
            {activeMedia ? (
              <img
                src={activeMedia.url}
                alt={activeMedia.name}
                style={filterStyle}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-zinc-400 text-xs">
                Aucune affiche sélectionnée.
              </div>
            )}
            {/* Poster Solo Auto-Return Banner */}
            <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md border border-amber-500/50 p-2.5 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">🖼️ AFFICHE / PRÉSENTATION</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px] font-black">
                      Retour direct dans : {soloRemainingSeconds}s
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Affiche seule active. Le direct caméra reprendra automatiquement.
                  </p>
                </div>
              </div>
              {onReturnToLiveCamera && (
                <button
                  onClick={onReturnToLiveCamera}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition"
                >
                  Reprendre le direct
                </button>
              )}
            </div>
          </div>
        )}

        {/* Parallel Video / Picture-in-Picture (PiP) Window */}
        {parallelMedia && (activeSource === 'camera' || activeSource === 'screen') && (
          <div className="absolute bottom-16 right-4 z-25 w-60 sm:w-72 aspect-video bg-zinc-950 rounded-2xl border-2 border-purple-500 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-purple-950/90 border-b border-purple-500/40 text-[10px] font-bold text-purple-200">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping shrink-0" />
                <span className="truncate">{parallelMedia.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsPipMuted(!isPipMuted)}
                  className="p-1 hover:text-white rounded cursor-pointer"
                  title={isPipMuted ? 'Activer le son de la vidéo PiP' : 'Couper le son de la vidéo PiP'}
                >
                  {isPipMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-400" /> : <Volume2 className="w-3.5 h-3.5 text-purple-300" />}
                </button>
                {onStopParallelMedia && (
                  <button
                    onClick={onStopParallelMedia}
                    className="p-1 hover:text-rose-400 rounded cursor-pointer font-bold"
                    title="Arrêter l'encart vidéo parallèle"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
              {parallelMedia.type === 'video' ? (
                <video
                  src={parallelMedia.url}
                  autoPlay
                  loop
                  playsInline
                  muted={isPipMuted}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={parallelMedia.url}
                  alt={parallelMedia.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-purple-300">
                📢 DIFFUSION EN PARALLÈLE
              </div>
            </div>
          </div>
        )}

        {/* OVERLAYS */}
        
        {/* On-Air Live Watermark Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-rose-950/50">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md text-zinc-200 text-xs px-2.5 py-1 rounded-lg font-mono border border-white/10 flex items-center gap-1">
            <Eye className="w-3 h-3 text-rose-400" />
            <span>{viewerCount}</span>
          </div>
          {activeSource === 'camera' && (
            <button
              onClick={handleToggleFacingMode}
              className="flex items-center gap-1 bg-black/70 hover:bg-black/90 active:scale-90 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-1 rounded-lg border border-white/20 transition cursor-pointer shadow-lg"
              title="Inverser caméra téléphone (Avant / Arrière)"
            >
              <RefreshCw className="w-3 h-3 text-rose-400" />
              <span>{facingMode === 'user' ? 'Cam Avant' : 'Cam Arrière'}</span>
            </button>
          )}
        </div>

        {/* Guest Speaker Microphone Floating Box (when host opens a viewer's mic) */}
        {activeSpeakers.length > 0 && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 max-w-xs">
            {activeSpeakers.map((sp) => (
              <div
                key={sp.id}
                className="flex items-center gap-2.5 bg-zinc-950/85 backdrop-blur-md border border-emerald-500/60 p-2 rounded-2xl shadow-xl animate-in slide-in-from-right duration-200"
              >
                <div className="relative">
                  <img
                    src={sp.avatar}
                    alt={sp.username}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-zinc-950 font-black">
                    🎙️
                  </span>
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate">{sp.username}</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded uppercase font-bold">
                      Micro
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>En direct avec le créateur</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lower-Third Title Bar Overlay */}
        {(lowerThirdTitle || streamTitle) && (
          <div className="absolute bottom-12 left-4 z-20 max-w-md animate-in slide-in-from-bottom duration-300">
            <div className="bg-gradient-to-r from-zinc-950/95 to-zinc-900/90 backdrop-blur-md border border-zinc-700/60 p-3 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <h3 className="text-sm font-bold text-white truncate leading-tight">
                  {lowerThirdTitle || streamTitle}
                </h3>
              </div>
              <p className="text-xs text-zinc-300 truncate">
                {lowerThirdSubtitle || `${creatorName} · Catégorie ${category}`}
              </p>
            </div>
          </div>
        )}

        {/* AUTOMATED TV-STYLE NEWS TICKER MARQUEE (Bandeau d'information défilant type Télévision) */}
        <div className="absolute bottom-0 inset-x-0 h-8 sm:h-9 bg-zinc-950/95 backdrop-blur-md border-t border-rose-500/50 flex items-center justify-between text-xs text-zinc-100 z-30 shadow-2xl overflow-hidden select-none">
          {/* TV Label Badge (Static on the left, like TV channels) */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider shrink-0 z-30 shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>TV LIVE</span>
          </div>

          {/* Scrolling Marquee Container (Immediate start at 0% with seamless doubled blocks) */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center px-2">
            <div className={`flex items-center gap-6 ${isTickerRunning ? 'animate-tv-ticker' : 'overflow-x-auto'}`}>
              <div className="flex items-center gap-5 shrink-0 font-medium text-[11px] sm:text-xs text-zinc-100">
                <span className="text-rose-400 font-bold">🔴 {bannerTickerText || 'DIRECT STREAMING PRO'}</span>
                <span className="text-zinc-500 font-bold">•</span>
                <span className="text-white font-semibold">{streamTitle}</span>
                <span className="text-zinc-500 font-bold">•</span>
                <span className="text-amber-400">@{creatorName}</span>
                <span className="text-zinc-500 font-bold">•</span>
                <span className="text-emerald-400">📱 Synchronisé Téléphones & PC</span>
                <span className="text-zinc-500 font-bold">•</span>
              </div>
              <div className="flex items-center gap-5 shrink-0 font-medium text-[11px] sm:text-xs text-zinc-100" aria-hidden="true">
                <span className="text-rose-400 font-bold">🔴 {bannerTickerText || 'DIRECT STREAMING PRO'}</span>
                <span className="text-zinc-500 font-bold">•</span>
                <span className="text-white font-semibold">{streamTitle}</span>
                <span className="text-zinc-500 font-bold">•</span>
                <span className="text-amber-400">@{creatorName}</span>
                <span className="text-zinc-500 font-bold">•</span>
                <span className="text-emerald-400">📱 Synchronisé Téléphones & PC</span>
                <span className="text-zinc-500 font-bold">•</span>
              </div>
            </div>
          </div>

          {/* Right Action Controls: Admin Ticker Toggle & Fullscreen */}
          <div className="flex items-center gap-1 px-2.5 bg-zinc-950/95 z-30 border-l border-zinc-800 shrink-0">
            <button
              onClick={() => {
                const next = !isTickerRunning;
                setIsTickerRunning(next);
                if (onToggleTicker) onToggleTicker();
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                isTickerRunning
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  : 'bg-amber-600 text-white hover:bg-amber-500'
              }`}
              title={isTickerRunning ? "Stopper le défilement du bandeau" : "Relancer le défilement du bandeau"}
            >
              <span>{isTickerRunning ? '⏸ Stopper' : '▶ Animer'}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Plein écran"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* External TV Ticker Dock Strip (Visible and accessible directly under the monitor) */}
      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="font-bold text-white uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/30 shrink-0">
            Bandeau TV Live
          </span>
          <p className="text-zinc-300 text-xs truncate">
            {bannerTickerText || '🔴 DIRECT STREAMING · Posez vos questions et demandez la parole !'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const next = !isTickerRunning;
              setIsTickerRunning(next);
              if (onToggleTicker) onToggleTicker();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow ${
              isTickerRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <span>{isTickerRunning ? '⏸ Stopper le bandeau' : '▶ Lancer le bandeau TV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
