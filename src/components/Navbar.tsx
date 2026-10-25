import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  Video, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Sliders, 
  Film, 
  Compass, 
  ChevronDown,
  Sparkles,
  Smartphone,
  Lock
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User;
  activeTab: 'feed' | 'studio' | 'channel' | 'admin';
  setActiveTab: (tab: 'feed' | 'studio' | 'channel' | 'admin') => void;
  onOpenAuth: () => void;
  onOpenNewLiveModal: () => void;
  onOpenPairingModal: () => void;
  onRequestAdminAccess: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onLogout: () => void;
  onResetToVirgin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenNewLiveModal,
  onOpenPairingModal,
  onRequestAdminAccess,
  searchQuery,
  setSearchQuery,
  onSwitchUser,
  allUsers,
  onLogout,
  onResetToVirgin,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2.5 text-left group transition"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-950/50">
              <Radio className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-rose-400 transition">
                  StreamPulse
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                  Live AI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Studio & Diffusion Pro</p>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'feed'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explorer</span>
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'studio'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>Studio Live</span>
            </button>
            <button
              onClick={() => setActiveTab('channel')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'channel'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Ma Chaîne & Replays</span>
            </button>
            <button
              onClick={() => {
                if (currentUser.role === 'admin') {
                  setActiveTab('admin');
                } else {
                  onRequestAdminAccess();
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'admin'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin</span>
            </button>
          </nav>
        </div>

        {/* Intuitive Search Box */}
        <div className="flex-1 max-w-md hidden sm:block relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un live, créateur, catégorie (ex: Tech, Gaming, Musique)..."
              className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right CTA & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PC ↔ Mobile Pairing CTA */}
          <button
            onClick={onOpenPairingModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition cursor-pointer shadow-sm"
            title="Relier un smartphone au studio PC en temps réel"
          >
            <Smartphone className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="hidden sm:inline">Liaison Mobile</span>
          </button>

          {/* Create Live CTA */}
          <button
            onClick={onOpenNewLiveModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-sm font-semibold shadow-md shadow-rose-950/40 transition active:scale-95 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Lancer un Live</span>
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-zinc-700"
              />
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-zinc-200 leading-tight">
                  {currentUser.username}
                </p>
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${
                    currentUser.role === 'admin'
                      ? 'text-amber-400'
                      : currentUser.role === 'creator'
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="p-2 border-b border-zinc-800/80 mb-1">
                  <p className="text-sm font-bold text-white">{currentUser.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md font-mono">
                      {currentUser.followersCount} abonnés
                    </span>
                    <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md">
                      Rôle: {currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('channel')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition"
                >
                  <Film className="w-4 h-4 text-zinc-400" />
                  <span>Ma chaîne & Replays</span>
                </button>

                <button
                  onClick={() => setActiveTab('studio')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition"
                >
                  <Sliders className="w-4 h-4 text-rose-400" />
                  <span>Régie Studio Live</span>
                </button>

                <button
                  onClick={() => {
                    if (currentUser.role === 'admin') {
                      setActiveTab('admin');
                    } else {
                      onRequestAdminAccess();
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Espace Administrateur</span>
                </button>

                {/* Quick Account Switcher for multi-role testing */}
                <div className="mt-2 pt-2 border-t border-zinc-800/80">
                  <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Changer de compte test
                  </p>
                  <div className="space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => onSwitchUser(u)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${
                          u.id === currentUser.id
                            ? 'bg-zinc-800 text-white font-medium'
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate flex-1 text-left">{u.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({u.role})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-800/80 space-y-1">
                  <button
                    onClick={onOpenAuth}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium hover:bg-zinc-800/50 rounded-lg transition"
                  >
                    + Créer un nouveau compte
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition"
                  >
                    <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Se déconnecter</span>
                  </button>

                  <button
                    onClick={onResetToVirgin}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-500 hover:text-red-400 rounded-lg transition"
                    title="Effacer les utilisateurs et réinitialiser à zéro"
                  >
                    🗑️ Réinitialiser le projet (vierge)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
