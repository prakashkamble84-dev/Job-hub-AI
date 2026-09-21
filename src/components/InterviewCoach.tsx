/**
 * JobReady AI - AI Interview Coach (Phase 5)
 * Role-based simulations, live text/voice input, instant STAR evaluation, and targeted weak-area drills.
 */

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Mic,
  MicOff,
  Send,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  RefreshCw,
  Clock,
  Play,
  RotateCcw
} from 'lucide-react';
import type { InterviewFeedback } from '../types';
import { aiService } from '../services/aiService';
import { entitlementService } from '../services/entitlementService';
import { useSubscription } from '../context/SubscriptionContext';
import { analyticsService } from '../services/analyticsService';
import { PaywallBanner } from './PremiumUpgradeModal';

interface InterviewCoachProps {
  onInterviewCompleted?: (score: number) => void;
}

const SAMPLE_QUESTIONS = [
  'Tell me about a complex frontend performance or state management issue you diagnosed and resolved.',
  'Describe a situation where you had a technical disagreement with a team member. How did you handle it?',
  'How do you approach architecting a scalable, accessible component design system for high-traffic apps?',
  'Walk me through how you optimize Core Web Vitals (LCP, INP, CLS) in a modern web application.',
];

export const InterviewCoach: React.FC<InterviewCoachProps> = ({ onInterviewCompleted }) => {
  const { checkFeatureAccess, openUpgradeModal } = useSubscription();

  const [role, setRole] = useState('Senior Frontend Engineer');
  const [seniority, setSeniority] = useState('Senior');
  const [interviewType, setInterviewType] = useState('Technical + Behavioral');

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isSessionActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const startSession = () => {
    const allowed = checkFeatureAccess(() => entitlementService.canStartInterview());
    if (!allowed) return;

    setIsSessionActive(true);
    setCurrentQuestionIndex(0);
    setCandidateAnswer('');
    setFeedback(null);
    setError(null);
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech-to-text transcript accumulation
      const dummyTranscript = "In my last role at TechCorp, we noticed our enterprise dashboard LCP was spiking above 3.5 seconds. I set up Web Vitals telemetry in production, identified heavy bundle waterfalls, implemented dynamic code-splitting and asset prefetching, which reduced LCP to 1.4 seconds and decreased user bounce rate by 22%.";
      setTimeout(() => {
        setCandidateAnswer((prev) => (prev ? prev + ' ' + dummyTranscript : dummyTranscript));
        setIsRecording(false);
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!candidateAnswer.trim()) return;

    setEvaluating(true);
    setError(null);

    try {
      const result = await aiService.evaluateInterviewAnswer({
        question: SAMPLE_QUESTIONS[currentQuestionIndex],
        answer: candidateAnswer,
        role,
        seniority,
      });

      setFeedback(result);
      entitlementService.recordInterviewSession();
      analyticsService.trackInterviewCompleted(result.score);
      if (onInterviewCompleted) {
        onInterviewCompleted(result.score);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate interview answer.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCandidateAnswer('');
      setFeedback(null);
    } else {
      setIsSessionActive(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const interviewUsage = entitlementService.canStartInterview();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-600" />
            <span>AI Interview Coach</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate realistic technical &amp; behavioral interviews with real-time STAR framework scoring.
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-medium text-slate-600 border border-slate-200">
          {interviewUsage.isUnlimited
            ? 'Unlimited Sessions (Premium)'
            : `${interviewUsage.remaining} of ${interviewUsage.limit} sessions left`}
        </span>
      </div>

      {!interviewUsage.isUnlimited && interviewUsage.remaining === 0 && (
        <PaywallBanner featureName="AI Interview Coach" onUpgrade={() => openUpgradeModal('interview_coach_limit')} />
      )}

      {/* Setup View (When session inactive) */}
      {!isSessionActive ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configure Mock Interview Session</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select role calibration and seniority level.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seniority Level</label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Junior / Entry">Junior / Entry</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Staff">Lead / Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Interview Format</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="Technical + Behavioral">Technical + Behavioral</option>
                <option value="System Architecture">System Architecture</option>
                <option value="STAR Behavioral Leadership">STAR Behavioral Leadership</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={startSession}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Interactive Simulation</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Interview Simulation */
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Mock Session: {role} ({seniority})</div>
                <div className="text-sm font-bold text-white">
                  Question {currentQuestionIndex + 1} of {SAMPLE_QUESTIONS.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTimer(timer)}</span>
              </div>
              <button
                onClick={() => setIsSessionActive(false)}
                className="px-3 py-1 text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-900/30 rounded-lg transition-colors"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Interviewer Question</span>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
              "{SAMPLE_QUESTIONS[currentQuestionIndex]}"
            </h3>
          </div>

          {/* Candidate Answer Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Your Response (STAR Method)</label>
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                  isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-purple-600" />}
                <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Explain Situation, Task, Action you took, and measurable Results..."
              className="w-full p-3.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-hidden leading-relaxed"
            />

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCandidateAnswer('')}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>

              <button
                disabled={evaluating || !candidateAnswer.trim()}
                onClick={handleEvaluateAnswer}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating STAR Quality...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Submit &amp; Evaluate Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback & Score Breakdown */}
          {feedback && (
            <div className="p-6 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">AI Evaluation Score</div>
                  <h4 className="text-lg font-bold text-slate-900">STAR Performance Analysis</h4>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-purple-700">{feedback.score} / 100</div>
                </div>
              </div>

              {/* STAR Framework Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Situation: {feedback.starBreakdown.situation.score}%</div>
                  <p className="text-[11px] text-slate-600 mt-1">{feedback.starBreakdown.situation.notes}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Task: {feedback.starBreakdown.task.score}%</div>
                  <p className="text-[11px] text-slate-600 mt-1">{feedback.starBreakdown.task.notes}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Action: {feedback.starBreakdown.action.score}%</div>
                  <p className="text-[11px] text-slate-600 mt-1">{feedback.starBreakdown.action.notes}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Result: {feedback.starBreakdown.result.score}%</div>
                  <p className="text-[11px] text-slate-600 mt-1">{feedback.starBreakdown.result.notes}</p>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Strong Delivery Highlights</span>
                  </div>
                  <ul className="space-y-1 text-emerald-800">
                    {feedback.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Areas to Polish</span>
                  </div>
                  <ul className="space-y-1 text-amber-800">
                    {feedback.improvements.map((imp, i) => (
                      <li key={i}>• {imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improved Sample Answer */}
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs space-y-1.5">
                <span className="font-bold text-purple-900">Suggested Model Answer:</span>
                <p className="text-purple-950 leading-relaxed italic">{feedback.betterAnswerExample}</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  {currentQuestionIndex < SAMPLE_QUESTIONS.length - 1 ? 'Next Question' : 'Complete Mock Session'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
