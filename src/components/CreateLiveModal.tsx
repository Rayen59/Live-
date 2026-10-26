import React, { useState, useEffect } from 'react';
import { X, Video, Camera, Monitor, Film, Sparkles, Radio, Smartphone, ScreenShare } from 'lucide-react';
import { StreamCategory, VideoSourceType, LiveStream, User } from '../types';

interface CreateLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreateStream: (newStream: LiveStream) => void;
}

const CATEGORIES: StreamCategory[] = [
  'Tech & Dev',
  'Gaming',
  'Musique',
  'Éducation',
  'Talk Show',
  'Business',
  'Créatif & Art',
  'Divertissement',
];

export const CreateLiveModal: React.FC<CreateLiveModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateStream,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<StreamCategory>('Tech & Dev');
  const [tagsInput, setTagsInput] = useState('Live, Mobile, Direct');
  const [initialSource, setInitialSource] = useState<VideoSourceType>('camera');
  
  // Mobile livestream orientation and camera facing selection
  const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>(isMobileDevice ? '9:16' : '16:9');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [sponsorVideo, setSponsorVideo] = useState<{ name: string; url: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isMobileDevice) {
        setAspectRatio('9:16');
      }
    }
  }, [isOpen, isMobileDevice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newStream: LiveStream = {
      id: `stream_${Date.now()}`,
      creatorId: currentUser.id,
      creatorName: currentUser.username,
      creatorAvatar: currentUser.avatar,
      title: title.trim(),
      description: description.trim() || 'Session en direct interactive.',
      category,
      tags: tags.length ? tags : ['Direct', 'Live'],
      thumbnail: aspectRatio === '9:16'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      isLive: true,
      startedAt: new Date().toISOString(),
      viewerCount: 1,
      activeSource: initialSource,
      aspectRatio,
      cameraFacingMode: facingMode,
      activeBannerText: `🔴 DIRECT DE ${currentUser.name.toUpperCase()} · Diffusion en direct`,
      lowerThirdTitle: title.trim(),
      lowerThirdSubtitle: `${currentUser.name} · ${category}`,
      sponsorVideoUrl: sponsorVideo?.url,
      sponsorVideoTitle: sponsorVideo?.name,
      isTickerActive: true,
      tickerSpeed: 'normal',
    };

    if (sponsorVideo) {
      // Also register this sponsor video into Media assets for the studio
      const sponsorAsset = {
        id: `sponsor_${Date.now()}`,
        name: sponsorVideo.name,
        type: 'video' as const,
        url: sponsorVideo.url,
        duration: 20,
        isAd: true,
      };
      // StorageService.addMediaAsset
      try {
        const existing = JSON.parse(localStorage.getItem('streampulse_media_assets') || '[]');
        localStorage.setItem('streampulse_media_assets', JSON.stringify([sponsorAsset, ...existing]));
      } catch (err) {
        console.error(err);
      }
    }

    onCreateStream(newStream);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-zinc-100 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mb-2.5 shadow-inner">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Lancer un Live {aspectRatio === '9:16' ? 'Mobile' : 'Studio'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Compatible téléphone portable (caméra avant/arrière) et ordinateur.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Format selection: Mobile Vertical vs Desktop 16:9 */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1.5">
              Format de diffusion
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">📱 Format Téléphone (9:16)</p>
                  <p className="text-[10px] text-zinc-400">Vertical TikTok/Insta Live</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">💻 Format Paysage (16:9)</p>
                  <p className="text-[10px] text-zinc-400">Standard PC & Régie</p>
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Titre de la diffusion *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Direct depuis mon smartphone, échange live..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StreamCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Mobile, Direct, Discussion"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Video Source and Camera Facing Mode */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Source vidéo initiale
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInitialSource('camera')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  initialSource === 'camera'
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Camera className="w-4 h-4 text-rose-400" />
                <span>Caméra Direct</span>
              </button>

              <button
                type="button"
                onClick={() => setInitialSource('screen')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  initialSource === 'screen'
                    ? 'bg-blue-500/20 border-blue-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Monitor className="w-4 h-4 text-blue-400" />
                <span>Partage d'écran</span>
              </button>

              <button
                type="button"
                onClick={() => setInitialSource('media')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                  initialSource === 'media'
                    ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Film className="w-4 h-4 text-purple-400" />
                <span>Clip / Médias</span>
              </button>
            </div>

            {/* If camera is selected: Option for Front vs Back Camera */}
            {initialSource === 'camera' && (
              <div className="mt-2.5 p-2 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                <span className="text-[11px] text-zinc-300 font-medium">Caméra de démarrage :</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFacingMode('user')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      facingMode === 'user'
                        ? 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    🤳 Avant (Selfie)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFacingMode('environment')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      facingMode === 'environment'
                        ? 'bg-rose-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    📸 Arrière (Vue)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sponsor / Marketing Video from Gallery Before Live */}
          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-zinc-200">
                  Vidéo Marketing / Sponsoring (Galerie)
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Optionnel</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">
              Sélectionnez une vidéo de votre téléphone/PC à diffuser avant ou pendant le live (retour direct à la caméra garanti).
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="file"
                id="gallery-sponsor-input"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setSponsorVideo({
                      name: file.name,
                      url: url,
                    });
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById('gallery-sponsor-input')?.click()}
                className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Film className="w-3.5 h-3.5 text-rose-400" />
                <span>{sponsorVideo ? 'Changer la vidéo galerie' : 'Choisir dans ma galerie'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSponsorVideo({
                    name: 'Clip Sponsoring Partenaire (Demo 15s)',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                  });
                }}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 text-xs font-medium transition cursor-pointer"
              >
                Clip Démo Sponsor
              </button>
            </div>

            {sponsorVideo && (
              <div className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate font-semibold">{sponsorVideo.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSponsorVideo(null)}
                  className="text-zinc-400 hover:text-white ml-2 text-[11px] font-bold shrink-0"
                >
                  Retirer
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Description pour les spectateurs
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez brièvement le sujet de votre direct..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-rose-950/40 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <Video className="w-4 h-4" />
            <span>Démarrer la diffusion en direct</span>
          </button>
        </form>
      </div>
    </div>
  );
};
