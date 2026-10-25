import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Settings, 
  Share2, 
  Sliders, 
  Layers, 
  Film, 
  Mic, 
  BrainCircuit, 
  Eye, 
  Edit3, 
  Check, 
  CircleDot, 
  Play, 
  Square,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { 
  User, 
  LiveStream, 
  VideoFilterSettings, 
  VideoSourceType, 
  MediaAsset, 
  MicRequest, 
  ChatMessage, 
  RecordedVideo 
} from '../../types';
import { VideoOutputCanvas } from './VideoOutputCanvas';
import { VideoClarityControls } from './VideoClarityControls';
import { SourceSwitcher } from './SourceSwitcher';
import { MediaAdManager } from './MediaAdManager';
import { MicRequestsManager } from './MicRequestsManager';
import { AICopilotPanel } from './AICopilotPanel';
import { LiveChat } from '../Chat/LiveChat';
import { ModerationModal } from '../Chat/ModerationModal';
import { DevicePairingModal } from '../DevicePairingModal';
import { StorageService } from '../../services/storage';

interface StudioContainerProps {
  currentUser: User;
  allUsers: User[];
  activeStream?: LiveStream | null;
  onUpdateStream: (updated: Partial<LiveStream>) => void;
  onEndLiveStream: () => void;
  onRecordingSaved: (video: RecordedVideo) => void;
}

