import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  UserX, 
  Clock, 
  Trash2, 
  Sliders, 
  CheckCircle, 
  Users, 
  FileText, 
  AlertOctagon,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { User, LiveStream, ModerationLog } from '../../types';
import { StorageService } from '../../services/storage';

interface ModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: LiveStream;
  onUpdateStream: (updated: Partial<LiveStream>) => void;
  currentUser: User;
  allUsers: User[];
  onBanUser: (targetUserId: string, reason: string) => void;
}

export const ModerationModal: React.FC<ModerationModalProps> = ({
  isOpen,
  onClose,
  stream,
  onUpdateStream,
  currentUser,
  allUsers,
  onBanUser,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'logs'>('settings');
  const [banReason, setBanReason] = useState('Non-respect des règles de la communauté');
  const [selectedUserToBan, setSelectedUserToBan] = useState<string>('');
  const [slowModeSec, setSlowModeSec] = useState(stream.slowModeSeconds || 5);
  const [isSlowMode, setIsSlowMode] = useState(!!stream.isSlowMode);
  const [isSubOnly, setIsSubOnly] = useState(!!stream.isSubOnly);
  const [logs, setLogs] = useState<ModerationLog[]>(StorageService.getModLogs());

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    onUpdateStream({
      isSlowMode,
      slowModeSeconds: slowModeSec,
      isSubOnly,
    });
    alert('Paramètres de modération mis à jour avec succès !');
  };

  const handleExecuteBan = (userId: string, username: string) => {
    if (!window.confirm(`Confirmez-vous le bannissement définitif de @${username} ?`)) return;

    onBanUser(userId, banReason);
    const newLog: ModerationLog = {
      id: `log_${Date.now()}`,
      action: 'ban',
      targetUserId: userId,
      targetUsername: username,
      moderatorName: currentUser.name,
      reason: banReason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    StorageService.addModLog(newLog);
    setLogs((prev) => [newLog, ...prev]);
    setSelectedUserToBan('');
  };

  const handleTimeout = (username: string, durationMinutes: number) => {
    const newLog: ModerationLog = {
      id: `log_${Date.now()}`,
      action: 'timeout',
      targetUsername: username,
      moderatorName: currentUser.name,
      reason: `Exclusion temporaire de ${durationMinutes} minutes`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    StorageService.addModLog(newLog);
    setLogs((prev) => [newLog, ...prev]);
    alert(`Utilisateur @${username} mis en silence pour ${durationMinutes} minutes.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-zinc-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Centre de Modération Avancée</h2>
              <p className="text-xs text-zinc-400">Garantir un flux en direct sécurisé, courtois et fluide</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 my-4 border-b border-zinc-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Règles du Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Bannissements & Silences</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Journal d'audit ({logs.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Slow Mode */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Mode Lent (Slow Mode)</span>
                    </h4>
                    <p className="text-zinc-400 text-[11px]">
                      Empêche les messages répétés trop rapidement en imposant un délai d’attente.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSlowMode}
                    onChange={(e) => setIsSlowMode(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 cursor-pointer"
                  />
                </div>

                {isSlowMode && (
                  <div className="pt-2 border-t border-zinc-800 flex items-center gap-3">
                    <span className="text-zinc-300">Délai d'intervalle :</span>
                    {[3, 5, 10, 30, 60].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setSlowModeSec(sec)}
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                          slowModeSec === sec
                            ? 'bg-rose-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub-only chat */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>Chat Réservé aux Abonnés</span>
                  </h4>
                  <p className="text-zinc-400 text-[11px]">
                    Seuls les membres abonnés à votre chaîne peuvent envoyer des messages.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isSubOnly}
                  onChange={(e) => setIsSubOnly(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition shadow cursor-pointer text-xs"
              >
                Appliquer les réglages au direct
              </button>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-red-400" />
                  <span>Bannir un utilisateur de ce stream</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedUserToBan}
                    onChange={(e) => setSelectedUserToBan(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-white"
                  >
                    <option value="">Sélectionner un spectateur...</option>
                    {allUsers.filter((u) => u.id !== currentUser.id).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (@{u.username})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Motif du bannissement..."
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <button
                  disabled={!selectedUserToBan}
                  onClick={() => {
                    const u = allUsers.find((x) => x.id === selectedUserToBan);
                    if (u) handleExecuteBan(u.id, u.username);
                  }}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold rounded-xl transition cursor-pointer"
                >
                  Confirmer le bannissement
                </button>
              </div>

              {/* Quick Roster Actions */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Actions Rapides par Membre
                </h4>
                <div className="space-y-2">
                  {allUsers.slice(0, 5).map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-[10px] text-zinc-500">@{u.username} · {u.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleTimeout(u.username, 5)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-amber-950/40 text-amber-300 rounded text-[11px] transition"
                        >
                          Silence 5m
                        </button>
                        <button
                          onClick={() => handleExecuteBan(u.id, u.username)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-red-950/40 text-red-400 rounded text-[11px] transition"
                        >
                          Bannir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <p className="text-center text-zinc-500 py-8">
                  Aucune intervention de modération enregistrée pour le moment.
                </p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          log.action === 'ban' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {log.action}
                        </span>
                        <span className="font-semibold text-white">
                          Cible : @{log.targetUsername || 'Inconnu'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Raison : {log.reason}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Par modérateur : {log.moderatorName}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
