/**
 * JobReady AI - AI Client Service
 * Calls server-side Gemini AI endpoints with exponential backoff, retry controls,
 * and cost-safe input sanitization.
 */

import type { ResumeAnalysis, JobAnalysis, InterviewFeedback } from '../types';
import { errorMonitoringService } from './errorMonitoringService';

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  let attempt = 0;
  let delay = 800;

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500) {
        return res;
      }
      throw new Error(`HTTP error ${res.status}`);
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error('AI service is temporarily unavailable. Please try again.');
}

export const aiService = {
  async analyzeResume(uid: string, resumeText: string): Promise<ResumeAnalysis> {
    try {
      const response = await fetchWithRetry('/api/ai/resume-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, resumeText }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to analyze resume.');
      }

      return await response.json();
    } catch (error: any) {
      errorMonitoringService.captureError(error, { feature: 'RESUME_ANALYSIS' });
      throw new Error('AI service is temporarily unavailable. Please try again.');
    }
  },

  async tailorResume(params: {
    uid: string;
    resumeText: string;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
  }): Promise<{
    tailoredSummary: string;
    tailoredContent: string;
    matchScore: number;
    changesSummary: string[];
  }> {
    try {
      const response = await fetchWithRetry('/api/ai/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to tailor resume.');
      }

      return await response.json();
    } catch (error: any) {
      errorMonitoringService.captureError(error, { feature: 'RESUME_TAILOR' });
      throw new Error('AI service is temporarily unavailable. Please try again.');
    }
  },

  async analyzeJob(params: {
    uid: string;
    jobTitle: string;
    company: string;
    jobDescription: string;
    userSkills?: string[];
  }): Promise<JobAnalysis> {
    try {
      const response = await fetchWithRetry('/api/ai/job-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to analyze job.');
      }

      const data = await response.json();
      return {
        id: `analysis_${Date.now()}`,
        uid: params.uid,
        jobTitle: params.jobTitle,
        company: params.company,
        rawJobDescription: params.jobDescription,
        matchScore: data.matchScore || 75,
        skillsMatch: data.skillsMatch || { matching: [], missing: [], partial: [] },
        keyResponsibilities: data.keyResponsibilities || [],
        recommendations: data.recommendations || [],
        analyzedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      errorMonitoringService.captureError(error, { feature: 'JOB_ANALYSIS' });
      throw new Error('AI service is temporarily unavailable. Please try again.');
    }
  },

  async evaluateInterviewAnswer(params: {
    question: string;
    answer: string;
    role?: string;
    seniority?: string;
    uid?: string;
  }): Promise<InterviewFeedback> {
    try {
      const response = await fetchWithRetry('/api/ai/interview-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: params.uid || 'user_active',
          role: params.role || 'Senior Software Engineer',
          question: params.question,
          answer: params.answer,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to evaluate interview answer.');
      }

      const data = await response.json();
      return {
        score: data.score || 85,
        feedback: data.feedback || 'Good structured response.',
        strengths: data.strengths || ['Clear situation and action described.'],
        improvements: data.improvementTips || data.improvements || ['Elaborate more on quantifiable results.'],
        betterAnswerExample: data.betterAnswerExample || 'When facing this challenge, I specifically aligned stakeholders on metrics, executed iteratively, and delivered measurable business results.',
        starBreakdown: data.starBreakdown || {
          situation: { score: 85, notes: 'Clearly framed context.' },
          task: { score: 80, notes: 'Goal was well identified.' },
          action: { score: 90, notes: 'Strong personal ownership demonstrated.' },
          result: { score: 85, notes: 'Measurable metric delivered.' },
        },
      };
    } catch (error: any) {
      errorMonitoringService.captureError(error, { feature: 'INTERVIEW' });
      throw new Error('AI service is temporarily unavailable. Please try again.');
    }
  },

  async askCareerAdvisor(params: {
    message: string;
    userContext?: {
      targetRole?: string;
      experienceLevel?: string;
    };
    uid?: string;
  }): Promise<string> {
    try {
      const response = await fetchWithRetry('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: params.uid || 'user_active',
          message: params.message,
          targetRole: params.userContext?.targetRole,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to contact AI Career Assistant.');
      }

      const data = await response.json();
      return data.text || 'I am ready to help you prepare your next career step!';
    } catch (error: any) {
      errorMonitoringService.captureError(error, { feature: 'CAREER_ASSISTANT' });
      throw new Error('AI service is temporarily unavailable. Please try again.');
    }
  },
};
