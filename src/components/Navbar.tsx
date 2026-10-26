import React, { useState } from 'react';
import { 
  Radio, 
  Search, 
  Video, 
  ShieldCheck, 
  LogOut, 
  Sliders, 
  Film, 
  Compass, 
  ChevronDown,
  Sparkles,
  X,
  Flame,
  Tag
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User;
  activeTab: 'feed' | 'studio' | 'channel' | 'admin' | 'search';
  setActiveTab: (tab: 'feed' | 'studio' | 'channel' | 'admin' | 'search') => void;
  onOpenAuth: () => void;
  onOpenNewLiveModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  onLogout: () => void;
  onResetToVirgin: () => void;
}

const POPULAR_SEARCH_TAGS = ['Tech & Dev', 'Gaming', 'Musique', 'Talk Show', 'Business', 'Créatif & Art'];

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenNewLiveModal,
  searchQuery,
  setSearchQuery,
  onSwitchUser,
  allUsers,
  onLogout,
  onResetToVirgin,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveTab('search');
    setShowSearchSuggestions(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Main Nav */}
        <div className="flex items-center gap-4 lg:gap-8 shrink-0">
          <button 
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2.5 text-left group transition cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-md shadow-rose-950/50">
              <Radio className="w-4 h-4 text-white animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-rose-400 transition">
                  StreamPulse
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">Studio & Diffusion Pro</p>
            </div>
          </button>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explorer</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-rose-400" />
              <span>Recherche</span>
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              <span>Studio Live</span>
            </button>
            <button
              onClick={() => setActiveTab('channel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'channel'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Ma Chaîne</span>
            </button>
          </nav>
        </div>

        {/* ISOLATED SEARCH BAR (YouTube-Style Search Input) */}
        <div className="flex-1 max-w-md lg:max-w-xl relative mx-1 sm:mx-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <button
              type="submit"
              className="absolute left-3 p-1 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Ouvrir la recherche"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 250)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
              placeholder="Rechercher des lives, replays, créateurs..."
              className="w-full bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-600 focus:border-rose-500 rounded-2xl pl-10 pr-16 py-2 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/25 transition shadow-inner"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-300 hover:text-white rounded-lg transition cursor-pointer border border-zinc-700/60"
                title="Ouvrir la page de recherche isolée"
              >
                Page
              </button>
            </div>
          </form>

          {/* Autocomplete / Quick Category Tags when focused */}
          {showSearchSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  Suggestions rapides
                </span>
                <span className="text-[10px] text-zinc-500">Cliquez pour chercher sur la page</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onMouseDown={() => {
                      setSearchQuery(tag);
                      setActiveTab('search');
                      setShowSearchSuggestions(false);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-rose-600 hover:text-white border border-zinc-700/60 text-xs text-zinc-300 transition cursor-pointer"
                  >
                    <Tag className="w-3 h-3 text-rose-400" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right CTA & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Create Live CTA (Prominent) */}
          <button
            onClick={onOpenNewLiveModal}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-950/40 transition active:scale-95 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Lancer un Live</span>
            <span className="sm:hidden font-bold">Direct</span>
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition cursor-pointer"
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

                {/* Quick Account Switcher */}
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

      {/* Mobile Nav Tabs Bar (Visible on mobile/tablet) */}
      <div className="lg:hidden flex items-center justify-around border-t border-zinc-800/60 mt-2.5 pt-2 text-xs">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-lg font-medium transition ${
            activeTab === 'feed' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explorer</span>
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-lg font-medium transition ${
            activeTab === 'studio' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-zinc-400'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-rose-400" />
          <span>Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('channel')}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-lg font-medium transition ${
            activeTab === 'channel' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Chaîne</span>
        </button>
      </div>
    </header>
  );
};
