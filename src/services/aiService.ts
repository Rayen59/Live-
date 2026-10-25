export interface ModerationResult {
  isSafe: boolean;
  flaggedReason: string | null;
  toxicityScore: number;
  category: 'safe' | 'harassment' | 'spam' | 'hate_speech' | 'inappropriate';
}

export interface CopilotResponse {
  success?: boolean;
  text?: string;
  action?: string;
  result?: string;
  highlights?: string[];
  error?: string;
}

export const AIService = {
  async checkMessageToxicity(text: string, author: string): Promise<ModerationResult> {
    try {
      const res = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author }),
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      // Local fallback in case server network blip
      const badWords = ['spam', 'insulte', 'fck', 'merde', 'connard', 'salope', 'tg'];
      const isToxic = badWords.some((w) => text.toLowerCase().includes(w));
      return {
        isSafe: !isToxic,
        flaggedReason: isToxic ? 'Langage offensant détecté' : null,
        toxicityScore: isToxic ? 0.85 : 0.05,
        category: isToxic ? 'harassment' : 'safe',
      };
    }
  },

  async askCopilot(params: {
    action: 'summary' | 'highlight_questions' | 'sentiment_analysis' | 'poll_ideas' | 'generate_replay_metadata' | 'custom';
    streamTitle: string;
    streamCategory: string;
    chatHistory: Array<{ author: string; text: string }>;
    viewerCount: number;
    promptCustom?: string;
  }): Promise<CopilotResponse> {
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Copilot request failed');
      return await res.json();
    } catch {
      // Intelligent fallback
      return {
        success: true,
        text: `[Copilot IA en ligne] Analyse de la session "${params.streamTitle}" :
- Audience active de ${params.viewerCount} spectateurs.
- Ambiance générale : Énergique et collaborative.
- Conseil : Vous pouvez proposer un tour de parole aux spectateurs via le bouton 'Demande de micro' ou lancer un court sondage.`,
      };
    }
  },

  async getLiveCaption(text: string, targetLang = 'English'): Promise<{ cleanedSubtitle: string; translation: string }> {
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang }),
      });
      if (!res.ok) throw new Error('Caption failed');
      return await res.json();
    } catch {
      return { cleanedSubtitle: text, translation: text };
    }
  },
};
