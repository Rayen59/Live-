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
    const { text, targetLang } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: 'Texte manquant' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        cleanedSubtitle: text,
        translation: text,
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
    return res.status(200).json(parsed);
  } catch (err: any) {
    return res.status(200).json({ cleanedSubtitle: req.body?.text, translation: req.body?.text });
  }
}
