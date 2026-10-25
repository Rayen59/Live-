import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Hand, Check, X, Volume2, UserCheck, Radio } from 'lucide-react';
import { MicRequest } from '../../types';

interface MicRequestsManagerProps {
  micRequests: MicRequest[];
  onAcceptRequest: (reqId: string) => void;
  onDeclineRequest: (reqId: string) => void;
  onToggleMuteSpeaker: (reqId: string) => void;
  onRemoveSpeaker: (reqId: string) => void;
}

export const MicRequestsManager: React.FC<MicRequestsManagerProps> = ({
  micRequests,
  onAcceptRequest,
  onDeclineRequest,
  onToggleMuteSpeaker,
  onRemoveSpeaker,
}) => {
  // Simulate lively sound level fluctuation for active speakers
  const [activeLevels, setActiveLevels] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newLevels: { [id: string]: number } = {};
      micRequests
        .filter((r) => r.status === 'accepted' && !r.isMuted)
        .forEach((r) => {
          newLevels[r.id] = Math.floor(Math.random() * 60) + 30;
        });
      setActiveLevels(newLevels);
    }, 250);
    return () => clearInterval(interval);
  }, [micRequests]);

  const pendingRequests = micRequests.filter((r) => r.status === 'pending');
  const activeSpeakers = micRequests.filter((r) => r.status === 'accepted');

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-100">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            Micro Invités & Prises de Parole en Direct
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {activeSpeakers.length} micro(s) ouvert(s)
        </span>
      </div>

      {/* Active Speakers On Air */}
      <div className="mb-4">
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Intervenants en direct avec micro ouvert ({activeSpeakers.length})</span>
        </p>

        {activeSpeakers.length === 0 ? (
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center text-xs text-zinc-500">
            Aucun spectateur n'a son micro ouvert actuellement. Les spectateurs peuvent demander la parole ci-dessous.
          </div>
        ) : (
          <div className="space-y-2">
            {activeSpeakers.map((speaker) => {
              const level = activeLevels[speaker.id] || 10;
              return (
                <div
                  key={speaker.id}
                  className="flex items-center justify-between p-2.5 bg-zinc-950 border border-emerald-500/30 rounded-xl"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <img
                        src={speaker.avatar}
                        alt={speaker.username}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/80"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-zinc-950 font-bold">
                        🎤
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {speaker.username}
                      </p>
                      {/* Audio visualizer bar */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                        <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-150 ${
                              speaker.isMuted ? 'w-0' : 'bg-emerald-500'
                            }`}
                            style={{ width: speaker.isMuted ? '0%' : `${level}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {speaker.isMuted ? 'Coupé' : `${level}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleMuteSpeaker(speaker.id)}
                      className={`p-1.5 rounded-lg border text-xs transition ${
                        speaker.isMuted
                          ? 'bg-red-500/20 border-red-500 text-red-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                      }`}
                      title={speaker.isMuted ? 'Activer le micro' : 'Couper le micro'}
                    >
                      {speaker.isMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      onClick={() => onRemoveSpeaker(speaker.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-red-400 transition"
                      title="Retirer de l'antenne"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Requests to speak */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5 text-amber-400" />
            <span>Demandes de prise de parole en attente ({pendingRequests.length})</span>
          </p>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">
            Aucune demande en attente. Vos spectateurs peuvent lever la main depuis le lecteur live.
          </p>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={req.avatar}
                    alt={req.username}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      @{req.username}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Demande à intervenir au micro
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAcceptRequest(req.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Ouvrir son micro</span>
                  </button>
                  <button
                    onClick={() => onDeclineRequest(req.id)}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                    title="Refuser"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
