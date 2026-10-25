import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  QrCode, 
  Check, 
  Copy, 
  Share2, 
  Radio, 
  Sparkles, 
  ArrowRight,
  Wifi,
  Video,
  Mic,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { User, LiveStream } from '../types';

interface DevicePairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  activeStream?: LiveStream | null;
}

export const DevicePairingModal: React.FC<DevicePairingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeStream,
}) => {
  const [pairingCode, setPairingCode] = useState<string>('482915');
  const [copied, setCopied] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'remote_control' | 'mobile_camera' | 'interactive_viewer'>('remote_control');
  const [isPairedConnected, setIsPairedConnected] = useState(false);
  const [pairingUrl, setPairingUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const url = `${window.location.origin}?pair=${pairingCode}&user=${currentUser.username}`;
      setPairingUrl(url);

      // Create pairing session on server
      StorageService.createPairing(currentUser.id, activeStream?.id, selectedRole).then((res) => {
        if (res.code) {
          setPairingCode(res.code);
          setPairingUrl(`${window.location.origin}?pair=${res.code}&user=${currentUser.username}`);
        }
      });
    }
  }, [isOpen, selectedRole, currentUser.id, activeStream?.id]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(pairingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-zinc-100 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Liaison PC & Smartphone en Temps Réel</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-mono font-bold">
                  Synchronisé
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Connectez votre téléphone au PC pour synchroniser le direct, le chat et les commandes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Digit Sync Code Box */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center space-y-2">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Code de Liaison Instantanée (Entrez ce code sur votre téléphone)
          </p>
          <div className="flex items-center justify-center gap-2">
            {pairingCode.split('').map((digit, idx) => (
              <span
                key={idx}
                className="w-10 h-12 flex items-center justify-center text-xl font-mono font-extrabold bg-zinc-900 border border-zinc-700/80 rounded-xl text-rose-400 shadow-inner"
              >
                {digit}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500">
            Valide pour relier n'importe quel smartphone au studio en direct.
          </p>
        </div>

        {/* Connection Mode Selection */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2">
            Mode d'utilisation du smartphone :
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedRole('remote_control')}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                selectedRole === 'remote_control'
                  ? 'bg-rose-500/20 border-rose-500 text-white font-bold shadow'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-4 h-4 text-rose-400" />
              <span className="truncate">Télécommande Régie</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('mobile_camera')}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                selectedRole === 'mobile_camera'
                  ? 'bg-blue-500/20 border-blue-500 text-white font-bold shadow'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Video className="w-4 h-4 text-blue-400" />
              <span className="truncate">Caméra Sans-fil</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('interactive_viewer')}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                selectedRole === 'interactive_viewer'
                  ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              <span className="truncate">Micro & Chat Mobile</span>
            </button>
          </div>
        </div>

        {/* Direct Link Share */}
        <div className="space-y-1.5 text-xs">
          <label className="block text-zinc-300 font-medium">
            Ou ouvrez directement ce lien sur votre téléphone :
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={pairingUrl}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition cursor-pointer shrink-0 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié' : 'Copier'}</span>
            </button>
          </div>
        </div>

        {/* Device Status Banner */}
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="font-bold text-emerald-300">Synchronisation Réseau Active</p>
              <p className="text-[11px] text-zinc-400">
                Tout changement sur PC (stream, chat, publicité, micro) se reflète instantanément sur téléphone.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
        >
          Fermer et continuer
        </button>
      </div>
    </div>
  );
};
