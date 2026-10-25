import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeFeed } from './components/Home/HomeFeed';
import { StudioContainer } from './components/LiveStudio/StudioContainer';
import { LiveViewer } from './components/LivePlayer/LiveViewer';
import { ChannelPage } from './components/Channel/ChannelPage';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { CreateLiveModal } from './components/CreateLiveModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { DevicePairingModal } from './components/DevicePairingModal';
import { AdminAccessModal } from './components/Admin/AdminAccessModal';
import { EntranceGate } from './components/EntranceGate';
import { StorageService } from './services/storage';
import { User, LiveStream, RecordedVideo } from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Global States: Starts completely blank / virgin (null user)
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(StorageService.getUsers());
  const [allStreams, setAllStreams] = useState<LiveStream[]>(StorageService.getStreams());
  const [allRecordings, setAllRecordings] = useState<RecordedVideo[]>(StorageService.getRecordings());

  // Navigation State: Never starts or automatically routes to admin
  const [activeTab, setActiveTab] = useState<'feed' | 'studio' | 'channel' | 'admin'>('feed');
  const [activeViewingStream, setActiveViewingStream] = useState<LiveStream | null>(null);
  const [selectedChannelUser, setSelectedChannelUser] = useState<User | null>(currentUser);
  const [playingRecording, setPlayingRecording] = useState<RecordedVideo | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateLiveOpen, setIsCreateLiveOpen] = useState(false);
  const [isPairingOpen, setIsPairingOpen] = useState(false);
  const [isAdminAccessModalOpen, setIsAdminAccessModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Cross-device Real-Time Sync (PC & Smartphone connection via Server-Sent Events)
  useEffect(() => {
    // Initial sync from server
    StorageService.syncWithServer().then((data) => {
      if (Array.isArray(data.streams)) setAllStreams(data.streams);
      if (Array.isArray(data.users)) setAllUsers(data.users);
      if (Array.isArray(data.recordings)) setAllRecordings(data.recordings);
    });

    // Check URL parameters for companion mobile pairing (e.g. ?pair=123456)
    const params = new URLSearchParams(window.location.search);
    const pairCode = params.get('pair');
    if (pairCode) {
      StorageService.getPairing(pairCode).then((res) => {
        if (res.success && res.session) {
          showToast(`Liaison smartphone active avec le studio (Code: ${pairCode}) !`);
        }
      });
    }

    // Subscribe to server-sent events for instant sync between PC and phone
    const unsubscribe = StorageService.subscribeToSyncEvents((event) => {
      if (event.type === 'stream_updated' && event.data) {
        setAllStreams((prev) => {
          const exists = prev.some((s) => s.id === event.data.id);
          if (exists) {
            return prev.map((s) => (s.id === event.data.id ? event.data : s));
          }
          return [event.data, ...prev];
        });
      } else if (event.type === 'stream_ended' && event.data?.streamId) {
        setAllStreams((prev) => prev.filter((s) => s.id !== event.data.streamId));
      } else if (event.type === 'user_registered' && event.data) {
        setAllUsers((prev) => {
          if (prev.some((u) => u.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Switch Current User (for multi-role testing)
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
    showToast(`Connecté en tant que ${user.name} (${user.role})`);
  };

  // Logout handler
  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    showToast('Déconnecté de la session.');
  };

  // Wipe database to zero
  const handleResetToVirgin = () => {
    if (!window.confirm('Voulez-vous réinitialiser complètement la plateforme à l’état vierge (0 utilisateur) ?')) return;
    StorageService.resetToVirgin();
    setCurrentUser(null);
    setAllUsers([]);
    setAllStreams([]);
    setAllRecordings([]);
    showToast('Plateforme réinitialisée avec succès (0 utilisateur).');
  };

  // Handle Create Live Stream
  const handleCreateStream = (newStream: LiveStream) => {
    StorageService.saveStream(newStream);
    setAllStreams((prev) => [newStream, ...prev]);
    setActiveTab('studio');
    showToast(`Votre direct "${newStream.title}" a démarré avec succès !`);
  };

  // Handle End Live Stream
  const handleEndLiveStream = () => {
    const active = allStreams[0];
    if (active) {
      StorageService.deleteStream(active.id);
      setAllStreams((prev) => prev.filter((s) => s.id !== active.id));
    }
    setActiveTab('channel');
    showToast('Diffusion en direct terminée.');
  };

  // Handle Saved Recording
  const handleRecordingSaved = (savedVideo: RecordedVideo) => {
    setAllRecordings((prev) => [savedVideo, ...prev]);
    showToast(`Session enregistrée avec succès dans votre chaîne !`);
  };

  // Delete Recording
  const handleDeleteRecording = (id: string) => {
    if (!window.confirm('Voulez-vous supprimer cet enregistrement ?')) return;
    StorageService.deleteRecording(id);
    setAllRecordings((prev) => prev.filter((r) => r.id !== id));
    showToast('Enregistrement supprimé.');
  };

  // View Channel
  const handleViewChannel = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId) || currentUser;
    if (found) {
      setSelectedChannelUser(found);
      setActiveViewingStream(null);
      setActiveTab('channel');
    }
  };

  // MANDATORY ENTRANCE GATE: If no user is logged in (virgin state), display Entrance Gate
  if (!currentUser) {
    return (
      <EntranceGate
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setAllUsers(StorageService.getUsers());
          showToast(`Bienvenue sur StreamPulse AI, ${user.name} !`);
        }}
      />
    );
  }

  const handleAdminUnlocked = () => {
    if (currentUser) {
      const elevated: User = { ...currentUser, role: 'admin' };
      setCurrentUser(elevated);
      StorageService.updateUser(elevated);
    }
    setActiveViewingStream(null);
    setActiveTab('admin');
    showToast('Accès Administration déverrouillé avec succès.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 border border-zinc-700/80 shadow-2xl p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-white animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveViewingStream(null);
          setActiveTab(tab);
          if (tab === 'channel') setSelectedChannelUser(currentUser);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenNewLiveModal={() => setIsCreateLiveOpen(true)}
        onOpenPairingModal={() => setIsPairingOpen(true)}
        onRequestAdminAccess={() => setIsAdminAccessModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        onLogout={handleLogout}
        onResetToVirgin={handleResetToVirgin}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {/* If a stream is being watched in full viewer mode */}
        {activeViewingStream ? (
          <LiveViewer
            stream={activeViewingStream}
            currentUser={currentUser}
            allUsers={allUsers}
            onBack={() => setActiveViewingStream(null)}
            onViewChannel={handleViewChannel}
          />
        ) : (
          <>
            {activeTab === 'feed' && (
              <HomeFeed
                streams={allStreams}
                recordings={allRecordings}
                onSelectStream={(st) => setActiveViewingStream(st)}
                onPlayRecording={(rec) => setPlayingRecording(rec)}
                onOpenCreateLiveModal={() => setIsCreateLiveOpen(true)}
                onViewChannel={handleViewChannel}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'studio' && (
              <StudioContainer
                currentUser={currentUser}
                allUsers={allUsers}
                activeStream={allStreams[0]}
                onUpdateStream={(updated) => {
                  const curr = allStreams[0];
                  if (curr) {
                    const merged = { ...curr, ...updated };
                    StorageService.saveStream(merged);
                    setAllStreams((prev) => [merged, ...prev.slice(1)]);
                  }
                }}
                onEndLiveStream={handleEndLiveStream}
                onRecordingSaved={handleRecordingSaved}
              />
            )}

            {activeTab === 'channel' && (
              <ChannelPage
                user={selectedChannelUser || currentUser}
                currentUser={currentUser}
                recordings={allRecordings}
                onPlayRecording={(rec) => setPlayingRecording(rec)}
                onDeleteRecording={handleDeleteRecording}
                onStartLive={() => setIsCreateLiveOpen(true)}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard
                currentUser={currentUser}
                allUsers={allUsers}
                setAllUsers={setAllUsers}
                allStreams={allStreams}
                setAllStreams={setAllStreams}
                allRecordings={allRecordings}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          handleSwitchUser(user);
          setAllUsers(StorageService.getUsers());
        }}
      />

      <CreateLiveModal
        isOpen={isCreateLiveOpen}
        onClose={() => setIsCreateLiveOpen(false)}
        currentUser={currentUser}
        onCreateStream={handleCreateStream}
      />

      <VideoPlayerModal
        video={playingRecording}
        onClose={() => setPlayingRecording(null)}
        onViewChannel={handleViewChannel}
      />

      {/* Real-Time PC & Mobile Liaison Modal */}
      <DevicePairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        currentUser={currentUser}
        activeStream={allStreams[0]}
      />

      {/* Admin Passcode Gate (Prevents any automatic or accidental entry) */}
      <AdminAccessModal
        isOpen={isAdminAccessModalOpen}
        onClose={() => setIsAdminAccessModalOpen(false)}
        onSuccess={handleAdminUnlocked}
      />
    </div>
  );
};
