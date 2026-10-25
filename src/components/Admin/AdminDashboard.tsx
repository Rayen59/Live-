import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Users, 
  Radio, 
  Film, 
  AlertTriangle, 
  UserX, 
  UserCheck, 
  Trash2, 
  StopCircle, 
  Eye,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { User, LiveStream, RecordedVideo, ModerationLog } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminDashboardProps {
  currentUser: User;
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  allStreams: LiveStream[];
  setAllStreams: React.Dispatch<React.SetStateAction<LiveStream[]>>;
  allRecordings: RecordedVideo[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  allUsers,
  setAllUsers,
  allStreams,
  setAllStreams,
  allRecordings,
}) => {
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'streams' | 'recordings' | 'logs'>('users');
  const [modLogs, setModLogs] = useState<ModerationLog[]>(StorageService.getModLogs());
  const [unlockCode, setUnlockCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(currentUser.role === 'admin');
  const [lockError, setLockError] = useState<string | null>(null);

  if (!isUnlocked && currentUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Lock className="w-7 h-7 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Espace Administrateur Sécurisé</h2>
          <p className="text-xs text-zinc-400 mt-1">
            L'entrée automatique à cette section est désactivée. Veuillez entrer le code secret administrateur pour déverrouiller ce tableau de bord.
          </p>
        </div>
        {lockError && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs">
            {lockError}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (unlockCode.trim() === 'admin2026' || unlockCode.trim() === '1234') {
              setIsUnlocked(true);
            } else {
              setLockError('Code PIN administrateur incorrect.');
            }
          }}
          className="space-y-3"
        >
          <input
            type="password"
            value={unlockCode}
            onChange={(e) => setUnlockCode(e.target.value)}
            placeholder="Code PIN administrateur (admin2026)..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white text-xs text-center font-mono tracking-widest focus:outline-none"
          />
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow cursor-pointer transition"
          >
            Déverrouiller l'Administration
          </button>
        </form>
      </div>
    );
  }

  // Filter users by admin search query
  const filteredUsers = allUsers.filter((u) => {
    const q = adminSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // Filter streams by admin search query
  const filteredStreams = allStreams.filter((s) => {
    const q = adminSearchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.creatorName.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const handleToggleBanUser = (target: User) => {
    const updatedUser: User = { ...target, isBanned: !target.isBanned };
    StorageService.updateUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === target.id ? updatedUser : u)));

    const log: ModerationLog = {
      id: `admin_log_${Date.now()}`,
      action: updatedUser.isBanned ? 'ban' : 'unban',
      targetUserId: target.id,
      targetUsername: target.username,
      moderatorName: currentUser.name,
      reason: updatedUser.isBanned ? 'Bannissement administratif global' : 'Débannissement administratif',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    StorageService.addModLog(log);
    setModLogs((prev) => [log, ...prev]);
  };

  const handleChangeRole = (target: User, newRole: User['role']) => {
    const updated: User = { ...target, role: newRole };
    StorageService.updateUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)));
  };

  const handleTerminateStream = (streamId: string) => {
    if (!window.confirm('Voulez-vous vraiment couper d’autorité cette diffusion ?')) return;
    StorageService.deleteStream(streamId);
    setAllStreams((prev) => prev.filter((s) => s.id !== streamId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-zinc-100">
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border border-amber-500/30 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Console d’Administration & Supervision Globale
              </h1>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-extrabold uppercase">
                Admin Root
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Supervision des comptes à email unique, des streams actifs et de la modération IA.
            </p>
          </div>
        </div>

        {/* Dedicated Admin Search Box */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-amber-400 pointer-events-none" />
          <input
            type="text"
            value={adminSearchQuery}
            onChange={(e) => setAdminSearchQuery(e.target.value)}
            placeholder="Boîte de recherche Admin (Utilisateur, email, stream)..."
            className="w-full bg-zinc-950 border border-amber-500/40 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-blue-400" />
            Utilisateurs Inscrits
          </p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{allUsers.length}</p>
          <span className="text-[10px] text-emerald-400">Emails uniques vérifiés</span>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 flex items-center gap-1.5 font-medium">
            <Radio className="w-4 h-4 text-rose-500" />
            Lives en Cours
          </p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{allStreams.length}</p>
          <span className="text-[10px] text-rose-400">Diffusion WebRTC active</span>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 flex items-center gap-1.5 font-medium">
            <Film className="w-4 h-4 text-purple-400" />
            Replays Enregistrés
          </p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{allRecordings.length}</p>
          <span className="text-[10px] text-purple-300">VODs disponibles</span>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Actions de Modération
          </p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{modLogs.length}</p>
          <span className="text-[10px] text-amber-400">IA + modérateurs</span>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition ${
            activeAdminTab === 'users'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Gestion des Utilisateurs ({filteredUsers.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('streams')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition ${
            activeAdminTab === 'streams'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Supervision des Lives ({filteredStreams.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('logs')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition ${
            activeAdminTab === 'logs'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Journal d'Audit Global ({modLogs.length})
        </button>
      </div>

      {/* Admin Tab 1: User Management */}
      {activeAdminTab === 'users' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Utilisateur</th>
                  <th className="p-3.5">Email Unique</th>
                  <th className="p-3.5">Rôle</th>
                  <th className="p-3.5">Abonnés</th>
                  <th className="p-3.5">Statut</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/40 transition">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">@{u.username}</p>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-300">
                      {u.email}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value as any)}
                        className="bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-xs text-white"
                      >
                        <option value="creator">Créateur</option>
                        <option value="moderator">Modérateur</option>
                        <option value="viewer">Spectateur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-300">
                      {u.followersCount}
                    </td>
                    <td className="p-3.5">
                      {u.isBanned ? (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[10px] font-bold">
                          Banni
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleBanUser(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          u.isBanned
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-red-600/80 hover:bg-red-500 text-white'
                        }`}
                      >
                        {u.isBanned ? 'Débannir' : 'Bannir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Tab 2: Streams Supervision */}
      {activeAdminTab === 'streams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStreams.map((s) => (
            <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold uppercase">
                    {s.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Eye className="w-3.5 h-3.5 text-rose-400" />
                    <span>{s.viewerCount} spectateurs</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">{s.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{s.description}</p>
                <p className="text-[11px] text-zinc-500 mt-2 font-mono">Streamer : {s.creatorName}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Flux régulier
                </span>
                <button
                  onClick={() => handleTerminateStream(s.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Couper le stream</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Tab 3: Moderation Logs */}
      {activeAdminTab === 'logs' && (
        <div className="space-y-2">
          {modLogs.map((l) => (
            <div key={l.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold uppercase mr-2">
                  {l.action}
                </span>
                <span className="text-white font-medium">Cible : @{l.targetUsername}</span>
                <span className="text-zinc-400 ml-2">({l.reason})</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-500 font-mono text-[11px]">
                <span>Modérateur : {l.moderatorName}</span>
                <span>{l.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
