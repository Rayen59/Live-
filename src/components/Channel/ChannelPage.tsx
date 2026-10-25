import React, { useState } from 'react';
import { 
  Film, 
  User as UserIcon, 
  Calendar, 
  Eye, 
  Clock, 
  Download, 
  Play, 
  Sparkles, 
  Share2, 
  Edit3, 
  Trash2, 
  Radio
} from 'lucide-react';
import { User, RecordedVideo } from '../../types';
import { StorageService } from '../../services/storage';

interface ChannelPageProps {
  user: User;
  currentUser: User;
  recordings: RecordedVideo[];
  onPlayRecording: (video: RecordedVideo) => void;
  onDeleteRecording: (id: string) => void;
  onStartLive: () => void;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({
  user,
  currentUser,
  recordings,
  onPlayRecording,
  onDeleteRecording,
  onStartLive,
}) => {
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user.bio || '');

  const userRecordings = recordings.filter((r) => r.creatorId === user.id);
  const isOwner = currentUser.id === user.id;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins} min ${remainingSecs > 0 ? `${remainingSecs}s` : ''}`;
  };

  const handleSaveBio = () => {
    user.bio = bioText;
    StorageService.updateUser(user);
    setIsEditingBio(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Channel Header Banner */}
      <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
        <img
          src={user.channelBanner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'}
          alt="Bannière de chaîne"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>

      {/* Profile Bar */}
      <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-zinc-950 shadow-2xl bg-zinc-900"
          />
          <div className="mb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md text-[10px] font-bold uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">@{user.username} · {user.email}</p>
            <div className="flex items-center gap-4 text-xs text-zinc-300 mt-2">
              <span><strong>{user.followersCount.toLocaleString()}</strong> abonnés</span>
              <span><strong>{userRecordings.length}</strong> sessions enregistrées</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={onStartLive}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-950/50 transition cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Démarrer un Direct</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'videos'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Vidéos & Sessions Enregistrées ({userRecordings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
            activeTab === 'about'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>À Propos & Statistiques</span>
        </button>
      </div>

      {/* Tab 1: Recorded Sessions / Replays */}
      {activeTab === 'videos' && (
        <div>
          {userRecordings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                Aucune session enregistrée pour le moment
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mb-4">
                Lors de vos diffusions en direct, cliquez sur "Enregistrer la session" dans le studio pour sauvegarder automatiquement vos vidéos ici.
              </p>
              {isOwner && (
                <button
                  onClick={onStartLive}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Lancer mon premier Live
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRecordings.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition group flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                      <img
                        src={rec.thumbnail}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onPlayRecording(rec)}
                          className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition cursor-pointer"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                      </div>

                      {/* Duration badge */}
                      <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white">
                        {formatSeconds(rec.duration)}
                      </span>

                      <span className="absolute top-2 left-2 bg-zinc-900/90 text-rose-400 font-semibold text-[10px] px-2 py-0.5 rounded uppercase">
                        {rec.category}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-rose-400 transition">
                        {rec.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                        {rec.description}
                      </p>

                      {/* AI Summary snippet if available */}
                      {rec.aiSummary && (
                        <div className="mt-2.5 p-2 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-[11px] text-zinc-300 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <p className="line-clamp-2">{rec.aiSummary}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="p-4 pt-0 border-t border-zinc-800/80 mt-2 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{rec.viewsCount} vues</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rec.videoUrl && (
                        <a
                          href={rec.videoUrl}
                          download={`${rec.title}.mp4`}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                          title="Télécharger la vidéo"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      {isOwner && (
                        <button
                          onClick={() => onDeleteRecording(rec.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition"
                          title="Supprimer la vidéo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: About & Stats */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Présentation de la chaîne</h3>
              {isOwner && !isEditingBio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="flex items-center gap-1 text-rose-400 hover:underline"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
              )}
            </div>

            {isEditingBio ? (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBio}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-zinc-300 leading-relaxed">
                {user.bio || 'Aucune description rédigée pour cette chaîne.'}
              </p>
            )}
          </div>

          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white">Détails du compte</h3>
            <div className="space-y-2 text-zinc-400">
              <div className="flex justify-between">
                <span>Inscrit le :</span>
                <span className="text-zinc-200">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Statut email :</span>
                <span className="text-emerald-400 font-semibold">Vérifié & Unique ✓</span>
              </div>
              <div className="flex justify-between">
                <span>Total heures de live :</span>
                <span className="text-zinc-200 font-mono">14h 30m</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
