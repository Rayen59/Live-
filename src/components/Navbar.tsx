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
  Tag,
  Menu,
  Bell,
  Trophy,
  LayoutDashboard,
  TrendingUp,
  Folder,
  ShoppingBag,
  Wallet,
  Star,
  Globe2,
  HelpCircle,
  Gem,
  CheckCircle2
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTrophyMenu, setShowTrophyMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveTab('search');
    setShowSearchSuggestions(false);
  };

  const handleNavClick = (tab: 'feed' | 'studio' | 'channel' | 'admin' | 'search') => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#07152b]/95 backdrop-blur-md border-b border-[#12284b] px-3 sm:px-6 lg:px-8 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Hamburger Menu (like Screenshot 1 & 2) + Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl text-white hover:bg-[#0f274d] border border-transparent hover:border-[#1d437d] transition cursor-pointer flex items-center justify-center"
              title="Ouvrir le menu de navigation"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Brand Logo styled with the talk bubble / live icon */}
            <button 
              onClick={() => setActiveTab('feed')}
              className="flex items-center gap-2.5 text-left group transition cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] shadow-md shadow-sky-950/60 border border-[#38bdf8]/30">
                <Radio className="w-4 h-4 text-white animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#38bdf8] border-2 border-[#07152b] rounded-full animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-white group-hover:text-[#38bdf8] transition">
                    StreamPulse
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/40 rounded-md">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Studio & Diffusion Pro</p>
              </div>
            </button>
          </div>

          {/* Center Search Input */}
          <div className="flex-1 max-w-md lg:max-w-xl relative mx-1 sm:mx-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <button
                type="submit"
                className="absolute left-3.5 p-1 text-slate-400 hover:text-white transition cursor-pointer"
                title="Ouvrir la recherche"
              >
                <Search className="w-4 h-4 text-[#38bdf8]" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 250)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit();
                }}
                placeholder="Rechercher des lives, replays, créateurs..."
                className="w-full bg-[#0b1c38] border border-[#163668] hover:border-[#1d437d] focus:border-[#38bdf8] rounded-2xl pl-10 pr-16 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 transition shadow-inner"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-lg hover:bg-[#153466] text-slate-400 hover:text-white transition cursor-pointer"
                    title="Effacer la recherche"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className="px-2 py-1 bg-[#102a54] hover:bg-[#163a75] text-[10px] font-bold text-[#38bdf8] hover:text-white rounded-lg transition cursor-pointer border border-[#1d437d]"
                  title="Ouvrir la page de recherche"
                >
                  Filtrer
                </button>
              </div>
            </form>

            {/* Autocomplete / Suggestions */}
            {showSearchSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a1e3e] border border-[#163668] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Thématiques populaires
                  </span>
                  <span className="text-[10px] text-slate-400">Cliquez pour rechercher</span>
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
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0e274e] hover:bg-[#0284c7] hover:text-white border border-[#1a3d73] text-xs text-slate-200 transition cursor-pointer"
                    >
                      <Tag className="w-3 h-3 text-[#38bdf8]" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Header Badges: Trophy Pill + Bell + Create Live + User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Trophy Rank Pill (like Screenshot 1 & 2) */}
            <div className="relative">
              <button
                onClick={() => setShowTrophyMenu(!showTrophyMenu)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#0f274d] hover:bg-[#153466] border border-[#1d437d] rounded-xl text-amber-300 font-bold text-xs transition cursor-pointer shadow-sm"
                title="Classement & Progression Live"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline font-mono">Rang 1</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showTrophyMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-[#091b38] border border-[#163668] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95"
                  onClick={() => setShowTrophyMenu(false)}
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-[#132c54] mb-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Classement Créateurs</p>
                      <p className="text-[10px] text-slate-400">Diffusion & Engagement Live</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center bg-[#0d2347] p-2 rounded-xl border border-[#183a6b]">
                      <span className="text-slate-300">Niveau Studio :</span>
                      <span className="font-bold text-[#38bdf8]">Pro Streamer</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#0d2347] p-2 rounded-xl border border-[#183a6b]">
                      <span className="text-slate-300">Heures de direct :</span>
                      <span className="font-bold text-amber-300">24.5 h</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell (like Screenshot 1 & 2) */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-[#0f274d] hover:bg-[#153466] border border-[#1d437d] text-slate-300 hover:text-white transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
              </button>

              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-[#091b38] border border-[#163668] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95"
                  onClick={() => setShowNotifications(false)}
                >
                  <p className="text-xs font-bold text-white pb-2 border-b border-[#132c54] mb-2">
                    🔔 Notifications Live
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-[#0d2347] border border-[#183a6b]">
                      <p className="font-semibold text-[#38bdf8]">Studio haute définition prêt</p>
                      <p className="text-[11px] text-slate-400">Vos filtres de clarté et partage d'écran sont activés.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0d2347] border border-[#183a6b]">
                      <p className="font-semibold text-emerald-300">Micro spectateurs synchronisé</p>
                      <p className="text-[11px] text-slate-400">La régie WebRTC autorise la prise de parole en direct.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Create Live CTA (Prominent Sky Blue) */}
            <button
              onClick={onOpenNewLiveModal}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0ea5e9] hover:to-[#0284c7] text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-950/50 transition active:scale-95 cursor-pointer border border-[#38bdf8]/30"
            >
              <Video className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Lancer un Live</span>
              <span className="sm:hidden font-bold">Direct</span>
            </button>

            {/* User Profile Avatar with Electric Cyan Ring (like Screenshot 1 & 2) */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl bg-[#0f274d] hover:bg-[#153466] border border-[#1d437d] text-left transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full ring-2 ring-[#0ea5e9] p-0.5 overflow-hidden bg-[#07152b]">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-white leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-[#38bdf8] font-mono leading-tight">
                    @{currentUser.username}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-[#091b38] border border-[#163668] rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="p-2.5 border-b border-[#132c54] mb-1.5 bg-[#0d2246] rounded-xl">
                    <p className="text-sm font-bold text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] bg-[#12284c] text-slate-300 px-2 py-0.5 rounded-md font-mono">
                        {currentUser.followersCount} abonnés
                      </span>
                      <span className="text-[11px] bg-[#0ea5e9]/20 text-[#38bdf8] border border-[#0ea5e9]/30 px-2 py-0.5 rounded-md font-bold">
                        Rôle : {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('feed')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-[#12284c] rounded-xl transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#38bdf8]" />
                    <span>Tableau de bord</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('studio')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-[#12284c] rounded-xl transition"
                  >
                    <Sliders className="w-4 h-4 text-[#38bdf8]" />
                    <span>Régie Studio Live</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('channel')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-200 hover:text-white hover:bg-[#12284c] rounded-xl transition"
                  >
                    <Film className="w-4 h-4 text-[#38bdf8]" />
                    <span>Ma chaîne & Replays</span>
                  </button>

                  {/* Account Switcher */}
                  <div className="mt-2 pt-2 border-t border-[#132c54]">
                    <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Changer de profil
                    </p>
                    <div className="space-y-1">
                      {allUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => onSwitchUser(u)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition ${
                            u.id === currentUser.id
                              ? 'bg-[#163668] text-white font-bold'
                              : 'text-slate-300 hover:bg-[#10274d] hover:text-white'
                          }`}
                        >
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-[#38bdf8]" />
                          <span className="truncate flex-1 text-left">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({u.role})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#132c54] space-y-1">
                    <button
                      onClick={onOpenAuth}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#38bdf8] hover:text-white font-medium hover:bg-[#10274d] rounded-xl transition"
                    >
                      + Créer un nouveau compte
                    </button>

                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-300 hover:text-white hover:bg-rose-950/30 rounded-xl transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Se déconnecter</span>
                    </button>

                    <button
                      onClick={onResetToVirgin}
                      className="w-full text-left px-3 py-1.5 text-[11px] text-slate-500 hover:text-red-400 rounded-xl transition"
                      title="Effacer les utilisateurs et réinitialiser à zéro"
                    >
                      🗑️ Réinitialiser le projet à l'état vierge
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR DRAWER (Identical design to Screenshot 2) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-80 max-w-[85vw] bg-[#071733] border-r border-[#153464] text-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-left duration-250 select-none">
            {/* Drawer Header with Logo & Close */}
            <div className="flex items-center justify-between p-4 border-b border-[#132c54] bg-[#091b38]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] flex items-center justify-center border border-[#38bdf8]/40 shadow-md">
                  <Radio className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white tracking-tight">StreamPulse</h2>
                  <p className="text-[10px] text-[#38bdf8] font-mono">streampulse-live.com</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#10274d] text-slate-400 hover:text-white transition cursor-pointer"
                title="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Mini Card in Drawer */}
            <div className="p-3 mx-3 mt-3 rounded-2xl bg-[#0c2246] border border-[#193a6b] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full ring-2 ring-[#0ea5e9] p-0.5 overflow-hidden bg-[#07152b] shrink-0">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <span className="text-[10px] bg-[#0ea5e9]/20 text-[#38bdf8] px-2 py-0.5 rounded-md font-bold uppercase">
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Menu Navigation List (Screenshot 2 list items) */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-sm font-medium">
              {/* Tableau de bord (Dashboard) */}
              <button
                onClick={() => handleNavClick('feed')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'feed'
                    ? 'bg-[#163668] text-white font-bold shadow-md shadow-sky-950/50 border-l-4 border-[#38bdf8]'
                    : 'text-slate-300 hover:bg-[#0e2448] hover:text-white'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-[#0ea5e9]/20 flex items-center justify-center text-[#38bdf8]">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span>Tableau de bord</span>
              </button>

              {/* Classement */}
              <button
                onClick={() => {
                  setShowTrophyMenu(true);
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-[#0e2448] hover:text-white transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <span>Classement</span>
              </button>

              {/* Statistiques */}
              <button
                onClick={() => handleNavClick('studio')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-[#0e2448] hover:text-white transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span>Statistiques</span>
              </button>

              {/* Offres */}
              <button
                onClick={() => handleNavClick('studio')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-[#0e2448] hover:text-white transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <Gem className="w-4 h-4" />
                </div>
                <span>Offres & Sponsors</span>
              </button>

              {/* Matières / Médiathèque */}
              <button
                onClick={() => handleNavClick('studio')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-[#0e2448] hover:text-white transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Folder className="w-4 h-4" />
                </div>
                <span>Matières & Médias</span>
              </button>

              {/* Séances en direct */}
              <button
                onClick={() => {
                  onOpenNewLiveModal();
                  setIsDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'studio'
                    ? 'bg-[#163668] text-white font-bold shadow-md shadow-sky-950/50 border-l-4 border-[#38bdf8]'
                    : 'text-slate-300 hover:bg-[#0e2448] hover:text-white'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Video className="w-4 h-4" />
                </div>
                <span>Séances en direct</span>
              </button>

              {/* Boutique */}
              <button
                onClick={() => handleNavClick('channel')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-[#0e2448] hover:text-white transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span>Boutique & Cadeaux</span>
              </button>

              {/* Porte monnaie */}
              <button
                onClick={() => handleNavClick('channel')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-[#0e2448] hover:text-white transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <span>Porte monnaie</span>
              </button>

              {/* Mes favoris */}
              <button
                onClick={() => handleNavClick('channel')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-[#0e2448] hover:text-white transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                  <Star className="w-4 h-4" />
                </div>
                <span>Mes favoris</span>
              </button>

              {/* Biblio partagée */}
              <button
                onClick={() => handleNavClick('search')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-[#163668] text-white font-bold shadow-md shadow-sky-950/50 border-l-4 border-[#38bdf8]'
                    : 'text-slate-300 hover:bg-[#0e2448] hover:text-white'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Globe2 className="w-4 h-4" />
                </div>
                <span>Biblio partagée</span>
              </button>

              {/* Espace Admin / Modérateur */}
              <button
                onClick={() => handleNavClick('admin')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#163668] text-white font-bold shadow-md shadow-sky-950/50 border-l-4 border-[#38bdf8]'
                    : 'text-slate-300 hover:bg-[#0e2448] hover:text-white'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Administration</span>
              </button>

              {/* Assistance */}
              <button
                onClick={() => {
                  alert("StreamPulse Assistance : Vous pouvez utiliser le Copilot IA ou le bouton flottant d'assistance en bas de l'écran pour obtenir de l'aide en direct !");
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-[#0e2448] hover:text-white transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span>Assistance</span>
              </button>
            </nav>

            {/* Drawer Footer Actions */}
            <div className="p-3 border-t border-[#132c54] bg-[#091b38] space-y-2">
              <button
                onClick={() => {
                  onOpenNewLiveModal();
                  setIsDrawerOpen(false);
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0ea5e9] hover:to-[#0284c7] text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Démarrer une séance en direct</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
