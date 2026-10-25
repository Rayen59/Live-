import React from 'react';
import { Sliders, Sun, Contrast, Eye, Sparkles, RefreshCw, FlipHorizontal, Wand2 } from 'lucide-react';
import { VideoFilterSettings } from '../../types';

interface VideoClarityControlsProps {
  filters: VideoFilterSettings;
  setFilters: React.Dispatch<React.SetStateAction<VideoFilterSettings>>;
}

export const VideoClarityControls: React.FC<VideoClarityControlsProps> = ({
  filters,
  setFilters,
}) => {
  const updateFilter = <K extends keyof VideoFilterSettings>(key: K, value: VideoFilterSettings[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: 'natural' | 'studio' | 'cinematic' | 'sharp' | 'warm') => {
    switch (preset) {
      case 'natural':
        setFilters({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          clarity: 0,
          blur: 0,
          isMirrored: filters.isMirrored,
          resolution: filters.resolution,
        });
        break;
      case 'studio':
        setFilters({
          brightness: 110,
          contrast: 115,
          saturation: 115,
          clarity: 65,
          blur: 0,
          isMirrored: filters.isMirrored,
          resolution: filters.resolution,
        });
        break;
      case 'cinematic':
        setFilters({
          brightness: 95,
          contrast: 130,
          saturation: 90,
          clarity: 50,
          blur: 0,
          isMirrored: filters.isMirrored,
          resolution: filters.resolution,
        });
        break;
      case 'sharp':
        setFilters({
          brightness: 105,
          contrast: 120,
          saturation: 105,
          clarity: 95,
          blur: 0,
          isMirrored: filters.isMirrored,
          resolution: filters.resolution,
        });
        break;
      case 'warm':
        setFilters({
          brightness: 105,
          contrast: 105,
          saturation: 135,
          clarity: 40,
          blur: 0,
          isMirrored: filters.isMirrored,
          resolution: filters.resolution,
        });
        break;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-100">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Traitement Vidéo & Clarté d’Image</h3>
        </div>
        <button
          onClick={() => applyPreset('natural')}
          className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
          title="Réinitialiser les réglages"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Défaut</span>
        </button>
      </div>

      {/* Instant Presets */}
      <div className="mb-4">
        <p className="text-[11px] font-medium text-zinc-400 mb-1.5 flex items-center gap-1">
          <Wand2 className="w-3 h-3 text-rose-400" />
          <span>Préréglages d'étalonnage rapide :</span>
        </p>
        <div className="grid grid-cols-5 gap-1.5 text-[11px]">
          <button
            onClick={() => applyPreset('natural')}
            className="py-1 px-1.5 bg-zinc-800/80 hover:bg-zinc-700 rounded-lg text-center font-medium text-zinc-300 transition"
          >
            Naturel
          </button>
          <button
            onClick={() => applyPreset('studio')}
            className="py-1 px-1.5 bg-zinc-800/80 hover:bg-rose-950/40 hover:text-rose-300 rounded-lg text-center font-medium text-zinc-300 transition"
          >
            Studio Pro
          </button>
          <button
            onClick={() => applyPreset('sharp')}
            className="py-1 px-1.5 bg-zinc-800/80 hover:bg-emerald-950/40 hover:text-emerald-300 rounded-lg text-center font-medium text-zinc-300 transition"
          >
            Clarté Max
          </button>
          <button
            onClick={() => applyPreset('cinematic')}
            className="py-1 px-1.5 bg-zinc-800/80 hover:bg-amber-950/40 hover:text-amber-300 rounded-lg text-center font-medium text-zinc-300 transition"
          >
            Cinéma
          </button>
          <button
            onClick={() => applyPreset('warm')}
            className="py-1 px-1.5 bg-zinc-800/80 hover:bg-purple-950/40 hover:text-purple-300 rounded-lg text-center font-medium text-zinc-300 transition"
          >
            Chaud
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-3.5 text-xs">
        {/* Clarity / Sharpness */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-zinc-300 flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Netteté & Clarté Adaptative
            </span>
            <span className="font-mono text-zinc-400">{filters.clarity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.clarity}
            onChange={(e) => updateFilter('clarity', Number(e.target.value))}
            className="w-full accent-rose-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Brightness */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Luminosité
            </span>
            <span className="font-mono text-zinc-400">{filters.brightness}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="140"
            value={filters.brightness}
            onChange={(e) => updateFilter('brightness', Number(e.target.value))}
            className="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Contrast className="w-3.5 h-3.5 text-blue-400" />
              Contraste
            </span>
            <span className="font-mono text-zinc-400">{filters.contrast}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="140"
            value={filters.contrast}
            onChange={(e) => updateFilter('contrast', Number(e.target.value))}
            className="w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              Saturation des Couleurs
            </span>
            <span className="font-mono text-zinc-400">{filters.saturation}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="180"
            value={filters.saturation}
            onChange={(e) => updateFilter('saturation', Number(e.target.value))}
            className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Blur / Bokeh */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-zinc-300 flex items-center gap-1.5">
              Flou d’Arrière-Plan (Bokeh)
            </span>
            <span className="font-mono text-zinc-400">{filters.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={filters.blur}
            onChange={(e) => updateFilter('blur', Number(e.target.value))}
            className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Toggles: Mirror & Quality resolution */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
          <button
            onClick={() => updateFilter('isMirrored', !filters.isMirrored)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition ${
              filters.isMirrored
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Effet Miroir</span>
          </button>

          <div className="flex items-center gap-1 text-[11px]">
            {(['1080p', '720p', '480p'] as const).map((res) => (
              <button
                key={res}
                onClick={() => updateFilter('resolution', res)}
                className={`px-2 py-1 rounded-md font-mono transition ${
                  filters.resolution === res
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
