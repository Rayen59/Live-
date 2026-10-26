import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Radio, 
  Film, 
  User as UserIcon, 
  Sparkles, 
  Eye, 
  Clock, 
  ArrowLeft, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  TrendingUp,
  Tag
} from 'lucide-react';
import { LiveStream, RecordedVideo, User, StreamCategory } from '../../types';

interface SearchPageProps {
  initialQuery?: string;
  streams: LiveStream[];
  recordings: RecordedVideo[];
  users: User[];
  onSelectStream: (stream: LiveStream) => void;
  onPlayRecording: (recording: RecordedVideo) => void;
  onViewChannel: (userId: string) => void;
  onBackToFeed: () => void;
}

type FilterType = 'all' | 'live' | 'recordings' | 'channels';

const POPULAR_TOPICS = [
  'Direct smartphone',
  'Tech & Dev',
  'Gaming',
  'Sponsoring & Pub',
  'Musique live',
  'Talk Show',
  'Business',
  'Créatif & Art'
];

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  streams,
  recordings,
  users,
  onSelectStream,
  onPlayRecording,
  onViewChannel,
  onBackToFeed,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtered live streams
  const matchedStreams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return streams.filter((s) => {
      if (!s.isLive) return false;
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.creatorName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    });
  }, [streams, query, selectedCategory]);

  // Filtered recorded videos
  const matchedRecordings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recordings.filter((r) => {
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.creatorName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.tags && r.tags.some((t) => t.toLowerCase().includes(q))) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    });
  }, [recordings, query, selectedCategory]);

  // Filtered channels
  const matchedUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && activeFilter !== 'channels') return [];
    return users.filter((u) => {
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q))
      );
    });
  }, [users, query, activeFilter]);

  const totalResultsCount =
    (activeFilter === 'all' || activeFilter === 'live' ? matchedStreams.length : 0) +
    (activeFilter === 'all' || activeFilter === 'recordings' ? matchedRecordings.length : 0) +
    (activeFilter === 'all' || activeFilter === 'channels' ? matchedUsers.length : 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in duration-200">
      {/* Top Bar with Back Button and Isolated Search Box (YouTube Style) */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBackToFeed}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
            title="Retour à l'accueil"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Search className="w-4 h-4 text-rose-500" />
              <span>Recherche StreamPulse</span>
            </h1>
            <p className="text-xs text-zinc-400">
              Trouvez des directs en cours, replays archivés et créateurs de contenu
            </p>
          </div>
        </div>

        {/* Large Isolated Search Input */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre, créateur, mot-clé, thème..."
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-rose-500 rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-xl transition"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                title="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Trending / Suggestion Quick Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-rose-400" />
            Tendances :
          </span>
          {POPULAR_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setQuery(topic)}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer text-xs ${
                query === topic
                  ? 'bg-rose-600 text-white font-medium'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Filter Navigation Tabs (Tous, En direct, Replays, Chaînes) */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-rose-600 text-white font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tous ({matchedStreams.length + matchedRecordings.length + matchedUsers.length})
            </button>
            <button
              onClick={() => setActiveFilter('live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'live'
                  ? 'bg-rose-600 text-white font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>En direct ({matchedStreams.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('recordings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'recordings'
                  ? 'bg-rose-600 text-white font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-blue-400" />
              <span>Replays & Vidéos ({matchedRecordings.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('channels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'channels'
                  ? 'bg-rose-600 text-white font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chaînes ({matchedUsers.length})</span>
            </button>
          </div>

          {/* Category Filter Dropdown */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline">Catégorie :</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="all">Toutes les catégories</option>
              <option value="Tech & Dev">Tech & Dev</option>
              <option value="Gaming">Gaming</option>
              <option value="Musique">Musique</option>
              <option value="Éducation">Éducation</option>
              <option value="Talk Show">Talk Show</option>
              <option value="Business">Business</option>
              <option value="Créatif & Art">Créatif & Art</option>
              <option value="Divertissement">Divertissement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Content Area */}
      {totalResultsCount === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-10 text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Aucun résultat trouvé</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            {query ? `Aucun contenu ne correspond à "${query}".` : 'Essayez un mot-clé ou sélectionnez une catégorie.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
                setActiveFilter('all');
              }}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-xl transition cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. MATCHED CHANNELS SECTION (if all or channels) */}
          {(activeFilter === 'all' || activeFilter === 'channels') && matchedUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Chaînes & Créateurs
                </h2>
                <span className="text-xs text-zinc-500">({matchedUsers.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matchedUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => onViewChannel(u.id)}
                    className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer group transition"
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-rose-500 transition shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition">
                          {u.name}
                        </span>
                        {u.role === 'admin' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded uppercase font-bold">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">@{u.username}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {u.followersCount} abonnés
                      </p>
                    </div>
                    <button className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 rounded-lg shrink-0 transition">
                      Voir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. MATCHED LIVE STREAMS SECTION (YouTube Live Style) */}
          {(activeFilter === 'all' || activeFilter === 'live') && matchedStreams.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Diffusions en Direct
                </h2>
                <span className="text-xs text-zinc-500">({matchedStreams.length})</span>
              </div>

              <div className="space-y-3">
                {matchedStreams.map((stream) => (
                  <div
                    key={stream.id}
                    onClick={() => onSelectStream(stream)}
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-rose-500/40 rounded-2xl p-3.5 flex flex-col sm:flex-row gap-4 cursor-pointer group transition hover:shadow-xl hover:shadow-rose-950/20"
                  >
                    {/* Thumbnail */}
                    <div className="relative sm:w-64 aspect-video rounded-xl overflow-hidden bg-zinc-950 shrink-0">
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow">
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>DIRECT</span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                        <Eye className="w-3 h-3 text-rose-400" />
                        <span>{stream.viewerCount}</span>
                      </div>
                      {stream.aspectRatio === '9:16' && (
                        <div className="absolute top-2 right-2 bg-purple-900/90 text-purple-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          📱 Mobile
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-rose-400 border border-zinc-700">
                            {stream.category}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-400 transition leading-snug line-clamp-2">
                          {stream.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {stream.description || 'Session interactive en direct avec micro et chat en temps réel.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-zinc-800/60">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={stream.creatorAvatar}
                            alt={stream.creatorName}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <span className="text-xs text-zinc-300 font-medium truncate">
                            {stream.creatorName}
                          </span>
                        </div>
                        <button className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow transition shrink-0">
                          Rejoindre le Live
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. MATCHED RECORDED VIDEOS SECTION (YouTube Video Search Style) */}
          {(activeFilter === 'all' || activeFilter === 'recordings') && matchedRecordings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Film className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Replays & Vidéos Enregistrées
                </h2>
                <span className="text-xs text-zinc-500">({matchedRecordings.length})</span>
              </div>

              <div className="space-y-3">
                {matchedRecordings.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => onPlayRecording(video)}
                    className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 flex flex-col sm:flex-row gap-4 cursor-pointer group transition hover:shadow-xl"
                  >
                    {/* Thumbnail */}
                    <div className="relative sm:w-64 aspect-video rounded-xl overflow-hidden bg-zinc-950 shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </div>
                      <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        REPLAY
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {video.category}
                          </span>
                          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(video.recordedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition leading-snug line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {video.description || 'Enregistrement complet de la diffusion en direct avec micro et synthèse.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-zinc-800/60">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={video.creatorAvatar}
                            alt={video.creatorName}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <span className="text-xs text-zinc-300 font-medium truncate">
                            {video.creatorName}
                          </span>
                          <span className="text-xs text-zinc-500">· {video.viewsCount} vues</span>
                        </div>
                        <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-lg transition shrink-0">
                          Visionner
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
