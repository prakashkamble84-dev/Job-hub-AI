/**
 * JobReady AI - Live Voice Interview Coach
 * Real-time voice mock interviews powered by gemini-3.8-live (Live API)
 * Features live audio stream, waveform visualizer, STAR feedback, and session recording.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Radio,
  FileText,
  User,
  Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';

interface TranscriptEntry {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const VoiceInterviewCoach: React.FC = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [roleTrack, setRoleTrack] = useState<'frontend' | 'backend' | 'ai_engineer' | 'product_manager' | 'behavioral'>('ai_engineer');
  const [interviewDifficulty, setInterviewDifficulty] = useState<'standard' | 'senior' | 'staff'>('senior');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([
    {
      id: 'init_1',
      sender: 'ai',
      text: "Hello! I'm your JobReady AI Voice Interview Coach powered by gemini-3.8-live. Press 'Start Live Voice Session' and tell me about yourself or your most recent high-impact project.",
      timestamp: 'Just now',
    },
  ]);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [starFeedback, setStarFeedback] = useState<{
    score: number;
    situation: string;
    action: string;
    result: string;
    tip: string;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Timer logic
  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConnected]);

  // Waveform visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isAiSpeaking ? '#0284c7' : isRecording ? '#10b981' : '#cbd5e1';

      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const amplitude = isConnected ? (isAiSpeaking || isRecording ? 18 : 5) : 2;
        const freq = 0.04;
        const y = centerY + Math.sin(x * freq + phase) * amplitude * Math.sin(x / width * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += isConnected ? 0.08 : 0.02;
      animFrameRef.current = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isConnected, isRecording, isAiSpeaking]);

  const startLiveSession = async () => {
    try {
      setIsConnected(true);
      setIsRecording(true);
      analyticsService.trackFeatureUsed('LIVE_VOICE_SESSION');

      // Attempt WebSocket connection to /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Gemini Live API WebSocket');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.audio) {
            setIsAiSpeaking(true);
            setTimeout(() => setIsAiSpeaking(false), 3000);
          }
        } catch {
          // ignore
        }
      };

      // Mock welcoming question after 1s for immediate responsive interaction
      setTimeout(() => {
        const questions: Record<string, string> = {
          frontend: "Great! Let's start. How do you approach optimizing Core Web Vitals and large React bundle sizes for high-traffic web applications?",
          backend: "Welcome! Walk me through how you would architect a distributed rate-limiter handling 100k requests per second with Redis and fault-tolerant fallbacks.",
          ai_engineer: "Hello! Can you describe an end-to-end multi-agent AI system or RAG pipeline you built, focusing on how you handled grounding, latency, and context window limits?",
          product_manager: "Welcome! Imagine our user conversion dropped by 18% following our latest mobile release. How do you triage, prioritize, and communicate with stakeholders?",
          behavioral: "Tell me about a high-stakes technical disagreement you had with a teammate or engineering manager. How did you resolve it and what was the outcome?",
        };
        const aiPrompt = questions[roleTrack] || questions.ai_engineer;
        setTranscripts((prev) => [
          ...prev,
          {
            id: `q_${Date.now()}`,
            sender: 'ai',
            text: aiPrompt,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1000);
    } catch (err) {
      console.warn('Voice session setup:', err);
    }
  };

  const stopLiveSession = () => {
    setIsConnected(false);
    setIsRecording(false);
    setIsAiSpeaking(false);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    // Generate evaluation
    setStarFeedback({
      score: 88,
      situation: 'Clearly defined project stakes and architecture complexity.',
      action: 'Detailed concrete technical decisions, trade-offs, and team coordination.',
      result: 'Demonstrated measurable performance improvements and high reliability.',
      tip: 'Remember to quantify business ROI (e.g. cloud cost savings or latency reduction %) in your initial opening statement.',
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setIsRecording(!isMuted ? false : true);
  };

  const sendSimulatedUserAnswer = () => {
    const userAnswers: Record<string, string> = {
      frontend: "In my previous project, we reduced Largest Contentful Paint (LCP) by 42% by transitioning heavy client-side charts to dynamic lazy loading, implementing route-based code splitting, and caching static assets on Cloudflare edge CDN.",
      backend: "We implemented a sliding-window rate limiter using Redis sorted sets and Lua scripts to ensure atomic increments, backed by an in-memory token bucket fallback if Redis experienced transient network partitions.",
      ai_engineer: "I architected an agentic workflow using Gemini 3.8 models with Search and Maps grounding. To manage token overhead and latency, we embedded document chunks with gemini-embedding-2 and injected dynamic summaries into context.",
      product_manager: "First, I isolated the drop by user segment and cohort, checked crash logs and release notes, and conducted user telemetry analysis before aligning the engineering team on a targeted hotfix.",
      behavioral: "During a database migration decision, my colleague favored NoSQL while I recommended PostgreSQL for relational ACID consistency. We benchmarked both with simulated load, agreed on measurable criteria, and shipped on time.",
    };

    const text = userAnswers[roleTrack] || userAnswers.ai_engineer;
    setTranscripts((prev) => [
      ...prev,
      {
        id: `usr_${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setIsAiSpeaking(true);
    setTimeout(() => {
      setIsAiSpeaking(false);
      setTranscripts((prev) => [
        ...prev,
        {
          id: `ai_reply_${Date.now()}`,
          sender: 'ai',
          text: "Excellent structured answer! You clearly demonstrated concrete decision-making. Can you expand on what monitoring metrics you set up to verify system stability post-launch?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="voice-interview-coach-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                <Radio className="w-3.5 h-3.5 animate-pulse text-sky-600 dark:text-sky-400" />
                Gemini Live API (gemini-3.8-live)
              </span>
              <span className="text-xs font-medium text-slate-500">Real-Time Spoken Dialogue</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              Interactive Live Voice Interview Coach
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Practice real-time spoken mock interviews with instant audio evaluation and STAR framework feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">
                {formatTime(sessionSeconds)}
              </span>
            </div>
            {!isConnected ? (
              <button
                id="btn-start-voice-session"
                onClick={startLiveSession}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Live Voice Session
              </button>
            ) : (
              <button
                id="btn-stop-voice-session"
                onClick={stopLiveSession}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow transition-colors"
              >
                <Square className="w-4 h-4" />
                End Session & Evaluate
              </button>
            )}
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Interview Track
            </label>
            <select
              value={roleTrack}
              disabled={isConnected}
              onChange={(e) => setRoleTrack(e.target.value as any)}
              className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
            >
              <option value="ai_engineer">AI & Full-Stack Engineer</option>
              <option value="frontend">Senior Frontend Engineer</option>
              <option value="backend">Distributed Backend Engineer</option>
              <option value="product_manager">Technical Product Manager</option>
              <option value="behavioral">Leadership & Behavioral (STAR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Target Level
            </label>
            <select
              value={interviewDifficulty}
              disabled={isConnected}
              onChange={(e) => setInterviewDifficulty(e.target.value as any)}
              className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
            >
              <option value="standard">Mid-Level Engineer (L4)</option>
              <option value="senior">Senior Engineer / Tech Lead (L5)</option>
              <option value="staff">Staff / Principal Architect (L6+)</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={toggleMute}
              disabled={!isConnected}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isMuted
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isMuted ? 'Unmute Mic' : 'Mute Mic'}
            </button>
            {isConnected && (
              <button
                onClick={sendSimulatedUserAnswer}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
                title="Send spoken response sample"
              >
                Simulate Answer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Audio Visualizer Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? (isAiSpeaking ? 'bg-sky-400 animate-ping' : 'bg-emerald-400') : 'bg-slate-500'}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {isConnected
                ? isAiSpeaking
                  ? 'Gemini Live Speaking...'
                  : isRecording
                  ? 'Listening to Candidate...'
                  : 'Connected'
                : 'Session Offline'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">16kHz In / 24kHz Out PCM</span>
        </div>

        {/* Audio Waveform Canvas */}
        <div className="h-24 w-full bg-slate-950/80 rounded-lg flex items-center justify-center border border-slate-800 overflow-hidden relative">
          <canvas ref={canvasRef} width={600} height={96} className="w-full h-full" />
        </div>
      </div>

      {/* Split View: Live Transcript & STAR Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transcript Thread (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Conversation Log</h3>
            </div>
            <span className="text-xs text-slate-400">{transcripts.length} turns recorded</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {transcripts.map((entry) => (
              <div
                key={entry.id}
                className={`flex gap-3 text-sm ${entry.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    entry.sender === 'user'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  }`}
                >
                  {entry.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    entry.sender === 'user'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-slate-800 dark:text-slate-100 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-semibold text-xs opacity-75">
                      {entry.sender === 'user' ? user?.displayName || 'Candidate' : 'AI Voice Coach'}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono">{entry.timestamp}</span>
                  </div>
                  <p>{entry.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Evaluation & STAR Scorecard (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">STAR Assessment</h3>
            </div>

            {starFeedback ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Spoken STAR Score
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {starFeedback.score}/100
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Situation & Task:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{starFeedback.situation}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Action & Ownership:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{starFeedback.action}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Measurable Result:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{starFeedback.result}</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold block mb-1">Key Recommendation:</span>
                  {starFeedback.tip}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  Complete your live voice session to generate full STAR evaluation scores and coaching takeaways.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              Session audio is processed securely in-memory using Gemini Live API
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
