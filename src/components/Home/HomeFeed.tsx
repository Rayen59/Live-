import React, { useState } from 'react';
import { 
  Radio, 
  Eye, 
  Play, 
  Film, 
  Sparkles, 
  Users, 
  Monitor, 
  Mic, 
  Sliders, 
  Clock, 
  Search,
  Flame
} from 'lucide-react';
import { LiveStream, RecordedVideo, StreamCategory, User } from '../../types';

interface HomeFeedProps {
  streams: LiveStream[];
  recordings: RecordedVideo[];
  onSelectStream: (stream: LiveStream) => void;
  onPlayRecording: (video: RecordedVideo) => void;
  onOpenCreateLiveModal: () => void;
  onViewChannel: (creatorId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser: User;
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

export const HomeFeed: React.FC<HomeFeedProps> = ({
  streams,
  recordings,
  onSelectStream,
  onPlayRecording,
  onOpenCreateLiveModal,
  onViewChannel,
  searchQuery,
  setSearchQuery,
  currentUser,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'lives' | 'recordings'>('all');

  // Filter streams by category and search
  const filteredStreams = streams.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.creatorName.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Filter recordings by category and search
  const filteredRecordings = recordings.filter((r) => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.creatorName.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const featuredStream = streams[0];

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    return `${mins} min`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 text-zinc-100">
      {/* Hero Featured Live Banner (when no heavy search query is active) */}
      {!searchQuery && featuredStream && (
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl group">
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden">
            <img
              src={featuredStream.thumbnail}
              alt={featuredStream.title}
              className="w-full h-full object-cover group-hover:scale-102 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
          </div>

          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end max-w-2xl">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-lg">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>EN DIRECT MAINTENANT</span>
              </span>
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-zinc-200 text-xs font-mono rounded-lg border border-white/10 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-rose-400" />
                <span>{featuredStream.viewerCount} spectateurs</span>
              </span>
              <span className="px-2.5 py-1 bg-zinc-900/90 text-rose-400 text-xs font-bold uppercase rounded-lg">
                {featuredStream.category}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-2">
              {featuredStream.title}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
              {featuredStream.description}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectStream(featuredStream)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xl shadow-rose-950/50 transition cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Rejoindre le Live</span>
              </button>

              <button
                onClick={() => onViewChannel(featuredStream.creatorId)}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-700/80 transition cursor-pointer"
              >
                <img
                  src={featuredStream.creatorAvatar}
                  alt={featuredStream.creatorName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>@{featuredStream.creatorName}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories & Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Explorer les Diffusions & Replays
            </h2>
          </div>

          {/* Tab selector */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setActiveTab('lives')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'lives' ? 'bg-rose-500/20 text-rose-300 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>En direct ({streams.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('recordings')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'recordings' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>Replays enregistrés ({recordings.length})</span>
            </button>
          </div>
        </div>

        {/* Horizontal Category Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl font-medium shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-rose-600 text-white font-bold shadow-md'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            Toutes les catégories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white font-bold shadow-md'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Search Results Indicator */}
      {searchQuery && (
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-300">
          <span>
            Résultats filtrés pour : <strong className="text-white font-semibold">"{searchQuery}"</strong> ({filteredStreams.length} lives, {filteredRecordings.length} replays)
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-rose-400 font-semibold hover:underline"
          >
            Effacer la recherche
          </button>
        </div>
      )}

      {/* SECTION 1: LIVE STREAMS */}
      {(activeTab === 'all' || activeTab === 'lives') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-live-pulse" />
              <span>Diffusions en direct ({filteredStreams.length})</span>
            </h3>
          </div>

          {filteredStreams.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white">Plateforme vierge · Aucun direct en cours</h4>
              <p className="max-w-md mx-auto text-zinc-400">
                Vous êtes connecté ! Démarrez la première diffusion en direct avec votre webcam, partage d’écran et régie IA.
              </p>
              <button
                onClick={onOpenCreateLiveModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Lancer mon premier Live</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStreams.map((st) => (
                <div
                  key={st.id}
                  className="group bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 rounded-2xl overflow-hidden transition flex flex-col justify-between shadow-lg hover:shadow-rose-950/20"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => onSelectStream(st)}>
                      <img
                        src={st.thumbnail}
                        alt={st.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Live Badge */}
                      <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow">
                        DIRECT
                      </span>

                      {/* Viewers */}
                      <span className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white font-mono text-[11px] px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
                        <Eye className="w-3 h-3 text-rose-400" />
                        <span>{st.viewerCount}</span>
                      </span>

                      {/* Category */}
                      <span className="absolute bottom-2.5 right-2.5 bg-zinc-900/90 text-rose-300 font-semibold text-[10px] px-2 py-0.5 rounded">
                        {st.category}
                      </span>
                    </div>

                    {/* Stream Content */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={st.creatorAvatar}
                          alt={st.creatorName}
                          onClick={() => onViewChannel(st.creatorId)}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 cursor-pointer ring-1 ring-zinc-700 hover:ring-rose-500 transition"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 
                            onClick={() => onSelectStream(st)}
                            className="text-sm font-bold text-white line-clamp-2 group-hover:text-rose-400 transition cursor-pointer"
                          >
                            {st.title}
                          </h4>
                          <p 
                            onClick={() => onViewChannel(st.creatorId)}
                            className="text-xs text-zinc-400 mt-1 cursor-pointer hover:underline"
                          >
                            @{st.creatorName}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        {st.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => onSelectStream(st)}
                      className="w-full py-2 bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Entrer dans le live</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: RECORDED SESSIONS / REPLAYS */}
      {(activeTab === 'all' || activeTab === 'recordings') && (
        <div className="space-y-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              <span>Sessions Enregistrées & Replays VOD ({filteredRecordings.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecordings.map((rec) => (
              <div
                key={rec.id}
                className="group bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 rounded-2xl overflow-hidden transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => onPlayRecording(rec)}>
                    <img
                      src={rec.thumbnail}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    <span className="absolute bottom-2.5 right-2.5 bg-black/80 font-mono text-white text-[11px] px-2 py-0.5 rounded">
                      {formatSeconds(rec.duration)}
                    </span>

                    <span className="absolute top-2.5 left-2.5 bg-purple-600/90 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                      REPLAY
                    </span>
                  </div>

                  <div className="p-4">
                    <h4 
                      onClick={() => onPlayRecording(rec)}
                      className="text-sm font-bold text-white line-clamp-1 group-hover:text-purple-400 transition cursor-pointer"
                    >
                      {rec.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                      {rec.description}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Par @{rec.creatorName}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {rec.viewsCount} vues
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => onPlayRecording(rec)}
                    className="w-full py-2 bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Visionner l'enregistrement</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
