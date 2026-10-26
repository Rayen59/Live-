import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Scissors, 
  Download, 
  Share2, 
  Trash2, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Film, 
  Clock, 
  Eye, 
  Plus, 
  FastForward, 
  Rewind,
  Save,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { RecordedVideo, StreamCategory } from '../../types';

interface CutSegment {
  id: string;
  start: number;
  end: number;
  reason?: string;
}

interface VideoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: RecordedVideo | null;
  onSaveToProfile: (editedVideo: RecordedVideo) => void;
  onDownloadToDevice: (video: RecordedVideo) => void;
}

const CATEGORIES: StreamCategory[] = [
  'Tech & Dev',
  'Gaming',
  'Musique',
  'Éducation',
  'Talk Show',
  'Business',
  'Créatif & Art',
  'Divertissement',
];

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({
  isOpen,
  onClose,
  video,
  onSaveToProfile,
  onDownloadToDevice,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration || 45);

  // Edit fields
  const [title, setTitle] = useState(video?.title || '');
  const [description, setDescription] = useState(video?.description || '');
  const [category, setCategory] = useState<StreamCategory>(video?.category || 'Tech & Dev');

  // Trimming start & end
  const [trimStart, setTrimStart] = useState<number>(video?.trimStart || 0);
  const [trimEnd, setTrimEnd] = useState<number>(video?.trimEnd || video?.duration || 45);

  // Cuts / Excluded moments list
  const [cuts, setCuts] = useState<CutSegment[]>(video?.cuts || []);
  const [newCutStart, setNewCutStart] = useState(0);
  const [newCutEnd, setNewCutEnd] = useState(5);
  const [newCutReason, setNewCutReason] = useState('Moment blanc / Erreur');
  const [isAddingCut, setIsAddingCut] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || '');
      setCategory(video.category);
      setDuration(video.duration || 45);
      setTrimStart(video.trimStart || 0);
      setTrimEnd(video.trimEnd || video.duration || 45);
      setCuts(video.cuts || []);
      setCurrentTime(0);
    }
  }, [video]);

  if (!isOpen || !video) return null;

  const effectiveVideoUrl = video.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Video Time Update with auto-skipping of cut segments
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // If past trimEnd, loop back to trimStart
    if (cur >= trimEnd) {
      videoRef.current.currentTime = trimStart;
      return;
    }

    // Auto-skip cuts during preview playback
    for (const cut of cuts) {
      if (cur >= cut.start && cur < cut.end) {
        videoRef.current.currentTime = cut.end;
        break;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      const dur = Math.floor(videoRef.current.duration);
      setDuration(dur);
      if (trimEnd === 0 || trimEnd > dur) {
        setTrimEnd(dur);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < trimStart || videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    const next = Math.max(trimStart, Math.min(trimEnd, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const handleSeek = (newVal: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newVal;
    setCurrentTime(newVal);
  };

  const handleAddCut = () => {
    if (newCutEnd <= newCutStart) {
      alert('La fin du segment à supprimer doit être supérieure au début.');
      return;
    }
    const newCut: CutSegment = {
      id: `cut_${Date.now()}`,
      start: Math.max(0, newCutStart),
      end: Math.min(duration, newCutEnd),
      reason: newCutReason.trim() || 'Suppression d’un instant',
    };
    setCuts([...cuts, newCut]);
    setIsAddingCut(false);
  };

  const handleRemoveCut = (id: string) => {
    setCuts(cuts.filter((c) => c.id !== id));
  };

  // Compute total duration after trimming and cuts
  const totalCutsDuration = cuts.reduce((acc, c) => acc + (c.end - c.start), 0);
  const finalDuration = Math.max(1, Math.floor((trimEnd - trimStart) - totalCutsDuration));

  // Save to Profile
  const handleSaveProfile = () => {
    const updated: RecordedVideo = {
      ...video,
      title: title.trim() || video.title,
      description: description.trim(),
      category,
      duration: finalDuration,
      trimStart,
      trimEnd,
      cuts,
    };
    onSaveToProfile(updated);
    setSavedSuccess('Vidéo modifiée et publiée avec succès sur votre profil !');
    setTimeout(() => {
      setSavedSuccess(null);
      onClose();
    }, 1800);
  };

  // Download directly to Device Storage
  const handleDownload = () => {
    const updated: RecordedVideo = {
      ...video,
      title: title.trim() || video.title,
      duration: finalDuration,
      trimStart,
      trimEnd,
      cuts,
    };
    onDownloadToDevice(updated);

    // Direct browser trigger
    const link = document.createElement('a');
    link.href = effectiveVideoUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'session_live'}_editee.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSavedSuccess('Téléchargement lancé sur votre appareil !');
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl text-zinc-100 flex flex-col my-auto max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/90">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Régie d'Édition & Découpage Vidéo</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
                  {formatTime(finalDuration)} final
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Supprimez les temps morts ou erreurs, ajustez la durée et partagez sur votre profil ou votre appareil.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {savedSuccess && (
          <div className="mx-5 mt-3 p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl flex items-center gap-2 text-xs text-emerald-200 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{savedSuccess}</span>
          </div>
        )}

        {/* Editor Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Main Video Monitor */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center shadow-inner group">
            <video
              ref={videoRef}
              src={effectiveVideoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              playsInline
              className="w-full h-full object-contain"
            />

            {/* Floating Play Overlay Button */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl transition cursor-pointer active:scale-95 z-20"
              >
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </button>
            )}

            {/* Timestamp Badge */}
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-mono text-[11px] z-20 border border-white/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>

          {/* Interactive Scrub Timeline & Trim Controls */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <span>Début: <strong className="text-purple-300">{formatTime(trimStart)}</strong></span>
                <span>•</span>
                <span>Fin: <strong className="text-purple-300">{formatTime(trimEnd)}</strong></span>
              </div>
              <span className="text-emerald-400 font-bold">
                Durée conservée : {formatTime(finalDuration)}
              </span>
            </div>

            {/* Custom Interactive Timeline Range */}
            <div className="relative h-7 bg-zinc-900 rounded-xl overflow-hidden flex items-center border border-zinc-700/80 px-1">
              {/* Highlight of trimmed region */}
              <div
                className="absolute top-0 bottom-0 bg-purple-600/30 border-x-2 border-purple-400"
                style={{
                  left: `${(trimStart / (duration || 1)) * 100}%`,
                  width: `${((trimEnd - trimStart) / (duration || 1)) * 100}%`,
                }}
              />

              {/* Red Highlights of Deleted Cut Moments */}
              {cuts.map((cut) => (
                <div
                  key={cut.id}
                  className="absolute top-0 bottom-0 bg-red-600/60 border-x border-red-400 z-10 flex items-center justify-center"
                  style={{
                    left: `${(cut.start / (duration || 1)) * 100}%`,
                    width: `${((cut.end - cut.start) / (duration || 1)) * 100}%`,
                  }}
                  title={`Coupé : ${formatTime(cut.start)} - ${formatTime(cut.end)} (${cut.reason})`}
                >
                  <span className="text-[9px] text-white font-bold">✂️</span>
                </div>
              ))}

              {/* Native scrub range */}
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full relative z-20 accent-purple-500 cursor-pointer h-2 bg-transparent"
              />
            </div>

            {/* Transport & Trim Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => seekRelative(-5)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Reculer de 5s"
                >
                  <Rewind className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Lecture'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => seekRelative(5)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Avancer de 5s"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              </div>

              {/* Set Trim In / Out points */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTrimStart(currentTime)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg transition cursor-pointer font-semibold text-[11px]"
                >
                  📍 Débuter ici ({formatTime(currentTime)})
                </button>
                <button
                  type="button"
                  onClick={() => setTrimEnd(currentTime)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg transition cursor-pointer font-semibold text-[11px]"
                >
                  🏁 Terminer ici ({formatTime(currentTime)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTrimStart(0);
                    setTrimEnd(duration);
                  }}
                  className="p-1 text-zinc-400 hover:text-white transition"
                  title="Réinitialiser les bornes"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Cut/Delete Moments from Video Section */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-red-400" />
                <span className="font-bold text-zinc-200 text-xs">
                  Supprimer des instants de la vidéo ({cuts.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewCutStart(Math.floor(currentTime));
                  setNewCutEnd(Math.min(duration, Math.floor(currentTime) + 10));
                  setIsAddingCut(!isAddingCut);
                }}
                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Couper un instant</span>
              </button>
            </div>

            {/* Cut Creation Form */}
            {isAddingCut && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl space-y-2 animate-in fade-in">
                <p className="text-[11px] text-red-200 font-medium">
                  Définissez l'intervalle à retirer définitivement de la vidéo finale :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Seconde de début :</label>
                    <input
                      type="number"
                      min={0}
                      max={duration}
                      value={newCutStart}
                      onChange={(e) => setNewCutStart(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Seconde de fin :</label>
                    <input
                      type="number"
                      min={0}
                      max={duration}
                      value={newCutEnd}
                      onChange={(e) => setNewCutEnd(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Motif du découpage :</label>
                    <input
                      type="text"
                      value={newCutReason}
                      onChange={(e) => setNewCutReason(e.target.value)}
                      placeholder="Ex: Silence, bafouillage"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingCut(false)}
                    className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCut}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    Valider la coupure
                  </button>
                </div>
              </div>
            )}

            {/* List of active cuts */}
            {cuts.length === 0 ? (
              <p className="text-[11px] text-zinc-500 italic">
                Aucun instant supprimé. La vidéo sera conservée du début à la fin.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {cuts.map((cut, idx) => (
                  <div
                    key={cut.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-red-600/30 text-red-300 font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-red-300 font-bold">
                        {formatTime(cut.start)} ➔ {formatTime(cut.end)}
                      </span>
                      <span className="text-zinc-400 text-[11px]">({cut.reason})</span>
                      <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded font-mono">
                        -{cut.end - cut.start}s
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSeek(cut.start)}
                        className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px]"
                      >
                        Voir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCut(cut.id)}
                        className="p-1 text-zinc-400 hover:text-red-400 rounded transition cursor-pointer"
                        title="Annuler cette coupure"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata Editing: Title, Description, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">
                Titre de la vidéo modifiée *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du replay..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StreamCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">
                Description & Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails du direct, chapitres, liens..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions: Save to Profile & Download to Device */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400">
            Export : <strong className="text-white">Format MP4/WebM 1080p</strong> · Durée finale :{' '}
            <strong className="text-purple-300">{formatTime(finalDuration)}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Download to Device Storage */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold border border-zinc-700 transition cursor-pointer shadow"
              title="Enregistrer la vidéo sur la mémoire de votre téléphone ou votre PC"
            >
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Enregistrer sur mon appareil</span>
            </button>

            {/* Save & Publish to Profile */}
            <button
              type="button"
              onClick={handleSaveProfile}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition cursor-pointer shadow-lg shadow-purple-950/50"
              title="Partager et publier sur mon profil / ma chaîne"
            >
              <Share2 className="w-4 h-4" />
              <span>Partager sur mon profil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
