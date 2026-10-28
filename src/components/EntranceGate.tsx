import React, { useState } from 'react';
import { 
  Radio, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Video,
  Eye,
  ArrowRight
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { User } from '../types';

interface EntranceGateProps {
  onAuthenticated: (user: User) => void;
}

export const EntranceGate: React.FC<EntranceGateProps> = ({ onAuthenticated }) => {
  const [activeMode, setActiveMode] = useState<'register' | 'login'>('register');
  
  // Register form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'creator' | 'viewer'>('creator');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');

  // Status feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Manual Account Registration with Strict Unique Email
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim() || !username.trim() || !email.trim()) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    const res = StorageService.registerUser({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      role,
    });

    if (!res.success) {
      setError(res.error || 'Erreur lors de l’inscription.');
      return;
    }

    setSuccessMsg(`Compte créé avec succès ! Bienvenue ${res.user?.name}.`);
    setTimeout(() => {
      if (res.user) onAuthenticated(res.user);
    }, 700);
  };

  // Login with existing email
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginEmail.trim()) {
      setError('Veuillez renseigner votre email.');
      return;
    }

    const res = StorageService.loginUser(loginEmail.trim());
    if (!res.success) {
      setError(res.error || 'Impossible de se connecter.');
      return;
    }

    setSuccessMsg(`Ravi de vous revoir, ${res.user?.name} !`);
    setTimeout(() => {
      if (res.user) onAuthenticated(res.user);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#071326] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background glow in deep oceanic/sky tones */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0b1c38] border border-[#163668] shadow-xl mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping" />
            <span className="text-xs font-semibold text-sky-200">
              Plateforme Vierge · Inscription ou Connexion Requise
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#0284c7] to-[#38bdf8] rounded-2xl shadow-xl shadow-sky-950/60 text-white">
              <Radio className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              StreamPulse <span className="text-[#38bdf8]">Live</span>
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Studio professionnel de streaming, partage d’écran, filtres de clarté, micros spectateurs et régie en direct.
          </p>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#0b1c38] border border-[#163668] rounded-2xl text-xs">
          <button
            onClick={() => {
              setActiveMode('register');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'register'
                ? 'bg-[#0284c7] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Créer un compte</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('login');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === 'login'
                ? 'bg-[#0284c7] text-white shadow-md shadow-sky-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Se connecter</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-[#0b1c38] border border-[#163668] rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {/* REGISTER MODE */}
          {activeMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">
                  Créer votre compte StreamPulse
                </h2>
                <p className="text-slate-400 text-xs">
                  Chaque adresse email ne peut être utilisée qu'une seule fois.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom complet / Nom d'affichage *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Alexandre Rivière"
                    className="w-full bg-[#07152b] border border-[#163668] focus:border-[#38bdf8] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom d'utilisateur de chaîne (@) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="alex_live"
                    className="w-full bg-[#07152b] border border-[#163668] focus:border-[#38bdf8] rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Adresse Email <span className="text-sky-400 font-normal">(usage unique requis)</span> *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre.email@domaine.com"
                    className="w-full bg-[#07152b] border border-[#163668] focus:border-[#38bdf8] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Rôle principal
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition flex items-center justify-center gap-2 cursor-pointer font-semibold ${
                      role === 'creator'
                        ? 'bg-sky-500/20 border-[#38bdf8] text-sky-200'
                        : 'bg-[#07152b] border-[#163668] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Video className="w-4 h-4 text-[#38bdf8]" />
                    <span>Créateur de Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('viewer')}
                    className={`py-2.5 px-3 rounded-xl border text-center transition flex items-center justify-center gap-2 cursor-pointer font-semibold ${
                      role === 'viewer'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-[#07152b] border-[#163668] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Spectateur / Invité</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-sky-950/50 cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                <span>Créer mon compte & Entrer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* LOGIN MODE */}
          {activeMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">
                  Connexion à votre compte
                </h2>
                <p className="text-slate-400 text-xs">
                  Entrez votre adresse email enregistrée pour accéder à votre espace.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Adresse email du compte
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="votre.email@domaine.com"
                    className="w-full bg-[#07152b] border border-[#163668] focus:border-[#38bdf8] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-sky-950/50 cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('register');
                    setError(null);
                  }}
                  className="text-xs text-[#38bdf8] hover:underline font-semibold"
                >
                  Pas encore de compte ? S'inscrire ici
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
