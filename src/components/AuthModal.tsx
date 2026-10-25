import React, { useState } from 'react';
import { X, Mail, User as UserIcon, Lock, Sparkles, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { StorageService } from '../services/storage';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'creator' | 'viewer'>('creator');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'register') {
      if (!email || !username || !name) {
        setError('Veuillez remplir tous les champs obligatoires (Nom, Nom d’utilisateur et Email).');
        return;
      }

      // Perform registration with strict single-use email constraint
      const res = StorageService.registerUser({
        email,
        username,
        name,
        role,
        bio,
      });

      if (!res.success) {
        setError(res.error || 'Erreur lors de l’inscription.');
        return;
      }

      setSuccessMsg(`Compte créé avec succès ! Bienvenue ${res.user?.name}.`);
      setTimeout(() => {
        if (res.user) onAuthSuccess(res.user);
        onClose();
      }, 900);
    } else {
      if (!email) {
        setError('Veuillez renseigner votre email.');
        return;
      }

      const res = StorageService.loginUser(email);
      if (!res.success) {
        setError(res.error || 'Erreur de connexion.');
        return;
      }

      setSuccessMsg(`Ravi de vous revoir, ${res.user?.name} !`);
      setTimeout(() => {
        if (res.user) onAuthSuccess(res.user);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-zinc-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'register' ? 'Créer votre compte StreamPulse' : 'Connexion à votre espace'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'register'
              ? 'Un email unique par utilisateur est strictement requis pour garantir la sécurité.'
              : 'Accédez à votre studio en direct, vos diffusions et vos abonnés.'}
          </p>
        </div>

        {/* Feedback Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nom complet / Alias *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Jean Dupont"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nom d’utilisateur (Identifiant de chaîne) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="jean_streamer"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Adresse Email {mode === 'register' && <span className="text-rose-400 font-normal">(usage unique requis)</span>} *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@domaine.com"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Rôle principal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition ${
                      role === 'creator'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    🎥 Créateur de Live
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('viewer')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition ${
                      role === 'viewer'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    👀 Spectateur & Invité
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Courte description de votre chaîne (optionnel)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="De quoi parlerez-vous dans vos lives ?"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-rose-950/50 cursor-pointer"
          >
            {mode === 'register' ? 'Créer mon compte unique' : 'Se connecter'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 text-center text-xs text-zinc-400 pt-4 border-t border-zinc-800/80">
          {mode === 'register' ? (
            <p>
              Vous possédez déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-rose-400 font-semibold hover:underline"
              >
                Connectez-vous ici
              </button>
            </p>
          ) : (
            <p>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-rose-400 font-semibold hover:underline"
              >
                Inscrivez-vous avec votre email
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
