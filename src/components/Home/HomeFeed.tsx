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
  Flame,
  Gem,
  Tv,
  ArrowRight
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 text-slate-100">
      {/* Page Header (identical to Screenshot 1) */}
      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-400 tracking-wider">
          Accueil
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          <span className="text-[#38bdf8]">Bienvenue,</span>{' '}
          <span className="text-white">{currentUser.name} !</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Accédez en un clin d'œil à vos informations essentielles et à votre activité à venir sur votre Tableau de bord !
        </p>
      </div>

      {/* Main Diamond Hero Card (reproducing the visual layout & style of Screenshot 1) */}
      <div className="relative rounded-3xl overflow-hidden border border-[#1a3f77] bg-gradient-to-b from-[#0c244b] to-[#071731] shadow-2xl p-6 sm:p-10">
        {/* Subtle ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284c7]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#38bdf8]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Central Faceted Diamond Graphic Motif (pure vector design like in Screenshot 1) */}
        <div className="relative mx-auto max-w-xs sm:max-w-sm aspect-[1.1/1] mb-6 flex items-center justify-center">
          {/* Glowing back circle */}
          <div className="absolute w-48 sm:w-60 h-48 sm:h-60 rounded-full bg-[#102d5a]/70 border border-[#1d4c8f]/40 shadow-inner flex items-center justify-center animate-pulse" />

          {/* Faceted Diamond SVG */}
          <svg
            className="w-40 sm:w-52 h-40 sm:h-52 z-10 drop-shadow-[0_15px_35px_rgba(2,132,199,0.35)]"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top flat facet */}
            <polygon points="65,45 135,45 170,80 30,80" fill="#38bdf8" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1.5" />
            {/* Top center triangle */}
            <polygon points="65,45 135,45 100,80" fill="#60a5fa" fillOpacity="0.5" stroke="#93c5fd" strokeWidth="1.5" />
            {/* Lower center diamond */}
            <polygon points="100,80 170,80 100,165" fill="#1d4ed8" fillOpacity="0.6" stroke="#3b82f6" strokeWidth="1.5" />
            <polygon points="100,80 30,80 100,165" fill="#2563eb" fillOpacity="0.75" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Lower side facets */}
            <polygon points="30,80 100,80 100,165" fill="#1e40af" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="1.2" />
            <polygon points="170,80 100,80 100,165" fill="#1e3a8a" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="1.2" />
          </svg>

          {/* 4-Point Sparkle Stars (identical to screenshot positioning) */}
          <div className="absolute top-6 left-12 text-[#93c5fd] animate-pulse">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="absolute top-4 right-16 text-[#bfdbfe] animate-pulse delay-200">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div className="absolute bottom-10 left-10 text-[#60a5fa] animate-pulse delay-500">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="absolute bottom-8 right-12 text-[#93c5fd] animate-pulse delay-300">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Card Content & Text */}
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Séances en direct & Studio
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
            {featuredStream ? `En direct : "${featuredStream.title}"` : 'Plateforme de streaming & régie interactive'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xl">
            {featuredStream
              ? featuredStream.description
              : "Diffusez en haute définition, activez les filtres de clarté en direct, invitez des intervenants au micro et contrôlez vos publicités en toute simplicité."}
          </p>

          {/* Dual Action Buttons (like Screenshot 1) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {featuredStream ? (
              <button
                onClick={() => onSelectStream(featuredStream)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-950/60 transition cursor-pointer active:scale-95 border border-[#38bdf8]/30"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Rejoindre le direct</span>
              </button>
            ) : (
              <button
                onClick={onOpenCreateLiveModal}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-950/60 transition cursor-pointer active:scale-95 border border-[#38bdf8]/30"
              >
                <Radio className="w-4 h-4" />
                <span>Découvrir nos offres & Démarrer</span>
              </button>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('streams-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0a1e3e] hover:bg-[#0f2c58] text-[#38bdf8] font-bold text-xs sm:text-sm rounded-xl border border-[#0284c7]/40 transition cursor-pointer"
            >
              <span>Explorer les cours & diffusions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div id="streams-section" className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Explorer les Séances & Replays
            </h2>
          </div>

          {/* Tab selector */}
          <div className="flex items-center gap-1 p-1 bg-[#0b1c38] border border-[#163668] rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'all' ? 'bg-[#163668] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setActiveTab('lives')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'lives' ? 'bg-[#0284c7] text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>En direct ({streams.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('recordings')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'recordings' ? 'bg-[#163668] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Replays ({recordings.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pills (Deep Navy Styled) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl font-medium shrink-0 transition ${
              selectedCategory === 'all'
                ? 'bg-[#0284c7] text-white font-bold shadow-md shadow-sky-950/40 border border-[#38bdf8]/40'
                : 'bg-[#0b1c38] border border-[#163668] text-slate-300 hover:text-white hover:border-[#1d437d]'
            }`}
          >
            Toutes les matières
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
                selectedCategory === cat
                  ? 'bg-[#0284c7] text-white font-bold shadow-md shadow-sky-950/40 border border-[#38bdf8]/40'
                  : 'bg-[#0b1c38] border border-[#163668] text-slate-300 hover:text-white hover:border-[#1d437d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: LIVE STREAMS */}
      {(activeTab === 'all' || activeTab === 'lives') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping" />
              <span>Diffusions en direct disponibles ({filteredStreams.length})</span>
            </h3>
          </div>

          {filteredStreams.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-[#081a38] border border-[#163668] text-slate-300 text-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0ea5e9]/10 text-[#38bdf8] border border-[#0ea5e9]/20 flex items-center justify-center mx-auto">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white">Aucune séance en direct pour le moment</h4>
              <p className="max-w-md mx-auto text-slate-400">
                Démarrez une nouvelle session avec caméra, partage d'écran, filtres de clarté et contrôle IA.
              </p>
              <button
                onClick={onOpenCreateLiveModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl shadow-lg transition cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Lancer un nouveau direct</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStreams.map((st) => (
                <div
                  key={st.id}
                  className="group bg-[#091b38] border border-[#14315d] hover:border-[#38bdf8]/60 rounded-2xl overflow-hidden transition flex flex-col justify-between shadow-xl hover:shadow-sky-950/30"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-[#07152b] overflow-hidden cursor-pointer" onClick={() => onSelectStream(st)}>
                      <img
                        src={st.thumbnail}
                        alt={st.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-12 h-12 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xl hover:scale-110 transition">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Live Badge */}
                      <span className="absolute top-2.5 left-2.5 bg-[#0284c7] text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider shadow border border-[#38bdf8]/40">
                        DIRECT
                      </span>

                      {/* Viewers */}
                      <span className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white font-mono text-[11px] px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
                        <Eye className="w-3 h-3 text-[#38bdf8]" />
                        <span>{st.viewerCount}</span>
                      </span>

                      {/* Category */}
                      <span className="absolute bottom-2.5 right-2.5 bg-[#0a1e3e]/90 text-[#38bdf8] font-bold text-[10px] px-2 py-0.5 rounded border border-[#193a6b]">
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
                          className="w-10 h-10 rounded-xl object-cover shrink-0 cursor-pointer ring-2 ring-[#0ea5e9]/50 hover:ring-[#38bdf8] transition"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 
                            onClick={() => onSelectStream(st)}
                            className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#38bdf8] transition cursor-pointer"
                          >
                            {st.title}
                          </h4>
                          <p 
                            onClick={() => onViewChannel(st.creatorId)}
                            className="text-xs text-slate-400 mt-1 cursor-pointer hover:underline"
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
                            className="text-[10px] text-slate-300 bg-[#071731] border border-[#132c54] px-2 py-0.5 rounded font-mono"
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
                      className="w-full py-2 bg-[#0e274e] hover:bg-[#0284c7] text-[#38bdf8] hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border border-[#183a6b] hover:border-[#38bdf8]"
                    >
                      <span>Rejoindre la séance</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
        <div className="space-y-4 pt-4 border-t border-[#132c54]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-[#38bdf8]" />
              <span>Séances enregistrées & Replays ({filteredRecordings.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecordings.map((rec) => (
              <div
                key={rec.id}
                className="group bg-[#091b38] border border-[#14315d] hover:border-[#38bdf8]/60 rounded-2xl overflow-hidden transition flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="relative aspect-video bg-[#07152b] overflow-hidden cursor-pointer" onClick={() => onPlayRecording(rec)}>
                    <img
                      src={rec.thumbnail}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="w-12 h-12 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xl hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    <span className="absolute bottom-2.5 right-2.5 bg-black/80 font-mono text-white text-[11px] px-2 py-0.5 rounded border border-white/10">
                      {formatSeconds(rec.duration)}
                    </span>

                    <span className="absolute top-2.5 left-2.5 bg-[#0284c7] text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase border border-[#38bdf8]/40">
                      REPLAY
                    </span>
                  </div>

                  <div className="p-4">
                    <h4 
                      onClick={() => onPlayRecording(rec)}
                      className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#38bdf8] transition cursor-pointer"
                    >
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {rec.description}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Par @{rec.creatorName}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-[#38bdf8]" />
                        {rec.viewsCount} vues
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => onPlayRecording(rec)}
                    className="w-full py-2 bg-[#0e274e] hover:bg-[#0284c7] text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border border-[#183a6b]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-[#38bdf8]" />
                    <span>Visionner le replay</span>
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
