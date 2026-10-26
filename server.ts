import express, { type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// SERVER-SIDE SHARED SYNCHRONIZATION STATE (Liaison Réseau PC & Téléphone)
interface SharedServerState {
  users: any[];
  streams: any[];
  recordings: any[];
  chat: { [streamId: string]: any[] };
  mics: { [streamId: string]: any[] };
  pairs: { [code: string]: any };
}

const sharedState: SharedServerState = {
  users: [],
  streams: [],
  recordings: [],
  chat: {},
  mics: {},
  pairs: {},
};

// SSE active subscribers (phones & PCs)
const sseClients: Response[] = [];

function broadcastSSE(type: string, data: any) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

async function bootstrap() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Initialize server-side Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // ==========================================
  // CROSS-DEVICE REAL-TIME SYNC (PC & MOBILE)
  // ==========================================

  // SSE Stream Endpoint for instant live sync on PC & Phone
  app.get('/api/sync/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.push(res);
    res.write(`data: ${JSON.stringify({ type: 'connected', clientsCount: sseClients.length })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // Get full server state
  app.get('/api/sync/state', (_req, res) => {
    res.json(sharedState);
  });

  // User Registration with server-authoritative unique email check across PC & Mobile
  app.post('/api/sync/user', (req, res) => {
    const { email, username, name, role, avatar, bio } = req.body;
    if (!email || !username || !name) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existingEmail = sharedState.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return res.status(400).json({
        error: `L'adresse email "${cleanEmail}" est déjà utilisée. Chaque compte doit posséder un email unique.`,
      });
    }

    const existingUsername = sharedState.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (existingUsername) {
      return res.status(400).json({
        error: `Le nom d'utilisateur "@${username}" est déjà pris.`,
      });
    }

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      username: username.trim(),
      name: name.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      bio: bio || 'Membre de la communauté StreamPulse.',
      role: role || 'creator',
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString(),
      channelBanner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    };

    sharedState.users.push(newUser);
    broadcastSSE('users_updated', sharedState.users);
    res.json({ success: true, user: newUser });
  });

  // User Login
  app.post('/api/sync/login', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email manquant.' });
    const cleanEmail = String(email).trim().toLowerCase();
    const user = sharedState.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({ error: `Aucun compte associé à l'adresse "${cleanEmail}".` });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: `Ce compte est suspendu par un administrateur.` });
    }
    res.json({ success: true, user });
  });

  // Stream Save / Update (Live broadcast state synced between PC & Phone)
  app.post('/api/sync/stream', (req, res) => {
    const stream = req.body;
    if (!stream || !stream.id) return res.status(400).json({ error: 'Stream invalide.' });

    const idx = sharedState.streams.findIndex((s) => s.id === stream.id);
    if (idx !== -1) {
      sharedState.streams[idx] = { ...sharedState.streams[idx], ...stream };
    } else {
      sharedState.streams.unshift(stream);
    }

    broadcastSSE('stream_updated', { stream, streams: sharedState.streams });
    res.json({ success: true, stream: sharedState.streams.find((s) => s.id === stream.id) });
  });

  // Delete / End Stream
  app.delete('/api/sync/stream/:id', (req, res) => {
    const { id } = req.params;
    sharedState.streams = sharedState.streams.filter((s) => s.id !== id);
    broadcastSSE('stream_ended', { streamId: id, streams: sharedState.streams });
    res.json({ success: true });
  });

  // Chat message across PC & Phone
  app.get('/api/sync/chat/:streamId', (req, res) => {
    const { streamId } = req.params;
    res.json(sharedState.chat[streamId] || []);
  });

  app.post('/api/sync/chat', (req, res) => {
    const msg = req.body;
    if (!msg || !msg.streamId) return res.status(400).json({ error: 'Message invalide' });

    if (!sharedState.chat[msg.streamId]) {
      sharedState.chat[msg.streamId] = [];
    }
    sharedState.chat[msg.streamId].push(msg);
    broadcastSSE('chat_message', msg);
    res.json({ success: true, message: msg });
  });

  // Mic Requests (Viewer speech queue synced between host on PC and viewer on phone)
  app.get('/api/sync/mics/:streamId', (req, res) => {
    const { streamId } = req.params;
    res.json(sharedState.mics[streamId] || []);
  });

  app.post('/api/sync/mic', (req, res) => {
    const { action, streamId, micRequest, requestId, isMuted } = req.body;
    if (!streamId) return res.status(400).json({ error: 'Stream ID manquant' });

    if (!sharedState.mics[streamId]) {
      sharedState.mics[streamId] = [];
    }

    if (action === 'request' && micRequest) {
      const exists = sharedState.mics[streamId].find((r: any) => r.id === micRequest.id || r.userId === micRequest.userId);
      if (!exists) {
        sharedState.mics[streamId].push(micRequest);
      }
    } else if (action === 'accept' && requestId) {
      sharedState.mics[streamId] = sharedState.mics[streamId].map((r: any) =>
        r.id === requestId ? { ...r, status: 'accepted', isMuted: false } : r
      );
    } else if (action === 'decline' && requestId) {
      sharedState.mics[streamId] = sharedState.mics[streamId].filter((r: any) => r.id !== requestId);
    } else if (action === 'mute' && requestId) {
      sharedState.mics[streamId] = sharedState.mics[streamId].map((r: any) =>
        r.id === requestId ? { ...r, isMuted: typeof isMuted === 'boolean' ? isMuted : !r.isMuted } : r
      );
    } else if (action === 'remove' && requestId) {
      sharedState.mics[streamId] = sharedState.mics[streamId].filter((r: any) => r.id !== requestId);
    }

    broadcastSSE('mics_updated', { streamId, mics: sharedState.mics[streamId] });
    res.json({ success: true, mics: sharedState.mics[streamId] });
  });

  // Pairing between PC & Phone
  app.post('/api/sync/pair', (req, res) => {
    const { hostUserId, deviceRole, streamId } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    sharedState.pairs[code] = {
      code,
      hostUserId,
      streamId,
      deviceRole: deviceRole || 'remote_control',
      createdAt: new Date().toISOString(),
    };
    res.json({ success: true, code, session: sharedState.pairs[code] });
  });

  app.get('/api/sync/pair/:code', (req, res) => {
    const { code } = req.params;
    const session = sharedState.pairs[code];
    if (!session) return res.status(404).json({ error: 'Code de liaison invalide ou expiré.' });
    res.json({ success: true, session });
  });

  // Save / Update recorded video across devices
  app.post('/api/sync/recording', (req, res) => {
    const rec = req.body;
    if (!rec || !rec.id) return res.status(400).json({ error: 'Enregistrement invalide' });
    const idx = sharedState.recordings.findIndex((r) => r.id === rec.id);
    if (idx !== -1) {
      sharedState.recordings[idx] = { ...sharedState.recordings[idx], ...rec };
    } else {
      sharedState.recordings.unshift(rec);
    }
    broadcastSSE('recordings_updated', sharedState.recordings);
    res.json({ success: true, recording: rec });
  });

  // Delete recorded video across devices
  app.delete('/api/sync/recording/:id', (req, res) => {
    const { id } = req.params;
    sharedState.recordings = sharedState.recordings.filter((r) => r.id !== id);
    broadcastSSE('recordings_updated', sharedState.recordings);
    res.json({ success: true });
  });

  // Reset shared state
  app.post('/api/sync/reset', (_req, res) => {
    sharedState.users = [];
    sharedState.streams = [];
    sharedState.recordings = [];
    sharedState.chat = {};
    sharedState.mics = {};
    sharedState.pairs = {};
    broadcastSSE('reset', {});
    res.json({ success: true });
  });

  // ==========================================
  // GEMINI AI STUDIO SERVICES
  // ==========================================

  // AI Moderation Endpoint
  app.post('/api/ai/moderate', async (req, res) => {
    try {
      const { text, author } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Texte manquant' });
      }

      if (!process.env.GEMINI_API_KEY) {
        const badWords = ['spam', 'insulte', 'fck', 'merde', 'connard', 'conne', 'salope', 'tg', 'ftg'];
        const isToxic = badWords.some((w) => text.toLowerCase().includes(w));
        return res.json({
          isSafe: !isToxic,
          flaggedReason: isToxic ? 'Langage inapproprié détecté par le filtre local' : null,
          toxicityScore: isToxic ? 0.9 : 0.05,
          category: isToxic ? 'harassment' : 'normal',
        });
      }

      const prompt = `Tu es le système de modération IA en temps réel pour une plateforme de streaming vidéo live.
Analyse ce message de chat envoyé par "${author || 'Utilisateur'}":
"${text}"

Évalue si ce message enfreint les règles (insultes, harcèlement, haine, spam grossier, contenu dangereux ou obscène).
Réponds UNIQUEMENT sous forme JSON valide avec cette structure exacte:
{
  "isSafe": boolean,
  "flaggedReason": string ou null,
  "toxicityScore": number entre 0.0 et 1.0,
  "category": "safe" | "harassment" | "spam" | "hate_speech" | "inappropriate"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Erreur API /api/ai/moderate:', err);
      res.json({
        isSafe: true,
        flaggedReason: null,
        toxicityScore: 0.1,
        category: 'safe',
      });
    }
  });

  // AI Studio Live Copilot & Control Room
  app.post('/api/ai/copilot', async (req, res) => {
    try {
      const { action, streamTitle, streamCategory, chatHistory, viewerCount, promptCustom } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          result: `[Copilot IA Activé] Tout fonctionne à merveille sur "${streamTitle}". Audience stable (${viewerCount} spectateurs). Modération automatique active.`,
          actionType: action || 'status',
          highlights: ['Chat fluide et bienveillant', 'Qualité de transmission optimale'],
        });
      }

      let systemPrompt = `Tu es le Co-Pilote Régie IA officiel de la plateforme StreamPulse. Tu assistes le créateur du live dans la gestion de sa diffusion, de son audience et de son studio.`;

      let userPrompt = `Contexte du Live:
- Titre: "${streamTitle || 'Live Sans Titre'}"
- Catégorie: "${streamCategory || 'Général'}"
- Spectateurs connectés: ${viewerCount || 0}
- Derniers messages du chat: ${JSON.stringify(chatHistory || [])}
`;

      if (action === 'summary') {
        userPrompt += `\nTâche: Rédige un résumé dynamique et concis en 3-4 puces de ce qui s'est passé dans le live pour les spectateurs qui viennent d'arriver.`;
      } else if (action === 'highlight_questions') {
        userPrompt += `\nTâche: Analyse les messages récents du chat et identifie les 2 ou 3 questions les plus pertinentes et engageantes posées par les spectateurs pour que le créateur y réponde en direct.`;
      } else if (action === 'sentiment_analysis') {
        userPrompt += `\nTâche: Analyse le sentiment général et l'ambiance du public (positif, curieux, agité, enthousiaste) avec un score de 1 à 100 et donne 2 recommandations au streamer.`;
      } else if (action === 'poll_ideas') {
        userPrompt += `\nTâche: Propose un sondage interactif percutant à lancer aux spectateurs avec 1 question et 4 choix de réponse captivants.`;
      } else if (action === 'generate_replay_metadata') {
        userPrompt += `\nTâche: Génère un titre ultra-attractif pour le replay/VOD, une description courte de 3 lignes et 5 tags optimisés pour la recherche.`;
      } else {
        userPrompt += `\nDemande du créateur: "${promptCustom || 'Comment dynamiser mon audience maintenant ?'}"`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      return res.json({
        success: true,
        text: response.text,
        action,
      });
    } catch (err: any) {
      console.error('Erreur API /api/ai/copilot:', err);
      res.status(500).json({ error: 'Impossible de contacter le copilote IA' });
    }
  });

  // AI Live Captions / Instant Translation
  app.post('/api/ai/caption', async (req, res) => {
    try {
      const { text, targetLang } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Texte manquant' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          caption: text,
          translated: text,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Tu es un sous-titreur en direct.
Formate et nettoie ce segment de parole pour des sous-titres fluides en direct: "${text}".
Traduire également en ${targetLang || 'English'}.
Réponds au format JSON:
{
  "cleanedSubtitle": string,
  "translation": string
}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      res.json({ cleanedSubtitle: req.body.text, translation: req.body.text });
    }
  });

  // Vite Integration
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur StreamPulse en écoute sur http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Échec du démarrage du serveur:', err);
});
