import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { text, author } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: 'Texte manquant' });
    }

    if (!process.env.GEMINI_API_KEY) {
      const badWords = ['spam', 'insulte', 'fck', 'merde', 'connard', 'conne', 'salope', 'tg', 'ftg'];
      const isToxic = badWords.some((w) => text.toLowerCase().includes(w));
      return res.status(200).json({
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
    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('Erreur Vercel function /api/ai/moderate:', err);
    return res.status(200).json({
      isSafe: true,
      flaggedReason: null,
      toxicityScore: 0.1,
      category: 'safe',
    });
  }
}
