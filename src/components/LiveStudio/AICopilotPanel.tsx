import React, { useState } from 'react';
import { Sparkles, Bot, BrainCircuit, ShieldAlert, CheckCircle, MessageSquareQuote, Send, RefreshCw, BarChart2, HelpCircle } from 'lucide-react';
import { AIService } from '../../services/aiService';
import { LiveStream, ChatMessage } from '../../types';

interface AICopilotPanelProps {
  stream: LiveStream;
  chatMessages: ChatMessage[];
  isAutoModEnabled: boolean;
  setIsAutoModEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onPinMessage?: (text: string) => void;
}

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  stream,
  chatMessages,
  isAutoModEnabled,
  setIsAutoModEnabled,
  onPinMessage,
}) => {
  const [loading, setLoading] = useState(false);
  const [copilotOutput, setCopilotOutput] = useState<string | null>(
    `Studio IA en veille active. Prêt à modérer le chat, résumer la session, mettre en avant les questions clés ou générer des interactions avec l'audience.`
  );
  const [customPrompt, setCustomPrompt] = useState('');

  const triggerAction = async (action: 'summary' | 'highlight_questions' | 'sentiment_analysis' | 'poll_ideas' | 'generate_replay_metadata' | 'custom', promptOverride?: string) => {
    setLoading(true);
    try {
      const history = chatMessages.slice(-15).map((m) => ({ author: m.username, text: m.text }));
      const res = await AIService.askCopilot({
        action,
        streamTitle: stream.title,
        streamCategory: stream.category,
        chatHistory: history,
        viewerCount: stream.viewerCount,
        promptCustom: promptOverride || customPrompt,
      });

      if (res.text) {
        setCopilotOutput(res.text);
      } else if (res.result) {
        setCopilotOutput(res.result);
      }
    } catch {
      setCopilotOutput('Erreur lors de la communication avec le Copilote IA.');
    } finally {
      setLoading(false);
      if (action === 'custom') setCustomPrompt('');
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-100 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Régie & Copilote IA Tout-en-Un</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded uppercase font-mono font-bold">
                Gemini 3.8
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">Contrôle, modération et assistance automatisée du direct</p>
          </div>
        </div>

        {/* Auto-mod switch */}
        <button
          onClick={() => setIsAutoModEnabled(!isAutoModEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
            isAutoModEnabled
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
          }`}
          title="Filtre IA temps-réel contre la toxicité"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Filtre IA : {isAutoModEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3 text-xs">
        <button
          disabled={loading}
          onClick={() => triggerAction('summary')}
          className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 text-left transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Résumer le direct</span>
        </button>

        <button
          disabled={loading}
          onClick={() => triggerAction('highlight_questions')}
          className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 text-left transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">Questions du chat</span>
        </button>

        <button
          disabled={loading}
          onClick={() => triggerAction('sentiment_analysis')}
          className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 text-left transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <BarChart2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Ambiance & Mood</span>
        </button>

        <button
          disabled={loading}
          onClick={() => triggerAction('poll_ideas')}
          className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 text-left transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <MessageSquareQuote className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">Idée de sondage</span>
        </button>
      </div>

      {/* Copilot Response Terminal */}
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs overflow-y-auto mb-3 min-h-[140px] relative font-sans leading-relaxed text-zinc-200">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-zinc-400 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>L'IA analyse le flux, le chat et génère l'assistance en direct...</span>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            {copilotOutput}
          </div>
        )}
      </div>

      {/* Custom prompt input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (customPrompt.trim()) triggerAction('custom');
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Ex: Donne-moi une relance percutante pour réveiller le chat..."
          className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={loading || !customPrompt.trim()}
          className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Demander</span>
        </button>
      </form>
    </div>
  );
};