export const StudioContainer: React.FC<StudioContainerProps> = ({
  currentUser,
  allUsers,
  activeStream,
  onUpdateStream,
  onEndLiveStream,
  onRecordingSaved,
}) => {
  // Safe effective stream if empty
  const currentStream: LiveStream = activeStream || {
    id: `stream_studio_${currentUser.id}`,
    creatorId: currentUser.id,
    creatorName: currentUser.username,
    creatorAvatar: currentUser.avatar,
    title: `Direct de ${currentUser.name}`,
    description: 'Diffusion en direct interactive StreamPulse.',
    category: 'Tech & Dev',
    tags: ['Direct', 'Live'],
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    isLive: true,
    startedAt: new Date().toISOString(),
    viewerCount: 1,
    activeSource: 'camera',
    activeBannerText: `🔴 DIRECT DE ${currentUser.name.toUpperCase()} · Micro ouvert`,
    lowerThirdTitle: `Direct de ${currentUser.name}`,
    lowerThirdSubtitle: `${currentUser.name} · Studio Live`,
  };
  // Video filter settings state
  const [filterSettings, setFilterSettings] = useState<VideoFilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    clarity: 45,
    blur: 0,
    isMirrored: false,
    resolution: '1080p',
  });

  // Source switcher state
  const [activeSource, setActiveSource] = useState<VideoSourceType>(currentStream.activeSource || 'camera');
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  // Media gallery & Ads
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(StorageService.getMediaAssets());
  const [activeMediaId, setActiveMediaId] = useState<string | undefined>(currentStream.currentMediaId);
  const [parallelMediaId, setParallelMediaId] = useState<string | undefined>(currentStream.parallelMediaId);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);

  // Mic Requests & On-air guest speakers
  const [micRequests, setMicRequests] = useState<MicRequest[]>([]);

  // Live Chat messages state
  const [messages, setMessages] = useState<ChatMessage[]>(StorageService.getChatMessages(currentStream.id));
  const [isAutoModEnabled, setIsAutoModEnabled] = useState(true);

  // Overlays state
  const [lowerThirdTitle, setLowerThirdTitle] = useState(currentStream.lowerThirdTitle || currentStream.title);
  const [lowerThirdSubtitle, setLowerThirdSubtitle] = useState(currentStream.lowerThirdSubtitle || `${currentUser.name} · En direct`);
  const [bannerTickerText, setBannerTickerText] = useState(currentStream.activeBannerText || '🔴 DIRECT STREAMING · Posez vos questions et demandez la parole !');
  const [isEditingOverlays, setIsEditingOverlays] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(!!currentStream.isRecording);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Moderation Modal
  const [isModModalOpen, setIsModModalOpen] = useState(false);

  // Studio tabs for side panels
  const [activeStudioTab, setActiveStudioTab] = useState<'clarity' | 'sources' | 'media' | 'mics' | 'ai'>('clarity');

  // Increment recording duration timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleToggleRecording = () => {
    const nextState = !isRecording;
    setIsRecording(nextState);
    if (!nextState) {
      setRecordingSeconds(0);
    }
    onUpdateStream({ isRecording: nextState });
  };

  // Broadcast media solo (takes full program output, auto-returns to live camera after countdown or on finish)
  const handleSelectMediaSolo = (asset: MediaAsset, duration?: number) => {
    setActiveMediaId(asset.id);
    const newSource: VideoSourceType = asset.type === 'video' ? 'media' : 'poster';
    setActiveSource(newSource);
    onUpdateStream({
      activeSource: newSource,
      currentMediaId: asset.id,
      adSoloCountdown: duration || 15,
      adAutoReturnTargetSource: 'camera',
    });
  };

  // Broadcast media in parallel (Picture-in-Picture window inside the live broadcast while live camera stays active)
  const handleSelectMediaParallel = (asset: MediaAsset) => {
    setParallelMediaId(asset.id);
    onUpdateStream({
      parallelMediaId: asset.id,
      parallelMediaMode: 'pip',
    });
  };

  // Stop parallel media broadcast
  const handleStopParallelMedia = () => {
    setParallelMediaId(undefined);
    onUpdateStream({
      parallelMediaId: undefined,
      parallelMediaMode: null,
    });
  };

  // Return to live camera (from solo media or poster)
  const handleReturnToLiveCamera = () => {
    setActiveSource('camera');
    setActiveMediaId(undefined);
    onUpdateStream({
      activeSource: 'camera',
      currentMediaId: undefined,
      adSoloCountdown: undefined,
    });
  };

  const handleAcceptMic = (reqId: string) => {
    setMicRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'accepted', isMuted: false } : r))
    );
  };

  const handleDeclineMic = (reqId: string) => {
    setMicRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleToggleMuteSpeaker = (reqId: string) => {
    setMicRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, isMuted: !r.isMuted } : r))
    );
  };

  const handleRemoveSpeaker = (reqId: string) => {
    setMicRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleSendMessage = (text: string, isSuperChat?: boolean, tipAmount?: number) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      streamId: currentStream.id,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      role: currentUser.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSuperChat,
      tipAmount,
    };
    StorageService.saveChatMessage(newMsg);
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleDeleteMessage = (msgId: string) => {
    StorageService.deleteChatMessage(currentStream.id, msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  const handlePinMessage = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => ({
        ...m,
        isPinned: m.id === msgId ? !m.isPinned : false,
      }))
    );
  };

  const handleBanUser = (targetUserId: string, reason: string) => {
    const target = allUsers.find((u) => u.id === targetUserId);
    if (target) {
      target.isBanned = true;
      StorageService.updateUser(target);
      alert(`L'utilisateur @${target.username} a été banni.`);
    }
  };

  const activeMedia = mediaAssets.find((m) => m.id === activeMediaId);
  const activeSpeakers = micRequests.filter((r) => r.status === 'accepted');

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {currentStream.title}
              </h1>
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md text-[11px] font-bold uppercase">
                En direct
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Diffuseur : <strong className="text-zinc-200">{currentUser.name}</strong> · Catégorie :{' '}
              <span className="text-rose-400 font-medium">{currentStream.category}</span>
            </p>
          </div>
        </div>

        {/* End Stream, Mobile Liaison & Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPairingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-600/30 to-purple-600/30 hover:from-rose-600/50 hover:to-purple-600/50 text-white text-xs font-semibold rounded-xl border border-rose-500/40 transition cursor-pointer shadow"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Liaison Mobile & Télécommande</span>
          </button>

          <button
            onClick={() => setIsEditingOverlays(!isEditingOverlays)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Titres & Bandeaux</span>
          </button>

          <button
            onClick={onEndLiveStream}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Arrêter le Live</span>
          </button>
        </div>
      </div>

      {/* Overlay Text Customizer Drawer */}
      {isEditingOverlays && (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Titre Bandeau Inférieur (Lower-Third)
            </label>
            <input
              type="text"
              value={lowerThirdTitle}
              onChange={(e) => setLowerThirdTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Sous-titre / Fonction
            </label>
            <input
              type="text"
              value={lowerThirdSubtitle}
              onChange={(e) => setLowerThirdSubtitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Texte Défilant Bas d'Écran (Ticker Info)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bannerTickerText}
                onChange={(e) => setBannerTickerText(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-white"
              />
              <button
                onClick={() => {
                  onUpdateStream({
                    lowerThirdTitle,
                    lowerThirdSubtitle,
                    activeBannerText: bannerTickerText,
                  });
                  setIsEditingOverlays(false);
                }}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Grid: Video Monitor + Control Rack + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Broadcast Program Output & Controls Rack (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Real-time Program Canvas */}
          <VideoOutputCanvas
            streamTitle={currentStream.title}
            category={currentStream.category}
            creatorName={currentUser.name}
            activeSource={activeSource}
            filterSettings={filterSettings}
            activeMedia={activeMedia}
            parallelMedia={mediaAssets.find((m) => m.id === parallelMediaId)}
            onStopParallelMedia={handleStopParallelMedia}
            onReturnToLiveCamera={handleReturnToLiveCamera}
            activeSpeakers={activeSpeakers}
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
            recordingDuration={recordingSeconds}
            bannerTickerText={bannerTickerText}
            lowerThirdTitle={lowerThirdTitle}
            lowerThirdSubtitle={lowerThirdSubtitle}
            viewerCount={currentStream.viewerCount}
            onRecordingSaved={onRecordingSaved}
          />

          {/* Source Switcher Quick Bar */}
          <SourceSwitcher
            activeSource={activeSource}
            onChangeSource={(src) => {
              setActiveSource(src);
              onUpdateStream({ activeSource: src });
            }}
            isSharingScreen={isSharingScreen}
            onStartScreenShare={() => {
              setIsSharingScreen(true);
              setActiveSource('screen');
              onUpdateStream({ activeSource: 'screen' });
            }}
            onStopScreenShare={() => {
              setIsSharingScreen(false);
              setActiveSource('camera');
              onUpdateStream({ activeSource: 'camera' });
            }}
          />

          {/* Interactive Studio Control Console Tabs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 text-xs flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveStudioTab('clarity')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 font-semibold transition cursor-pointer ${
                activeStudioTab === 'clarity'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>Clarté & Filtres Vidéo</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('media')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 font-semibold transition cursor-pointer ${
                activeStudioTab === 'media'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Film className="w-4 h-4 text-purple-400" />
              <span>Vidéos & Publicités ({mediaAssets.length})</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('mics')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 font-semibold transition cursor-pointer relative ${
                activeStudioTab === 'mics'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Micros Spectateurs</span>
              {micRequests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
              )}
            </button>

            <button
              onClick={() => setActiveStudioTab('ai')}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 font-semibold transition cursor-pointer ${
                activeStudioTab === 'ai'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <span>Régie IA Copilot</span>
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div>
            {activeStudioTab === 'clarity' && (
              <VideoClarityControls
                filters={filterSettings}
                setFilters={setFilterSettings}
              />
            )}

            {activeStudioTab === 'media' && (
              <MediaAdManager
                mediaAssets={mediaAssets}
                setMediaAssets={setMediaAssets}
                activeMediaId={activeMediaId}
                parallelMediaId={parallelMediaId}
                onSelectMediaToBroadcastSolo={handleSelectMediaSolo}
                onSelectMediaToBroadcastParallel={handleSelectMediaParallel}
                onStopParallelMedia={handleStopParallelMedia}
                activeSource={activeSource}
                onReturnToLiveCamera={handleReturnToLiveCamera}
              />
            )}

            {activeStudioTab === 'mics' && (
              <MicRequestsManager
                micRequests={micRequests}
                onAcceptRequest={handleAcceptMic}
                onDeclineRequest={handleDeclineMic}
                onToggleMuteSpeaker={handleToggleMuteSpeaker}
                onRemoveSpeaker={handleRemoveSpeaker}
              />
            )}

            {activeStudioTab === 'ai' && (
              <AICopilotPanel
                stream={currentStream}
                chatMessages={messages}
                isAutoModEnabled={isAutoModEnabled}
                setIsAutoModEnabled={setIsAutoModEnabled}
              />
            )}
          </div>
        </div>

        {/* Right Column: Live Chat & Moderation (4 cols) */}
        <div className="lg:col-span-4 h-[720px] sticky top-20">
          <LiveChat
            stream={currentStream}
            currentUser={currentUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onPinMessage={handlePinMessage}
            isAutoModEnabled={isAutoModEnabled}
            onOpenModerationModal={() => setIsModModalOpen(true)}
          />
        </div>
      </div>

      {/* Moderation Suite Modal */}
      <ModerationModal
        isOpen={isModModalOpen}
        onClose={() => setIsModModalOpen(false)}
        stream={currentStream}
        onUpdateStream={onUpdateStream}
        currentUser={currentUser}
        allUsers={allUsers}
        onBanUser={handleBanUser}
      />

      {/* Real-time PC & Mobile Liaison Modal */}
      <DevicePairingModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        currentUser={currentUser}
        activeStream={currentStream}
      />
    </div>
  );
};
