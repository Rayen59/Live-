import React, { useState } from 'react';
import { X, Video, Camera, Monitor, Film, Sparkles, Radio } from 'lucide-react';
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
  const [tagsInput, setTagsInput] = useState('Live, IA, Studio');
  const [initialSource, setInitialSource] = useState<VideoSourceType>('camera');

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
      tags: tags.length ? tags : ['Direct'],
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      isLive: true,
      startedAt: new Date().toISOString(),
      viewerCount: 1,
      activeSource: initialSource,
      activeBannerText: `🔴 BIENVENUE SUR LE DIRECT DE ${currentUser.name.toUpperCase()} · Micro ouvert`,
      lowerThirdTitle: title.trim(),
      lowerThirdSubtitle: `${currentUser.name} · ${category}`,
    };

    onCreateStream(newStream);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-zinc-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mb-3 shadow-inner">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Configurer & Démarrer un Live
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Lancez votre studio de diffusion avec filtres d'image, partage d'écran et micros spectateurs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Titre de la diffusion *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Masterclass Développement & IA en direct..."
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
                placeholder="Tech, Code, IA"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Source vidéo de départ
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInitialSource('camera')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  initialSource === 'camera'
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Camera className="w-4 h-4 text-rose-400" />
                <span>Caméra Web</span>
              </button>

              <button
                type="button"
                onClick={() => setInitialSource('screen')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
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
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  initialSource === 'media'
                    ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Film className="w-4 h-4 text-purple-400" />
                <span>Clip Galerie</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Description pour les spectateurs
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez ce que vous allez partager ou présenter..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl p-2.5 text-white placeholder:text-zinc-600 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-rose-950/50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <Video className="w-4 h-4" />
            <span>Ouvrir le Studio et Démarrer</span>
          </button>
        </form>
      </div>
    </div>
  );
};
