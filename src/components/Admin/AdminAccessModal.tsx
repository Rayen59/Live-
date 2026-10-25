import React, { useState } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';

interface AdminAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Master Admin Passcode
    if (passcode.trim() === 'admin2026' || passcode.trim() === '1234') {
      onSuccess();
      onClose();
    } else {
      setError('Code administrateur incorrect. Veuillez saisir le code valide (ex: admin2026).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-zinc-100 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Accès Administration Sécurisé</span>
              </h2>
              <p className="text-xs text-zinc-400">
                L'entrée à l'administration nécessite une autorisation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300">Protection d'accès stricte</p>
          <p className="text-[11px]">
            L'entrée automatique à la page administrateur est désactivée. Entrez votre code secret administrateur pour accéder à la modération globale, bannissements et flux.
          </p>
          <div className="mt-1 pt-1 border-t border-zinc-800/80 flex items-center gap-1.5 text-[10px] text-amber-400 font-mono">
            <KeyRound className="w-3 h-3" />
            <span>Code par défaut de test : <strong>admin2026</strong></span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Code PIN Administrateur
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Entrez le code secret..."
              autoFocus
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition font-mono tracking-widest text-center"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Déverrouiller</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
