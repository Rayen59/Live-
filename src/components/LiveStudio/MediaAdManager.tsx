import React, { useState, useRef } from 'react';
import { Film, Image as ImageIcon, Upload, Play, Check, AlertCircle, Clock, Volume2, ArrowLeft, Layers, PictureInPicture, Square } from 'lucide-react';
import { MediaAsset, VideoSourceType } from '../../types';
import { StorageService } from '../../services/storage';

interface MediaAdManagerProps {
  mediaAssets: MediaAsset[];
  setMediaAssets: React.Dispatch<React.SetStateAction<MediaAsset[]>>;
  activeMediaId?: string;
  parallelMediaId?: string;
  onSelectMediaToBroadcastSolo: (asset: MediaAsset, duration?: number) => void;
  onSelectMediaToBroadcastParallel: (asset: MediaAsset) => void;
  onStopParallelMedia: () => void;
  activeSource: VideoSourceType;
  onReturnToLiveCamera: () => void;
  onSelectMediaToBroadcast?: (asset: MediaAsset) => void;
}

export const MediaAdManager: React.FC<MediaAdManagerProps> = ({
  mediaAssets,
  setMediaAssets,
  activeMediaId,
  parallelMediaId,
  onSelectMediaToBroadcastSolo,
  onSelectMediaToBroadcastParallel,
  onStopParallelMedia,
  activeSource,
  onReturnToLiveCamera,
  onSelectMediaToBroadcast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>('all');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Veuillez sélectionner un fichier vidéo ou image valide.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const newAsset: MediaAsset = {
      id: `custom_media_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: isVideo ? 'video' : 'image',
      url: objectUrl,
      duration: isVideo ? 30 : undefined,
      thumbnail: isImage ? objectUrl : undefined,
      isAd: file.name.toLowerCase().includes('pub') || file.name.toLowerCase().includes('ad'),
    };

    StorageService.addMediaAsset(newAsset);
    setMediaAssets((prev) => [newAsset, ...prev]);
    setUploadNotice(`Média "${file.name}" ajouté avec succès à votre galerie !`);
    setTimeout(() => setUploadNotice(null), 3000);
  };

  const filtered = mediaAssets.filter((m) => {
    if (filterType === 'video') return m.type === 'video';
    if (filterType === 'image') return m.type === 'image';
    return true;
  });

  const isMediaCurrentlyBroadcasting = activeSource === 'media' || activeSource === 'poster';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">
              Galerie Média, Publicités & Affiches en Direct
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Diffusez une vidéo, sponsor ou diapositive à tout moment dans le live, puis reprenez le direct.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl border border-zinc-700 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-rose-400" />
            <span>Importer depuis ma galerie</span>
          </button>
        </div>
      </div>

      {/* Return to Live Camera notification when on air */}
      {isMediaCurrentlyBroadcasting && (
        <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <div>
              <p className="text-xs font-bold text-rose-200">
                Média / Publicité en Plein Écran (Retour automatique au direct à la fin)
              </p>
              <p className="text-[11px] text-rose-300/80">
                La vidéo s'affiche seule sur le programme. Le live reviendra automatiquement une fois terminée.
              </p>
            </div>
          </div>
          <button
            onClick={onReturnToLiveCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Couper et revenir au direct</span>
          </button>
        </div>
      )}

      {/* Parallel PiP active banner */}
      {parallelMediaId && (
        <div className="mb-4 p-3 bg-purple-950/40 border border-purple-500/50 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-purple-200">
                Vidéo / Publicité en Parallèle (PiP) Active
              </p>
              <p className="text-[11px] text-purple-300/80">
                Diffusée dans un encart pendant que votre caméra et micro continuent en direct simultanément.
              </p>
            </div>
          </div>
          <button
            onClick={onStopParallelMedia}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Arrêter l'encart PiP</span>
          </button>
        </div>
      )}

      {uploadNotice && (
        <div className="mb-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-3.5 h-3.5" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-2.5 py-1 rounded-lg transition ${
            filterType === 'all' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Tous ({mediaAssets.length})
        </button>
        <button
          onClick={() => setFilterType('video')}
          className={`px-2.5 py-1 rounded-lg transition ${
            filterType === 'video' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Vidéos & Pubs ({mediaAssets.filter((m) => m.type === 'video').length})
        </button>
        <button
          onClick={() => setFilterType('image')}
          className={`px-2.5 py-1 rounded-lg transition ${
            filterType === 'image' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Affiches & Diapos ({mediaAssets.filter((m) => m.type === 'image').length})
        </button>
      </div>

      {/* Grid of media items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {filtered.map((item) => {
          const isSoloActive = activeMediaId === item.id && isMediaCurrentlyBroadcasting;
          const isParallelActive = parallelMediaId === item.id;
          return (
            <div
              key={item.id}
              className={`group relative rounded-xl border p-2.5 bg-zinc-950/70 transition flex flex-col justify-between ${
                isSoloActive
                  ? 'border-rose-500 bg-rose-950/20 shadow-md shadow-rose-950/30'
                  : isParallelActive
                  ? 'border-purple-500 bg-purple-950/20 shadow-md shadow-purple-950/30'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Media thumbnail or preview */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 mb-2">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                      <Film className="w-6 h-6" />
                    </div>
                  )}

                  <div className="absolute top-1.5 left-1.5 flex gap-1">
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${
                      item.isAd ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900/90 text-zinc-300'
                    }`}>
                      {item.isAd ? 'Publicité' : item.type === 'video' ? 'Vidéo' : 'Affiche'}
                    </span>
                    {isParallelActive && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-600 text-white animate-pulse">
                        PiP En direct
                      </span>
                    )}
                    {isSoloActive && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-600 text-white animate-pulse">
                        Solo En direct
                      </span>
                    )}
                  </div>

                  {item.duration && (
                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1 py-0.5 text-[9px] font-mono text-zinc-200 rounded">
                      {item.duration}s
                    </div>
                  )}
                </div>

                <p className="text-xs font-semibold text-zinc-200 truncate">{item.name}</p>
              </div>

              {/* Action Buttons: Parallèle or Solo with Auto-Return */}
              <div className="mt-2.5 pt-2 border-t border-zinc-800/80 space-y-1.5">
                {isSoloActive ? (
                  <button
                    onClick={onReturnToLiveCamera}
                    className="w-full py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Couper & Revenir au Direct</span>
                  </button>
                ) : isParallelActive ? (
                  <button
                    onClick={onStopParallelMedia}
                    className="w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-lg transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Arrêter la vidéo PiP</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Mode 1: Parallèle (PiP) */}
                    <button
                      onClick={() => onSelectMediaToBroadcastParallel(item)}
                      title="Diffuse cette vidéo dans un encart PiP pendant que vous continuez à parler en direct"
                      className="py-1.5 px-1.5 bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-200 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer border border-zinc-700/80 hover:border-purple-500"
                    >
                      <PictureInPicture className="w-3 h-3 text-purple-400" />
                      <span>En Parallèle</span>
                    </button>

                    {/* Mode 2: Solo avec retour automatique au direct */}
                    <button
                      onClick={() => onSelectMediaToBroadcastSolo(item, item.duration || 15)}
                      title="La vidéo prend l'écran seul, puis le live revient automatiquement à la caméra quand elle finit"
                      className="py-1.5 px-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer shadow"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Plein Écran</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
