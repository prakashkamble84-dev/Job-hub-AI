/**
 * JobReady AI - Conversational Career Assistant Drawer (Phase 7)
 * Slide-over interactive career guidance assistant with suggestion chips.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  Zap
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { entitlementService } from '../services/entitlementService';
import { useSubscription } from '../context/SubscriptionContext';
import { analyticsService } from '../services/analyticsService';
import { PaywallBanner } from './PremiumUpgradeModal';

interface CareerAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_init',
    sender: 'assistant',
    text: "Hi Alex! I'm your JobReady AI Career Advisor. Ask me anything about resume phrasing, tricky interview questions, compensation negotiation, or portfolio strategy.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const QUICK_PROMPTS = [
  'How do I answer "Tell me about yourself"?',
  'What are great questions to ask the interviewer?',
  'How can I negotiate a higher base salary?',
  'How to explain a career gap or transition?',
];

export const CareerAssistantDrawer: React.FC<CareerAssistantDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { checkFeatureAccess, openUpgradeModal } = useSubscription();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (prompt?: string) => {
    const textToSend = prompt || inputText;
    if (!textToSend.trim() || loading) return;

    const allowed = checkFeatureAccess(() => entitlementService.canSendAssistantMessage());
    if (!allowed) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const reply = await aiService.askCareerAdvisor({
        message: textToSend,
        userContext: {
          targetRole: 'Senior Frontend Engineer',
          experienceLevel: 'Senior',
        },
      });

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      entitlementService.recordAssistantMessage();
      analyticsService.trackCareerAdvisorMessageSent();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ast_${Date.now()}`,
          sender: 'assistant',
          text: "I'm having a brief connection issue. Please try asking again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const assistantLimit = entitlementService.canSendAssistantMessage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Career AI Assistant</h3>
              <p className="text-[11px] text-slate-400">
                {assistantLimit.isUnlimited
                  ? 'Unlimited Guidance'
                  : `${assistantLimit.remaining} free messages left`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 px-1 mt-1">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>JobReady AI is thinking...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto">
          <div className="flex gap-1.5 pb-1">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-700 hover:bg-blue-50 hover:border-blue-300 font-medium transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask career or interview questions..."
              className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
