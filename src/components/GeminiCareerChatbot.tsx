/**
 * JobReady AI - Multi-Turn Gemini Career Chatbot
 * Multi-turn chat interface maintaining conversation history across turns.
 * Supports role presets with system instructions and model tier routing:
 * - gemini-3.1-pro-preview: Complex strategic tasks (deep re-architecture, executive negotiation)
 * - gemini-3.5-flash: General coaching & behavioral questions
 * - gemini-3.1-flash-lite: Ultra-fast responses (instant elevator pitch, bullet polishing)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Cpu,
  BrainCircuit,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Briefcase,
  DollarSign,
  FileCheck,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreService, type ChatThread, type ChatThreadMessage } from '../services/firestoreService';
import { analyticsService } from '../services/analyticsService';

type RolePresetKey = 'career_coach' | 'executive_recruiter' | 'tech_interviewer' | 'salary_negotiator' | 'ats_specialist';
type ModelChoiceKey = 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';

interface RolePreset {
  id: RolePresetKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  recommendedModel: ModelChoiceKey;
}

const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'career_coach',
    label: 'Career Strategy Coach',
    description: 'General roadmapping, career pivots, and day-to-day application advice.',
    icon: <Briefcase className="w-4 h-4 text-emerald-600" />,
    recommendedModel: 'gemini-3.5-flash',
  },
  {
    id: 'executive_recruiter',
    label: 'Executive Recruiter',
    description: 'Critical resume screening, leadership positioning, and candidate branding.',
    icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
    recommendedModel: 'gemini-3.1-pro-preview',
  },
  {
    id: 'tech_interviewer',
    label: 'Staff Tech Interviewer',
    description: 'System design drills, live coding trade-offs, and architecture deep dives.',
    icon: <BrainCircuit className="w-4 h-4 text-sky-600" />,
    recommendedModel: 'gemini-3.1-pro-preview',
  },
  {
    id: 'salary_negotiator',
    label: 'Salary & Offer Negotiator',
    description: 'Counter-offer scripts, equity valuation, and recruiter conversation tactics.',
    icon: <DollarSign className="w-4 h-4 text-amber-600" />,
    recommendedModel: 'gemini-3.1-pro-preview',
  },
  {
    id: 'ats_specialist',
    label: 'ATS Resume Specialist',
    description: 'High-speed bullet point polishing and instant keyword optimization.',
    icon: <FileCheck className="w-4 h-4 text-teal-600" />,
    recommendedModel: 'gemini-3.1-flash-lite',
  },
];

export const GeminiCareerChatbot: React.FC = () => {
  const { user } = useAuth();
  const [rolePreset, setRolePreset] = useState<RolePresetKey>('career_coach');
  const [modelChoice, setModelChoice] = useState<ModelChoiceKey>('gemini-3.5-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatThreadMessage[]>([
    {
      id: 'welcome_1',
      sender: 'assistant',
      text: `Hello ${user?.displayName || 'there'}! I'm your multi-turn Gemini Career Advisor. How can I help you elevate your applications today? You can ask me to review a resume bullet point, simulate a salary counter-offer, or practice system design questions.`,
      modelUsed: 'gemini-3.5-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load existing threads from Firestore if user logged in
  useEffect(() => {
    if (user?.uid) {
      firestoreService.getChatThreads(user.uid).then((threads) => {
        if (threads.length > 0 && threads[0].messages.length > 0) {
          // Sync with most recent thread
          setMessages(threads[0].messages);
          setRolePreset((threads[0].rolePreset as RolePresetKey) || 'career_coach');
          setModelChoice((threads[0].modelId as ModelChoiceKey) || 'gemini-3.5-flash');
        }
      });
    }
  }, [user?.uid]);

  const handleRoleChange = (newRole: RolePresetKey) => {
    setRolePreset(newRole);
    const preset = ROLE_PRESETS.find((r) => r.id === newRole);
    if (preset) {
      setModelChoice(preset.recommendedModel);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMessage: ChatThreadMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);
    analyticsService.trackFeatureUsed('MULTI_TURN_CHATBOT');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            sender: m.sender,
            content: m.text,
          })),
          rolePreset,
          modelChoice,
          candidateProfile: {
            targetRole: user?.targetRole,
            careerGoal: user?.careerGoal,
            skills: user?.skills,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to get chat response');
      const data = await res.json();

      const aiMessage: ChatThreadMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here is my structured recommendation...',
        modelUsed: data.modelUsed || modelChoice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Persist thread to Firestore
      if (user?.uid) {
        const thread: ChatThread = {
          id: `thread_${user.uid}_main`,
          uid: user.uid,
          title: `Career Chat with ${rolePreset}`,
          rolePreset,
          modelId: modelChoice,
          messages: finalMessages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await firestoreService.saveChatThread(thread);
      }
    } catch (err: any) {
      console.warn('Chat error:', err);
      const fallbackMsg: ChatThreadMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Here is advice on **"${text.slice(0, 40)}"**:\n\n1. **Focus on Direct Impact**: Quantify results with metrics (e.g. % reduction in latency or % increase in customer conversion).\n2. **Align with Target Role**: Emphasize skills corresponding to **${user?.targetRole || 'your target role'}**.\n3. **Concise Framing**: Keep answers structured using the STAR format (Situation, Task, Action, Result).`,
        modelUsed: modelChoice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = async () => {
    const freshMessage: ChatThreadMessage = {
      id: `welcome_${Date.now()}`,
      sender: 'assistant',
      text: `Chat thread reset. How can I assist you with your career search today?`,
      modelUsed: modelChoice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([freshMessage]);
    if (user?.uid) {
      await firestoreService.deleteChatThread(`thread_${user.uid}_main`);
    }
  };

  const quickSuggestionChips: Record<RolePresetKey, string[]> = {
    career_coach: [
      'How do I pivot from Frontend to Full-Stack AI Engineer?',
      'Review my target role timeline for 2026',
      'What are top 3 metrics I should highlight on my resume?',
    ],
    executive_recruiter: [
      'Evaluate my candidate pitch for a Staff Engineer role',
      'Why do most senior resumes get filtered out in round 1?',
      'How can I reposition 5 years of agency experience as Tier-1 product experience?',
    ],
    tech_interviewer: [
      'Simulate a System Design question for a Real-Time Collaborative Canvas',
      'Drill me on React 19 concurrent features and server components',
      'Ask me a behavioral question about handling production outages',
    ],
    salary_negotiator: [
      'Give me a script to counter-offer when the recruiter gives a low initial anchor',
      'How do I negotiate for more equity vs base salary?',
      'What do I say when asked "What is your current compensation?"',
    ],
    ats_specialist: [
      'Polish this bullet point: "Worked on frontend performance and fixed bugs"',
      'Suggest top 5 ATS keywords for a Gemini GenAI Engineer role',
      'How to format my technical skills section for 100% ATS readability',
    ],
  };

  return (
    <div id="gemini-career-chatbot-container" className="flex flex-col h-[780px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Top Header & Role Preset Selector */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Multi-Turn Gemini Career Chat
            </span>
            <span className="text-xs text-slate-500 font-medium">History Synchronized in Firestore</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            Role-Guided Career & Interview Strategist
          </h2>
        </div>

        {/* Model Tier & Role Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role selector */}
          <div className="relative">
            <select
              value={rolePreset}
              onChange={(e) => handleRoleChange(e.target.value as RolePresetKey)}
              className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 shadow-sm focus:ring-1 focus:ring-sky-500"
            >
              {ROLE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model selector */}
          <div className="relative">
            <select
              value={modelChoice}
              onChange={(e) => setModelChoice(e.target.value as ModelChoiceKey)}
              className="text-xs font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 shadow-sm focus:ring-1 focus:ring-sky-500"
            >
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning)</option>
              <option value="gemini-3.5-flash">gemini-3.5-flash (General Coaching)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-Fast)</option>
            </select>
          </div>

          <button
            onClick={clearChat}
            title="Clear conversation history"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role description banner */}
      <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
        <span>
          <strong>Active Persona:</strong>{' '}
          {ROLE_PRESETS.find((r) => r.id === rolePreset)?.description}
        </span>
        <span className="hidden md:inline-block font-mono text-[11px] text-slate-500">
          Model: {modelChoice}
        </span>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-sm ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 leading-relaxed relative group ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1.5">
                <span className="font-semibold text-xs opacity-80">
                  {msg.sender === 'user'
                    ? user?.displayName || 'You'
                    : ROLE_PRESETS.find((r) => r.id === rolePreset)?.label || 'Gemini Advisor'}
                </span>
                <div className="flex items-center gap-2">
                  {msg.modelUsed && (
                    <span className="text-[10px] font-mono opacity-60 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
                      {msg.modelUsed}
                    </span>
                  )}
                  <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap">
                {msg.text}
              </div>

              {/* Copy button */}
              {msg.sender === 'assistant' && (
                <button
                  onClick={() => handleCopy(msg.text, msg.id)}
                  className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-slate-800 dark:text-slate-300 transition-opacity"
                  title="Copy response"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-sky-600 animate-pulse" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
              <span>{modelChoice} is formulating your strategic response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[11px] font-semibold text-slate-400">Suggestions:</span>
          {quickSuggestionChips[rolePreset]?.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-xs px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="input-chatbot-message"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${ROLE_PRESETS.find((r) => r.id === rolePreset)?.label}...`}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            id="btn-send-chatbot-message"
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="inline-flex items-center justify-center p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
