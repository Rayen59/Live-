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
  Mic
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
  activeSpeakers: MicRequest[];
  isRecording: boolean;
  onToggleRecording: () => void;
  recordingDuration: number;
  bannerTickerText?: string;
  lowerThirdTitle?: string;
  lowerThirdSubtitle?: string;
  viewerCount: number;
  onRecordingSaved?: (video: RecordedVideo) => void;
}

export const VideoOutputCanvas: React.FC<VideoOutputCanvasProps> = ({
  streamTitle,
  category,
  creatorName,
  activeSource,
  filterSettings,
  activeMedia,
  activeSpeakers,
  isRecording,
  onToggleRecording,
  recordingDuration,
  bannerTickerText = '🔴 DIRECT STREAMING · Partage d’écran et micro ouvert activés',
  lowerThirdTitle,
  lowerThirdSubtitle,
  viewerCount,
  onRecordingSaved,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaAssetVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [streamObj, setStreamObj] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recordedDownloadUrl, setRecordedDownloadUrl] = useState<string | null>(null);
  const [liveCaptionText, setLiveCaptionText] = useState<string>('Bienvenue sur le direct ! Posez vos questions dans le chat ou levez la main pour parler.');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

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
          // Request camera & mic
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: filterSettings.resolution === '1080p' ? 1920 : filterSettings.resolution === '720p' ? 1280 : 854 },
              height: { ideal: filterSettings.resolution === '1080p' ? 1080 : filterSettings.resolution === '720p' ? 720 : 480 },
              facingMode: 'user',
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
  }, [activeSource, filterSettings.resolution]);

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

        {/* Recording Controller */}
        <div className="flex items-center gap-2">
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

          {recordedDownloadUrl && (
            <a
              href={recordedDownloadUrl}
              download={`stream-${Date.now()}.webm`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger le Replay</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Broadcast Screen Area */}
      <div
        ref={containerRef}
        className="relative aspect-video w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center group select-none"
      >
        {/* Source: Camera or Screen */}
        {(activeSource === 'camera' || activeSource === 'screen') && (
          <>
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-zinc-900 to-zinc-950">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-rose-400 mb-3 shadow-inner">
                  <Radio className="w-8 h-8 animate-pulse" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  Flux Vidéo Live StreamPulse Simulation HD
                </h4>
                <p className="text-xs text-zinc-400 max-w-md mb-4">
                  {cameraError}
                </p>
                <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Flux de secours dynamique actif (1080p 60fps)</span>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={filterStyle}
                className="w-full h-full object-cover transition-all duration-200"
              />
            )}
          </>
        )}

        {/* Source: Pre-recorded Video Asset / Ad */}
        {activeSource === 'media' && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            {activeMedia && activeMedia.type === 'video' ? (
              <video
                ref={mediaAssetVideoRef}
                src={activeMedia.url}
                autoPlay
                loop
                playsInline
                controls
                style={filterStyle}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-zinc-400 text-xs">
                Aucune vidéo média sélectionnée dans la galerie.
              </div>
            )}
            <div className="absolute top-4 right-4 bg-purple-600/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5">
              <span>{activeMedia?.isAd ? '📢 PUBLICITÉ / SPONSOR' : '🎞️ VIDÉO GALERIE'}</span>
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
            <div className="absolute top-4 right-4 bg-amber-600/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white shadow-lg">
              🖼️ PRÉSENTATION / AFFICHE
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

        {/* Bottom Ticker News Banner */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-rose-950/90 via-zinc-950/90 to-zinc-950/90 border-t border-rose-500/30 py-1.5 px-4 flex items-center justify-between text-xs text-zinc-200 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="px-1.5 py-0.5 bg-rose-600 text-white font-extrabold text-[9px] uppercase tracking-wider rounded">
              INFO
            </span>
            <span className="truncate font-medium">{bannerTickerText}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-white/10 text-zinc-300 hover:text-white transition"
              title="Plein écran"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
