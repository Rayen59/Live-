export type UserRole = 'creator' | 'moderator' | 'viewer' | 'admin';

export interface User {
  id: string;
  email: string; // Unique per user
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  role: UserRole;
  isBanned?: boolean;
  channelBanner?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

export type StreamCategory =
  | 'Gaming'
  | 'Tech & Dev'
  | 'Musique'
  | 'Éducation'
  | 'Talk Show'
  | 'Business'
  | 'Créatif & Art'
  | 'Divertissement';

export type VideoSourceType = 'camera' | 'screen' | 'media' | 'poster';

export interface VideoFilterSettings {
  brightness: number; // 50 to 150 %
  contrast: number; // 50 to 150 %
  saturation: number; // 0 to 200 %
  clarity: number; // 0 to 100 % (sharpness enhancer)
  blur: number; // 0 to 20 px
  isMirrored: boolean;
  resolution: '1080p' | '720p' | '480p';
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'video' | 'image';
  url: string;
  duration?: number; // in seconds for videos
  thumbnail?: string;
  isAd?: boolean;
}

export interface MicRequest {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'declined';
  isMuted?: boolean;
  audioLevel?: number; // 0 to 100 for visualizer
}

export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  username: string;
  avatar: string;
  role: UserRole;
  text: string;
  timestamp: string;
  isPinned?: boolean;
  isFlaggedByAI?: boolean;
  aiToxicityReason?: string;
  isSuperChat?: boolean;
  tipAmount?: number;
}

export interface LiveStream {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  category: StreamCategory;
  tags: string[];
  thumbnail: string;
  isLive: boolean;
  startedAt: string;
  viewerCount: number;
  activeSource: VideoSourceType;
  currentMediaId?: string;
  activeBannerText?: string;
  lowerThirdTitle?: string;
  lowerThirdSubtitle?: string;
  isSlowMode?: boolean;
  slowModeSeconds?: number;
  isSubOnly?: boolean;
  isRecording?: boolean;
  recordingStartTime?: string;
  parallelMediaId?: string; // Broadcast ad in parallel (Picture-in-Picture)
  parallelMediaUrl?: string; // Direct URL for real-time viewer playback
  parallelMediaName?: string;
  parallelMediaType?: 'video' | 'image';
  parallelMediaMode?: 'pip' | 'split' | null;
  currentMediaUrl?: string; // Direct URL for solo ad/media
  currentMediaType?: 'video' | 'image';
  adSoloCountdown?: number; // Countdown when ad is broadcasting solo
  adAutoReturnTargetSource?: VideoSourceType; // Source to return to automatically
  aspectRatio?: '16:9' | '9:16'; // 16:9 (Desktop) or 9:16 (Format Smartphone)
  cameraFacingMode?: 'user' | 'environment'; // Caméra avant (selfie) ou arrière
  isTickerActive?: boolean; // TV crawling news ticker running or paused/stopped
  tickerSpeed?: 'normal' | 'slow' | 'fast'; // TV ticker speed
  sponsorVideoUrl?: string; // Pre-selected sponsor / marketing video from gallery
  sponsorVideoTitle?: string;
}

export interface RecordedVideo {
  id: string;
  streamId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  category: StreamCategory;
  duration: number; // seconds
  recordedAt: string;
  thumbnail: string;
  videoUrl?: string; // blob url or mock video stream
  viewsCount: number;
  sizeBytes?: number;
  aiSummary?: string;
  aiKeyMoments?: string[];
  tags: string[];
  trimStart?: number;
  trimEnd?: number;
  cuts?: { id: string; start: number; end: number; reason?: string }[];
}

export interface ModerationLog {
  id: string;
  action: 'ban' | 'unban' | 'timeout' | 'delete_msg' | 'mute_mic';
  targetUserId?: string;
  targetUsername?: string;
  moderatorName: string;
  reason: string;
  timestamp: string;
}

export interface AICopilotMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionType?: string;
}
