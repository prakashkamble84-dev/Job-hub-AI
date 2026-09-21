/**
 * JobReady AI - Job Discovery & Aggregator Service
 * Provides job search, skill matching calculations, saved jobs, and alert notifications.
 */

import type { JobListing, JobAlert, SavedJob } from '../types';

export const INITIAL_JOB_LISTINGS: JobListing[] = [
  {
    id: 'job_1',
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    location: 'Remote, US / APAC',
    employmentType: 'Full-time',
    salary: '$140,000 - $180,000 / yr',
    description: 'Lead modern payment dashboard interfaces with React, TypeScript, and high-performance WebSockets. Focus on reliability, micro-frontend architecture, and world-class design fidelity.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Management', 'Testing'],
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Management', 'Testing'],
    source: 'Direct',
    postedAt: '2 days ago',
    url: 'https://stripe.com/jobs',
  },
  {
    id: 'job_2',
    title: 'Full Stack AI Developer',
    company: 'Vercel',
    location: 'Remote / Hybrid',
    employmentType: 'Full-time',
    salary: '$130,000 - $170,000 / yr',
    description: 'Build enterprise AI-assisted workflow tools. Leverage GenAI APIs, edge computing, streaming UI responses, and serverless architectures.',
    skills: ['TypeScript', 'Node.js', 'React', 'Gemini API', 'PostgreSQL', 'API Design'],
    skillsRequired: ['TypeScript', 'Node.js', 'React', 'Gemini API', 'PostgreSQL', 'API Design'],
    source: 'LinkedIn',
    postedAt: '1 day ago',
    url: 'https://vercel.com/careers',
  },
  {
    id: 'job_3',
    title: 'Product Engineer (Growth)',
    company: 'Linear',
    location: 'Remote',
    employmentType: 'Full-time',
    salary: '$125,000 - $160,000 / yr',
    description: 'Craft frictionless onboarding flows, team collaboration workspaces, and high-velocity product experiments with extreme aesthetic attention to detail.',
    skills: ['React', 'TypeScript', 'UI/UX Design', 'Analytics', 'GraphQL'],
    skillsRequired: ['React', 'TypeScript', 'UI/UX Design', 'Analytics', 'GraphQL'],
    source: 'Indeed',
    postedAt: '3 days ago',
    url: 'https://linear.app/careers',
  },
  {
    id: 'job_4',
    title: 'Software Engineer - Mobile & Web',
    company: 'DoorDash',
    location: 'San Francisco, CA / Hybrid',
    employmentType: 'Full-time',
    salary: '$135,000 - $165,000 / yr',
    description: 'Deliver seamless real-time merchant and customer experiences across responsive web and mobile clients with robust offline caching and high throughput.',
    skills: ['React', 'TypeScript', 'Android', 'REST APIs', 'Performance Optimization'],
    skillsRequired: ['React', 'TypeScript', 'Android', 'REST APIs', 'Performance Optimization'],
    source: 'LinkedIn',
    postedAt: '4 days ago',
    url: 'https://doordash.com/careers',
  },
  {
    id: 'job_5',
    title: 'Backend Systems Engineer',
    company: 'Cloudflare',
    location: 'Remote, Global',
    employmentType: 'Full-time',
    salary: '$145,000 - $190,000 / yr',
    description: 'Architect low-latency serverless workers, distributed storage sync, and secure edge caching pipelines processing millions of requests per second.',
    skills: ['Go', 'TypeScript', 'Node.js', 'Distributed Systems', 'Security'],
    skillsRequired: ['Go', 'TypeScript', 'Node.js', 'Distributed Systems', 'Security'],
    source: 'Direct',
    postedAt: 'Just now',
    url: 'https://cloudflare.com/careers',
  },
];

class JobService {
  private savedJobs: SavedJob[] = [];
  private jobAlerts: JobAlert[] = [];

  constructor() {
    this.loadSaved();
  }

