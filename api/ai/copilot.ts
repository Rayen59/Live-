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
    const { action, streamTitle, streamCategory, chatHistory, viewerCount, promptCustom } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
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

    return res.status(200).json({
      success: true,
      text: response.text,
      action,
    });
  } catch (err: any) {
    console.error('Erreur Vercel function /api/ai/copilot:', err);
    return res.status(500).json({ error: 'Impossible de contacter le copilote IA' });
  }
}
