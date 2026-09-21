/**
 * JobReady AI - Centralized Data Types & Interfaces
 * Covers Phases 1 - 9 (Authentication, Career Profile, Resume AI, Job Analyzer,
 * Resume Tailoring, Interview Coach, Application Tracker, Career Dashboard,
 * Job Discovery, Monetization & Production Readiness)
 */

export type UserRole = 'candidate' | 'employer' | 'admin';

export type CandidatePlanType = 'FREE' | 'PREMIUM';
export type EmployerPlanType = 'EMPLOYER_FREE' | 'EMPLOYER_GROWTH' | 'EMPLOYER_ENTERPRISE';
export type PlanType = CandidatePlanType | EmployerPlanType;

export type EntitlementStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'UNKNOWN';

export type SubscriptionProvider = 'google_play' | 'stripe' | 'web' | 'demo';

export interface PlanPricing {
  productId: string;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  amount: number;
  currency: string;
  formatted: string;
  trialDays?: number;
}

export interface PlanConfig {
  id: PlanType;
  role: 'candidate' | 'employer';
  name: string;
  tagline: string;
  description: string;
  features: string[];
  badge?: string;
  popular?: boolean;
  limits: {
    resumeAnalysis?: number;
    resumeTailor?: number;
    interviewCoachSessions?: number;
    careerAssistantMessages?: number;
    jobAnalysis?: number;
    jobSearchQueries?: number;
    savedJobs?: number;
    jobAlerts?: number;
    careerPlans?: number;
    skillPracticeSessions?: number;
    jobOpenings?: number;
    candidateMatches?: number;
    whatsappAlertsPerMonth?: number;
    aiAutoScreening?: boolean;
    directChatOutreach?: boolean;
  };
  pricing?: {
    monthly: PlanPricing;
    yearly: PlanPricing;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserEntitlement {
  uid: string;
  role?: UserRole;
  planId: PlanType;
  status: EntitlementStatus;
  provider: SubscriptionProvider;
  productId: string;
  purchaseToken?: string;
  orderId?: string;
  startDate: string;
  expiryDate?: string;
  autoRenewing: boolean;
  isTrial?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserUsage {
  uid: string;
  period: string; // e.g. "2026-09"
  resumeAnalysisCount: number;
  resumeTailorCount: number;
  interviewCount: number;
  assistantMessageCount: number;
  jobAnalysisCount: number;
  jobSearchCount: number;
  jobAlertCount: number;
  careerPlanCount: number;
  skillPracticeCount: number;
  jobOpeningsCount?: number;
  whatsappAlertsSentCount?: number;
  updatedAt: string;
}

export type AIFeatureType =
  | 'RESUME_ANALYSIS'
  | 'RESUME_TAILOR'
  | 'JOB_ANALYSIS'
  | 'INTERVIEW'
  | 'CAREER_ASSISTANT'
  | 'JOB_RECOMMENDATION'
  | 'CAREER_PLAN'
  | 'CANDIDATE_MATCH'
  | 'WHATSAPP_DISPATCH';

export interface AIUsageRecord {
  requestId: string;
  uid: string;
  feature: AIFeatureType;
  inputLength: number;
  outputLength: number;
  estimatedTokens: number;
  estimatedCostUSD: number;
  cached: boolean;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  whatsappNumber?: string;
  // Candidate specific fields
  careerGoal: string;
  targetRole: string;
  preferredLocation: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  targetSalaryMin?: number;
  targetSalaryMax?: number;
  salaryCurrency?: string;
  employmentType: 'Full-time' | 'Contract' | 'Remote' | 'Hybrid' | 'Part-time';
  skills: string[];
  resumeUrl?: string;
  resumeText?: string;
  atsScore?: number;
  openToWork?: boolean;
  // Employer specific fields
  companyName?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  recruiterTitle?: string;
  companyLocation?: string;
  companyDescription?: string;
  hiringVerified?: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  dailyPlan: boolean;
  interviewReminders: boolean;
  followUpReminders: boolean;
  jobAlerts: boolean;
  whatsappJobAlerts: boolean;
  whatsappCandidateMessages: boolean;
  weeklySummary: boolean;
  marketingEmails: boolean;
}

// Employer Job Opening Model
export interface JobOpening {
  id: string;
  employerId: string;
  employerName: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  department: string;
  location: string;
  workplaceType: 'Remote' | 'On-site' | 'Hybrid';
  employmentType: 'Full-time' | 'Contract' | 'Part-time' | 'Internship';
  experienceMinYears: number;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills?: string[];
  status: 'OPEN' | 'PAUSED' | 'CLOSED';
  autoWhatsAppMatch: boolean;
  whatsappTemplate?: string;
  applicantsCount: number;
  matchedCount: number;
  createdAt: string;
  updatedAt: string;
}

// AI Candidate Match Model
export interface CandidateMatch {
  id: string;
  openingId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateRole: string;
  candidateExperience: string;
  candidateLocation: string;
  candidateSkills: string[];
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  aiRecommendation: string;
  whatsappSent: boolean;
  whatsappSentAt?: string;
  whatsappMessage?: string;
  whatsappUrl?: string;
  status: 'MATCHED' | 'NOTIFIED' | 'INTERVIEW_INVITED' | 'SHORTLISTED' | 'REJECTED';
  matchedAt: string;
}

// WhatsApp Notification Log
export interface WhatsAppNotification {
  id: string;
  recipientId: string;
  recipientPhone: string;
  recipientName: string;
  openingId?: string;
  jobTitle: string;
  companyName: string;
  location: string;
  salaryRange: string;
  matchScore: number;
  messageText: string;
  directWhatsAppUrl: string;
  senderName: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  sentAt: string;
}

export interface PrivacyPreferences {
  shareAnalytics: boolean;
  aiProcessingConsent: boolean;
  jobPersonalizationConsent: boolean;
  crashReportingConsent: boolean;
}

// Phase 2: Resume AI
export interface Resume {
  id: string;
  uid: string;
  fileName: string;
  uploadedAt: string;
  rawText: string;
  analysis?: ResumeAnalysis;
}

export interface ResumeAnalysis {
  id?: string;
  uid?: string;
  resumeId?: string;
  overallScore: number;
  atsCompatibilityScore: number;
  impactScore: number;
  structureScore: number;
  skillsScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordsDetected: string[];
  missingKeywords: string[];
  createdAt?: string;
  analyzedAt?: string;
}

// Phase 4: Resume Tailoring & Versions
export interface ResumeVersion {
  id: string;
  uid: string;
  resumeId: string;
  jobTitle: string;
  companyName: string;
  tailoredContent: string;
  tailoredSummary: string;
  matchScore: number;
  changesSummary: string[];
  createdAt: string;
}

// Phase 3 & 8: Job Description Analyzer & Discovery
export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  salary?: string;
  description: string;
  skills: string[];
  skillsRequired?: string[];
  source?: 'LinkedIn' | 'Indeed' | 'Internal' | 'Direct';
  postedAt?: string;
  url?: string;
  matchScore?: number;
}

export interface JobAnalysis {
  id: string;
  uid: string;
  jobTitle: string;
  company: string;
  rawJobDescription?: string;
  matchScore: number;
  skillsMatch: {
    matching: string[];
    missing: string[];
    partial?: string[];
  };
  keyResponsibilities?: string[];
  recommendations: string[];
  analyzedAt?: string;
}

export interface JobAlert {
  id: string;
  uid: string;
  title?: string;
  query: string;
  keywords?: string[];
  location?: string;
  frequency: 'Daily' | 'Weekly' | 'Instant' | 'DAILY' | 'WEEKLY' | 'INSTANT';
  enabled?: boolean;
  isActive?: boolean;
  createdAt: string;
}

export interface SavedJob {
  id: string;
  uid: string;
  job: JobListing;
  notes?: string;
  savedAt: string;
}

// Phase 5: Interview Coach
export interface StarSection {
  score: number;
  notes: string;
}

export interface InterviewFeedback {
  score: number;
  feedback?: string;
  strengths: string[];
  improvements: string[];
  betterAnswerExample?: string;
  starBreakdown: {
    situation: StarSection;
    task: StarSection;
    action: StarSection;
    result: StarSection;
  };
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'Behavioral' | 'Technical' | 'Situational' | 'Leadership';
  userAnswer?: string;
  feedback?: string;
  score?: number;
  strengths?: string[];
  improvementTips?: string[];
}

export interface InterviewSession {
  id: string;
  uid: string;
  targetRole: string;
  targetCompany?: string;
  difficulty: 'Junior' | 'Mid' | 'Senior';
  questions: InterviewQuestion[];
  status: 'IN_PROGRESS' | 'COMPLETED';
  overallScore?: number;
  startedAt: string;
  completedAt?: string;
  reportSummary?: string;
}

// Phase 6: Application Tracker
export type ApplicationStatus = 'Wishlist' | 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';

export interface FollowUpTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface JobApplication {
  id: string;
  uid: string;
  companyName: string;
  company?: string;
  jobTitle: string;
  location?: string;
  salary?: string;
  status: ApplicationStatus;
  appliedDate: string;
  followUpDate?: string;
  contactName?: string;
  jobUrl?: string;
  resumeVersionId?: string;
  notes?: string;
  followUps?: FollowUpTask[];
  history?: {
    status: ApplicationStatus;
    date: string;
    note?: string;
  }[];
  createdAt?: string;
  updatedAt: string;
}

// Phase 7: Career Dashboard & Daily Plan
export interface DailyTask {
  id: string;
  title: string;
  category: 'Resume' | 'Application' | 'Interview' | 'Skill' | 'JobMatch' | 'FollowUp';
  priority?: 'High' | 'Medium' | 'Low';
  completed: boolean;
  estimatedMinutes?: number;
  actionLink?: string;
  actionRoute?: string;
}

export interface DailyPlan {
  id: string;
  uid: string;
  date: string;
  readinessScore: number;
  tasks: DailyTask[];
  generatedAdvice?: string;
}

export interface WeeklySummary {
  id: string;
  uid: string;
  weekRange: string;
  applicationsSubmitted: number;
  interviewsPracticed: number;
  resumesTailored: number;
  readinessDelta: number;
  keyHighlights: string[];
}

export interface InAppNotification {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'REMINDER' | 'ALERT';
  read: boolean;
  createdAt: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  featureContext?: string;
}

// Phase 9: Production, Remote Config & Telemetry
export interface FeatureFlags {
  jobSearchEnabled: boolean;
  jobAlertsEnabled: boolean;
  careerAssistantEnabled: boolean;
  premiumEnabled: boolean;
  interviewCoachEnabled: boolean;
  aiTailoringEnabled: boolean;
}

export interface RemoteAppConfig {
  appVersion: string;
  buildNumber: number;
  minimumSupportedVersion: string;
  latestVersion: string;
  updateMessage?: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  featureFlags: FeatureFlags;
  freeLimits: PlanConfig['limits'];
  premiumLimits: PlanConfig['limits'];
  pricing: {
    monthly: PlanPricing;
    yearly: PlanPricing;
  };
  paywallHeadline: string;
  paywallSubheadline: string;
}

export type FeedbackCategory = 'Bug' | 'Feature request' | 'Suggestion' | 'Other';

export interface FeedbackSubmission {
  id: string;
  uid: string;
  category: FeedbackCategory;
  message: string;
  rating?: number;
  appVersion: string;
  platform: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  event: string;
  uid?: string;
  timestamp: string;
  properties?: Record<string, string | number | boolean | null>;
}

export interface CrashReport {
  id: string;
  errorName: string;
  errorMessage: string;
  stack?: string;
  platform: string;
  appVersion: string;
  timestamp: string;
  context?: Record<string, string | number | boolean>;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsersMonthly: number;
  freeUsers: number;
  premiumUsers: number;
  conversionRate: number;
  totalAIRequests: number;
  totalTokensUsed: number;
  estimatedAICostUSD: number;
  averageAICostPerUserUSD: number;
  jobSearchesCount: number;
  applicationsCount: number;
  interviewsCompletedCount: number;
}
