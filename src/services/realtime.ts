import { ChatMessage, LiveStream, MicRequest, User } from '../types';

export type RealtimeEventHandler = (data: any) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<RealtimeEventHandler>> = new Map();
  private reconnectTimer: any = null;
  private queue: string[] = [];
  private currentRoom: { streamId: string; role: 'broadcaster' | 'viewer'; user: User } | null = null;
  private isConnecting = false;

  constructor() {
    this.connect();
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        console.log('[Realtime] WebSocket connecté avec succès');
        // Re-join active room if previously registered
        if (this.currentRoom) {
          this.join(this.currentRoom.streamId, this.currentRoom.role, this.currentRoom.user);
        }

        // Flush pending queue
        while (this.queue.length > 0) {
          const msg = this.queue.shift();
          if (msg && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(msg);
          }
        }

        this.emit('connection_status', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.type) {
            this.emit(payload.type, payload);
          }
        } catch (err) {
          console.warn('[Realtime] Erreur parsing message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.emit('connection_status', { connected: false });
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[Realtime] Erreur WebSocket:', err);
        this.isConnecting = false;
      };
    } catch (e) {
      console.warn('[Realtime] Impossible d’initialiser WebSocket:', e);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 1500);
  }

  public on(eventType: string, handler: RealtimeEventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);

    return () => {
      this.listeners.get(eventType)?.delete(handler);
    };
  }

  public emit(eventType: string, data: any) {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (err) {
          console.error(`[Realtime] Erreur dans handler pour ${eventType}:`, err);
        }
      });
    }
  }

  private send(obj: any) {
    const raw = JSON.stringify(obj);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(raw);
    } else {
      if (this.queue.length < 50) {
        this.queue.push(raw);
      }
      this.connect();
    }
  }

  public join(streamId: string, role: 'broadcaster' | 'viewer', user: User) {
    this.currentRoom = { streamId, role, user };
    this.send({
      type: 'join',
      streamId,
      role,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    });
  }

  public leave(streamId: string, userId: string) {
    if (this.currentRoom?.streamId === streamId) {
      this.currentRoom = null;
    }
    this.send({
      type: 'leave',
      streamId,
      userId,
    });
  }

  public sendChatMessage(streamId: string, message: ChatMessage) {
    this.send({
      type: 'chat_message',
      streamId,
      message,
    });
  }

  public sendStreamUpdate(streamId: string, data: Partial<LiveStream>) {
    this.send({
      type: 'stream_update',
      streamId,
      data,
    });
  }

  public sendMicRequest(streamId: string, request: MicRequest) {
    this.send({
      type: 'mic_request',
      streamId,
      request,
    });
  }

  public sendMicAction(
    streamId: string,
    action: 'request' | 'accept' | 'decline' | 'mute' | 'remove',
    requestId: string,
    isMuted?: boolean
  ) {
    this.send({
      type: 'mic_action',
      streamId,
      action,
      requestId,
      isMuted,
    });
  }

  public sendWebRTCSignal(streamId: string, targetId: string, senderId: string, signal: any) {
    this.send({
      type: 'webrtc_signal',
      streamId,
      targetId,
      senderId,
      signal,
    });
  }

  public sendVideoFrame(streamId: string, frame: string) {
    this.send({
      type: 'video_frame',
      streamId,
      frame,
    });
  }
}

export const realtime = new RealtimeClient();