  private loadSaved() {
    try {
      const saved = localStorage.getItem('jobready_saved_jobs');
      if (saved) this.savedJobs = JSON.parse(saved);
      const alerts = localStorage.getItem('jobready_job_alerts');
      if (alerts) this.jobAlerts = JSON.parse(alerts);
    } catch {
      // storage safety
    }
  }

  public getJobs(query = '', location = '', filterType = ''): JobListing[] {
    let list = [...INITIAL_JOB_LISTINGS];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (location) {
      const loc = location.toLowerCase();
      list = list.filter((j) => j.location.toLowerCase().includes(loc));
    }
    if (filterType && filterType !== 'All') {
      list = list.filter((j) => j.employmentType.toLowerCase() === filterType.toLowerCase());
    }
    return list;
  }

  public async searchJobs(params: {
    query?: string;
    location?: string;
    type?: string;
    experienceLevel?: string;
    remoteOnly?: boolean;
  }): Promise<JobListing[]> {
    return this.getJobs(params.query || '', params.location || '', params.type || '');
  }

  public computeMatchScore(job: JobListing, userSkills: string[]): number {
    if (!userSkills || userSkills.length === 0) return 70;
    const lowerUser = userSkills.map((s) => s.toLowerCase());
    const jobSkills = job.skills || job.skillsRequired || [];
    const matches = jobSkills.filter((s) => lowerUser.includes(s.toLowerCase()));
    const ratio = matches.length / Math.max(1, jobSkills.length);
    return Math.min(98, Math.max(60, Math.round(ratio * 40 + 58)));
  }

  public async getSavedJobs(uid?: string): Promise<SavedJob[]> {
    return this.savedJobs;
  }

  public isSaved(jobId: string): boolean {
    return this.savedJobs.some((s) => s.job.id === jobId);
  }

  public toggleSaveJob(uid: string, job: JobListing, notes = ''): boolean {
    const existingIndex = this.savedJobs.findIndex((s) => s.job.id === job.id);
    if (existingIndex >= 0) {
      this.savedJobs.splice(existingIndex, 1);
      localStorage.setItem('jobready_saved_jobs', JSON.stringify(this.savedJobs));
      return false;
    } else {
      this.savedJobs.push({
        id: `saved_${Date.now()}`,
        uid,
        job,
        notes,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem('jobready_saved_jobs', JSON.stringify(this.savedJobs));
      return true;
    }
  }

  public async getJobAlerts(uid?: string): Promise<JobAlert[]> {
    return this.jobAlerts;
  }

  public createJobAlert(
    uid: string | { uid?: string; query: string; location?: string; frequency: 'Daily' | 'Weekly' | 'Instant' },
    title?: string,
    keywords?: string[],
    location?: string,
    frequency?: 'Daily' | 'Weekly' | 'Instant' | 'DAILY' | 'WEEKLY' | 'INSTANT'
  ): JobAlert {
    let alert: JobAlert;
    if (typeof uid === 'object') {
      alert = {
        id: `alert_${Date.now()}`,
        uid: uid.uid || 'user_active',
        query: uid.query,
        location: uid.location || 'Remote',
        frequency: uid.frequency,
        enabled: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    } else {
      alert = {
        id: `alert_${Date.now()}`,
        uid,
        title: title || 'Job Alert',
        query: title || (keywords ? keywords.join(', ') : 'Alert'),
        keywords: keywords || [],
        location: location || 'Remote',
        frequency: frequency || 'Daily',
        enabled: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    }
    this.jobAlerts.push(alert);
    localStorage.setItem('jobready_job_alerts', JSON.stringify(this.jobAlerts));
    return alert;
  }

  public deleteJobAlert(alertId: string) {
    this.jobAlerts = this.jobAlerts.filter((a) => a.id !== alertId);
    localStorage.setItem('jobready_job_alerts', JSON.stringify(this.jobAlerts));
  }
}

export const jobService = new JobService();
