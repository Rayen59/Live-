import React, { useState } from 'react';
import { X, Play, Download, Sparkles, Clock, Eye, Calendar, Share2, Check, Radio, Scissors } from 'lucide-react';
import { RecordedVideo } from '../types';

interface VideoPlayerModalProps {
  video: RecordedVideo | null;
  onClose: () => void;
  onViewChannel?: (creatorId: string) => void;
  onOpenEditor?: (video: RecordedVideo) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onViewChannel,
  onOpenEditor,
}) => {
  const [copied, setCopied] = useState(false);

  if (!video) return null;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins} min ${secs > 0 ? `${secs}s` : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold uppercase">
              Replay Enregistré
            </span>
            <h2 className="text-sm font-bold text-white truncate max-w-md">
              {video.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="relative w-full h-full">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center mb-3 shadow-xl">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <p className="text-sm font-bold text-white">Vidéo de session prête pour le streaming</p>
                <p className="text-xs text-zinc-400">Qualité 1080p · Audio Stéréo</p>
              </div>
            </div>
          )}
        </div>

        {/* Details & AI Summary */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={video.creatorAvatar}
                alt={video.creatorName}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-sm font-bold text-white">{video.title}</h3>
                <p className="text-zinc-400 text-xs">
                  Diffusé par{' '}
                  <button
                    onClick={() => {
                      if (onViewChannel) onViewChannel(video.creatorId);
                      onClose();
                    }}
                    className="text-rose-400 font-semibold hover:underline"
                  >
                    @{video.creatorName}
                  </button>
                  {' '}· {video.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenEditor && (
                <button
                  onClick={() => {
                    onOpenEditor(video);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl font-bold transition shadow cursor-pointer"
                  title="Modifier la vidéo ou supprimer des instants précis"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Modifier & Couper</span>
                </button>
              )}

              {video.videoUrl && (
                <a
                  href={video.videoUrl}
                  download={`${video.title}.mp4`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </a>
              )}

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Lien copié' : 'Partager'}</span>
              </button>
            </div>
          </div>

          <p className="text-zinc-300 text-xs leading-relaxed">
            {video.description}
          </p>

          {/* AI Live Recap Card */}
          {video.aiSummary && (
            <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Synthèse Automatique par le Copilote IA</span>
              </div>
              <p className="text-zinc-200 leading-relaxed">{video.aiSummary}</p>

              {video.aiKeyMoments && video.aiKeyMoments.length > 0 && (
                <div className="pt-2 border-t border-purple-500/20">
                  <span className="text-[11px] font-semibold text-purple-300">Moments forts du live :</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {video.aiKeyMoments.map((m, idx) => (
                      <span key={idx} className="bg-zinc-950/80 text-zinc-300 px-2 py-0.5 rounded font-mono text-[10px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata Footer */}
          <div className="flex items-center gap-4 text-zinc-500 pt-2 border-t border-zinc-800">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatSeconds(video.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {video.viewsCount} vues
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(video.recordedAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
