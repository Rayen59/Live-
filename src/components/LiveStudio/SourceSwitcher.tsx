import React from 'react';
import { Camera, Monitor, Film, Image as ImageIcon, PauseCircle, Layers } from 'lucide-react';
import { VideoSourceType } from '../../types';

interface SourceSwitcherProps {
  activeSource: VideoSourceType;
  onChangeSource: (source: VideoSourceType) => void;
  isSharingScreen: boolean;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
}

export const SourceSwitcher: React.FC<SourceSwitcherProps> = ({
  activeSource,
  onChangeSource,
  isSharingScreen,
  onStartScreenShare,
  onStopScreenShare,
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-zinc-100">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Sélecteur de Source Live (Régie Vidéo)
          </h3>
        </div>
        <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-mono uppercase font-bold">
          Source en direct : {activeSource}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Webcam */}
        <button
          onClick={() => onChangeSource('camera')}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
            activeSource === 'camera'
              ? 'bg-rose-500/20 border-rose-500 text-white shadow-md shadow-rose-950/30'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeSource === 'camera' ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
            <Camera className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">Caméra Web</p>
            <p className="text-[10px] text-zinc-500">Flux vidéo principal</p>
          </div>
        </button>

        {/* Screen Share */}
        <button
          onClick={() => {
            if (!isSharingScreen) {
              onStartScreenShare();
            } else {
              onChangeSource('screen');
            }
          }}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
            activeSource === 'screen'
              ? 'bg-blue-500/20 border-blue-500 text-white shadow-md shadow-blue-950/30'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeSource === 'screen' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
            <Monitor className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">Partage d’Écran</p>
            <p className="text-[10px] text-zinc-500">
              {isSharingScreen ? 'Actif · Prêt' : 'Démarrer le partage'}
            </p>
          </div>
        </button>

        {/* Pre-recorded Media / Ad */}
        <button
          onClick={() => onChangeSource('media')}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
            activeSource === 'media'
              ? 'bg-purple-500/20 border-purple-500 text-white shadow-md shadow-purple-950/30'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeSource === 'media' ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
            <Film className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">Clip / Publicité</p>
            <p className="text-[10px] text-zinc-500">Vidéo de la galerie</p>
          </div>
        </button>

        {/* Poster / Presentation Slide */}
        <button
          onClick={() => onChangeSource('poster')}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition ${
            activeSource === 'poster'
              ? 'bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-950/30'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1.5 rounded-lg ${activeSource === 'poster' ? 'bg-amber-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">Affiche / Diapositive</p>
            <p className="text-[10px] text-zinc-500">Bannière & Présentation</p>
          </div>
        </button>
      </div>
    </div>
  );
};
