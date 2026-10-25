import express from 'express';
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

async function bootstrap() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // Initialize server-side Gemini client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // AI Moderation Endpoint
  app.post('/api/ai/moderate', async (req, res) => {
    try {
      const { text, author } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Texte manquant' });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Fallback rule-based check if no API key is configured
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
      // Graceful fallback to keep live chat moving
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
