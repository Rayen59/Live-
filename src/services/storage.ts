import { User, LiveStream, RecordedVideo, ChatMessage, ModerationLog, MediaAsset } from '../types';

// V3 storage keys starting 100% clean and virgin (zero users)
const USERS_KEY = 'streampulse_users_v3_clean';
const CURRENT_USER_KEY = 'streampulse_current_user_v3_clean';
const STREAMS_KEY = 'streampulse_streams_v3_clean';
const RECORDINGS_KEY = 'streampulse_recordings_v3_clean';
const CHAT_KEY = 'streampulse_chat_v3_clean';
const MOD_LOGS_KEY = 'streampulse_mod_logs_v3_clean';
const MEDIA_KEY = 'streampulse_media_v3_clean';

// Default media clips for studio testing
const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'media_ad_1',
    name: 'Spot Publicitaire StreamPulse Pro (Vidéo)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=400&auto=format&fit=crop&q=80',
    duration: 15,
    isAd: true,
  },
  {
    id: 'media_ad_2',
    name: 'Bannière Sponsorisée TechGear 2026 (Affiche)',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    isAd: true,
  },
  {
    id: 'media_slide_1',
    name: 'Diapositive Présentation : Architecture Système',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80',
    isAd: false,
  },
  {
    id: 'media_brb',
    name: 'Écran d’attente "Je reviens dans un instant" (BRB)',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    isAd: false,
  },
];

export const StorageService = {
  // Virgin empty users list (0 users initially)
  getUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (!u || !u.id) return null;
        const all = this.getUsers();
        const found = all.find((x) => x.id === u.id);
        if (found) return found;
      } catch {}
    }
    return null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  // Account Registration with Strict Unique Email validation
  registerUser(data: {
    email: string;
    username: string;
    name: string;
    avatar?: string;
    bio?: string;
    role?: 'creator' | 'viewer' | 'admin';
  }): { success: boolean; user?: User; error?: string } {
    const allUsers = this.getUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    // STRICT UNIQUE EMAIL CHECK (requested specifically by user)
    const existingEmail = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return {
        success: false,
        error: `L'adresse email "${cleanEmail}" est déjà utilisée. Chaque compte doit posséder un email unique.`,
      };
    }

    // Check unique username
    const existingUsername = allUsers.find((u) => u.username.toLowerCase() === data.username.trim().toLowerCase());
    if (existingUsername) {
      return {
        success: false,
        error: `Le nom d'utilisateur "@${data.username}" est déjà pris. Veuillez en choisir un autre.`,
      };
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      username: data.username.trim(),
      name: data.name.trim() || data.username.trim(),
      avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.username)}`,
      bio: data.bio || 'Membre de la communauté StreamPulse.',
      role: data.role || 'creator',
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString(),
      channelBanner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    };

    allUsers.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  },

  loginUser(email: string): { success: boolean; user?: User; error?: string } {
    const allUsers = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        error: `Aucun compte associé à l'adresse "${cleanEmail}". Veuillez créer un compte d'abord.`,
      };
    }
    if (found.isBanned) {
      return {
        success: false,
        error: `Ce compte a été suspendu par un administrateur pour non-respect des règles.`,
      };
    }
    this.setCurrentUser(found);
    return { success: true, user: found };
  },

  logout(): void {
    this.setCurrentUser(null);
  },

  // Reset entire database to blank virgin state
  resetToVirgin(): void {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(STREAMS_KEY);
    localStorage.removeItem(RECORDINGS_KEY);
    localStorage.removeItem(CHAT_KEY);
    localStorage.removeItem(MOD_LOGS_KEY);
  },

  updateUser(updated: User): void {
    const all = this.getUsers();
    const idx = all.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      all[idx] = updated;
      localStorage.setItem(USERS_KEY, JSON.stringify(all));
      const curr = this.getCurrentUser();
      if (curr && curr.id === updated.id) {
        this.setCurrentUser(updated);
      }
    }
  },

  getStreams(): LiveStream[] {
    const raw = localStorage.getItem(STREAMS_KEY);
    if (!raw) {
      localStorage.setItem(STREAMS_KEY, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveStream(stream: LiveStream): void {
    const all = this.getStreams();
    const idx = all.findIndex((s) => s.id === stream.id);
    if (idx !== -1) {
      all[idx] = stream;
    } else {
      all.unshift(stream);
    }
    localStorage.setItem(STREAMS_KEY, JSON.stringify(all));
  },

  deleteStream(streamId: string): void {
    const all = this.getStreams().filter((s) => s.id !== streamId);
    localStorage.setItem(STREAMS_KEY, JSON.stringify(all));
  },

  getRecordings(): RecordedVideo[] {
    const raw = localStorage.getItem(RECORDINGS_KEY);
    if (!raw) {
      localStorage.setItem(RECORDINGS_KEY, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveRecording(video: RecordedVideo): void {
    const all = this.getRecordings();
    all.unshift(video);
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(all));
  },

  deleteRecording(id: string): void {
    const all = this.getRecordings().filter((r) => r.id !== id);
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(all));
  },

  getMediaAssets(): MediaAsset[] {
    const raw = localStorage.getItem(MEDIA_KEY);
    if (!raw) {
      localStorage.setItem(MEDIA_KEY, JSON.stringify(DEFAULT_MEDIA_ASSETS));
      return DEFAULT_MEDIA_ASSETS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MEDIA_ASSETS;
    }
  },

  addMediaAsset(asset: MediaAsset): void {
    const all = this.getMediaAssets();
    all.unshift(asset);
    localStorage.setItem(MEDIA_KEY, JSON.stringify(all));
  },

  getChatMessages(streamId: string): ChatMessage[] {
    const raw = localStorage.getItem(`${CHAT_KEY}_${streamId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  },

  saveChatMessage(message: ChatMessage): void {
    const all = this.getChatMessages(message.streamId);
    all.push(message);
    localStorage.setItem(`${CHAT_KEY}_${message.streamId}`, JSON.stringify(all.slice(-150)));
  },

  deleteChatMessage(streamId: string, messageId: string): void {
    const all = this.getChatMessages(streamId).filter((m) => m.id !== messageId);
    localStorage.setItem(`${CHAT_KEY}_${streamId}`, JSON.stringify(all));
  },

  getModLogs(): ModerationLog[] {
    const raw = localStorage.getItem(MOD_LOGS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addModLog(log: ModerationLog): void {
    const all = this.getModLogs();
    all.unshift(log);
    localStorage.setItem(MOD_LOGS_KEY, JSON.stringify(all.slice(0, 100)));
  },
};
