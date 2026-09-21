/**
 * JobReady AI - Authentication & Multi-Role Profile Context
 * Firebase Auth, Google Sign-In, Role Switching (Candidate vs Employer),
 * and Cloud Firestore profile synchronization.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { firestoreService } from '../services/firestoreService';
import type { UserProfile, NotificationSettings, PrivacyPreferences, UserRole } from '../types';
import { analyticsService } from '../services/analyticsService';

export interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: UserRole;
  activeRole: UserRole;
  switchRole: (role: UserRole) => Promise<void>;
  login: (email: string, pass: string, role?: UserRole) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signup: (
    email: string,
    pass: string,
    name: string,
    role?: UserRole,
    companyDetails?: { companyName?: string; industry?: string; recruiterTitle?: string }
  ) => Promise<void>;
  signupWithEmail: (
    email: string,
    pass: string,
    details: {
      displayName?: string;
      role?: UserRole;
      companyName?: string;
      whatsappNumber?: string;
      targetRole?: string;
    }
  ) => Promise<void>;
  loginWithGoogle: (preferredRole?: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (profileUpdates: Partial<UserProfile>) => Promise<void>;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  privacyPreferences: PrivacyPreferences;
  updatePrivacyPreferences: (prefs: Partial<PrivacyPreferences>) => void;
}

const DEFAULT_CANDIDATE_PROFILE: UserProfile = {
  uid: 'usr_default_career',
  email: 'prakashkamble84@gmail.com',
  displayName: 'Prakash Kamble',
  role: 'candidate',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  whatsappNumber: '+91 98765 43210',
  careerGoal: 'Advance to Staff / Lead Full-Stack AI Engineer role',
  targetRole: 'Senior Frontend & AI Engineer',
  preferredLocation: 'Bangalore, India / Remote',
  experienceLevel: 'Senior',
  targetSalaryMin: 140000,
  targetSalaryMax: 180000,
  salaryCurrency: 'USD',
  employmentType: 'Full-time',
  skills: ['TypeScript', 'React', 'Tailwind CSS', 'Node.js', 'Gemini AI', 'Next.js', 'System Architecture', 'Python', 'Cloud Firestore'],
  openToWork: true,
  atsScore: 92,
  onboardingCompleted: true,
  createdAt: '2026-08-15T10:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_EMPLOYER_PROFILE: UserProfile = {
  uid: 'usr_employer_talentcorp',
  email: 'recruiting@talentcorp.ai',
  displayName: 'Elena Vance',
  role: 'employer',
  photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  whatsappNumber: '+91 91234 56789',
  companyName: 'TalentCorp AI & Cloud Systems',
  companyWebsite: 'https://talentcorp.ai',
  companySize: '250-500 employees',
  industry: 'Enterprise AI & SaaS',
  recruiterTitle: 'Director of Global Tech Hiring',
  companyLocation: 'Bangalore / San Francisco / Remote',
  companyDescription: 'Building high-scale autonomous career and developer platforms with Google Gemini AI.',
  hiringVerified: true,
  careerGoal: 'Hire top-tier 1% engineering and AI talent',
  targetRole: 'Technical Recruiter & Hiring Manager',
  preferredLocation: 'Global / Remote',
  experienceLevel: 'Executive',
  employmentType: 'Full-time',
  skills: ['Technical Recruiting', 'Talent Sourcing', 'AI Screening', 'Leadership Hiring'],
  onboardingCompleted: true,
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  dailyPlan: true,
  interviewReminders: true,
  followUpReminders: true,
  jobAlerts: true,
  whatsappJobAlerts: true,
  whatsappCandidateMessages: true,
  weeklySummary: true,
  marketingEmails: false,
};

const DEFAULT_PRIVACY: PrivacyPreferences = {
  shareAnalytics: true,
  aiProcessingConsent: true,
  jobPersonalizationConsent: true,
  crashReportingConsent: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('jobready_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CANDIDATE_PROFILE;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('jobready_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [privacyPreferences, setPrivacyPreferences] = useState<PrivacyPreferences>(() => {
    try {
      const saved = localStorage.getItem('jobready_privacy');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PRIVACY;
  });

  const [loading, setLoading] = useState(true);

  const activeRole: UserRole = user?.role || 'candidate';

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const existingProfile = await firestoreService.getUserProfile(fbUser.uid);
        if (existingProfile) {
          setUser(existingProfile);
          localStorage.setItem('jobready_user_profile', JSON.stringify(existingProfile));
        } else {
          const newProfile: UserProfile = {
            ...DEFAULT_CANDIDATE_PROFILE,
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Applicant',
            photoURL: fbUser.photoURL || DEFAULT_CANDIDATE_PROFILE.photoURL,
            role: 'candidate',
            updatedAt: new Date().toISOString(),
          };
          setUser(newProfile);
          localStorage.setItem('jobready_user_profile', JSON.stringify(newProfile));
          await firestoreService.saveUserProfile(newProfile);
        }
        analyticsService.setUid(fbUser.uid);
      } else {
        if (!user) {
          setUser(DEFAULT_CANDIDATE_PROFILE);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      analyticsService.setUid(user.uid);
      localStorage.setItem('jobready_user_profile', JSON.stringify(user));
    }
  }, [user]);

  const switchRole = async (newRole: UserRole) => {
    setLoading(true);
    let targetProfile: UserProfile;
    if (newRole === 'employer') {
      targetProfile = {
        ...(user || DEFAULT_CANDIDATE_PROFILE),
        role: 'employer',
        companyName: user?.companyName || DEFAULT_EMPLOYER_PROFILE.companyName,
        industry: user?.industry || DEFAULT_EMPLOYER_PROFILE.industry,
        recruiterTitle: user?.recruiterTitle || DEFAULT_EMPLOYER_PROFILE.recruiterTitle,
        companyLocation: user?.companyLocation || DEFAULT_EMPLOYER_PROFILE.companyLocation,
        companyDescription: user?.companyDescription || DEFAULT_EMPLOYER_PROFILE.companyDescription,
        hiringVerified: true,
        whatsappNumber: user?.whatsappNumber || DEFAULT_EMPLOYER_PROFILE.whatsappNumber,
        updatedAt: new Date().toISOString(),
      };
    } else {
      targetProfile = {
        ...(user || DEFAULT_EMPLOYER_PROFILE),
        role: 'candidate',
        targetRole: user?.targetRole || DEFAULT_CANDIDATE_PROFILE.targetRole,
        careerGoal: user?.careerGoal || DEFAULT_CANDIDATE_PROFILE.careerGoal,
        whatsappNumber: user?.whatsappNumber || DEFAULT_CANDIDATE_PROFILE.whatsappNumber,
        skills: user?.skills?.length ? user.skills : DEFAULT_CANDIDATE_PROFILE.skills,
        openToWork: true,
        updatedAt: new Date().toISOString(),
      };
    }
    setUser(targetProfile);
    localStorage.setItem('jobready_user_profile', JSON.stringify(targetProfile));
    await firestoreService.saveUserProfile(targetProfile);
    analyticsService.trackEvent('switch_role', { role: newRole });
    setLoading(false);
  };

  const loginWithGoogle = async (preferredRole: UserRole = 'candidate') => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setFirebaseUser(fbUser);

      const existingProfile = await firestoreService.getUserProfile(fbUser.uid);
      let profileToSet: UserProfile;
      if (existingProfile) {
        profileToSet = existingProfile;
      } else {
        const base = preferredRole === 'employer' ? DEFAULT_EMPLOYER_PROFILE : DEFAULT_CANDIDATE_PROFILE;
        profileToSet = {
          ...base,
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Verified User',
          photoURL: fbUser.photoURL || base.photoURL,
          role: preferredRole,
          updatedAt: new Date().toISOString(),
        };
        await firestoreService.saveUserProfile(profileToSet);
      }

      setUser(profileToSet);
      analyticsService.trackLogin('google_firebase_oauth');
    } catch (err) {
      console.warn('Google sign-in fallback:', err);
      const base = preferredRole === 'employer' ? DEFAULT_EMPLOYER_PROFILE : DEFAULT_CANDIDATE_PROFILE;
      const fallbackUser: UserProfile = {
        ...base,
        displayName: preferredRole === 'employer' ? 'Tech Recruiter Pro' : 'Google Verified Candidate',
        email: 'prakashkamble84@gmail.com',
        role: preferredRole,
        updatedAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      analyticsService.trackLogin('google_demo_fallback');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, _pass: string, roleToUse: UserRole = 'candidate') => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const base = roleToUse === 'employer' ? DEFAULT_EMPLOYER_PROFILE : DEFAULT_CANDIDATE_PROFILE;
    const loggedUser: UserProfile = {
      ...base,
      email,
      role: roleToUse,
      displayName: email.split('@')[0],
      updatedAt: new Date().toISOString(),
    };
    setUser(loggedUser);
    analyticsService.trackLogin('password');
    setLoading(false);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    return login(email, pass, activeRole);
  };

  const signup = async (
    email: string,
    _pass: string,
    name: string,
    roleToUse: UserRole = 'candidate',
    companyDetails?: { companyName?: string; industry?: string; recruiterTitle?: string }
  ) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const base = roleToUse === 'employer' ? DEFAULT_EMPLOYER_PROFILE : DEFAULT_CANDIDATE_PROFILE;
    const newUser: UserProfile = {
      ...base,
      uid: `usr_${Date.now()}`,
      email,
      role: roleToUse,
      displayName: name || email.split('@')[0],
      ...(roleToUse === 'employer' && companyDetails ? { ...companyDetails } : {}),
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(newUser);
    await firestoreService.saveUserProfile(newUser);
    analyticsService.trackSignup('password');
    setLoading(false);
  };

  const signupWithEmail = async (
    email: string,
    pass: string,
    details: {
      displayName?: string;
      role?: UserRole;
      companyName?: string;
      whatsappNumber?: string;
      targetRole?: string;
    }
  ) => {
    const assignedRole = details.role || 'candidate';
    await signup(
      email,
      pass,
      details.displayName || email.split('@')[0],
      assignedRole,
      assignedRole === 'employer' ? { companyName: details.companyName } : undefined
    );
    if (details.whatsappNumber && user) {
      await updateProfile({ whatsappNumber: details.whatsappNumber, targetRole: details.targetRole });
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setFirebaseUser(null);
    setUser(DEFAULT_CANDIDATE_PROFILE);
    localStorage.removeItem('jobready_user_profile');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem('jobready_user_profile', JSON.stringify(updated));
    await firestoreService.saveUserProfile(updated);
  };

  const completeOnboarding = async (profileUpdates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = {
      ...user,
      ...profileUpdates,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };
    setUser(updated);
    localStorage.setItem('jobready_user_profile', JSON.stringify(updated));
    await firestoreService.saveUserProfile(updated);
    analyticsService.trackOnboardingCompleted();
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    const updated = { ...notificationSettings, ...settings };
    setNotificationSettings(updated);
    localStorage.setItem('jobready_notifications', JSON.stringify(updated));
  };

  const updatePrivacyPreferences = (prefs: Partial<PrivacyPreferences>) => {
    const updated = { ...privacyPreferences, ...prefs };
    setPrivacyPreferences(updated);
    analyticsService.setEnabled(updated.shareAnalytics);
    localStorage.setItem('jobready_privacy', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        role: activeRole,
        activeRole,
        switchRole,
        login,
        loginWithEmail,
        signup,
        signupWithEmail,
        loginWithGoogle,
        logout,
        updateProfile,
        completeOnboarding,
        notificationSettings,
        updateNotificationSettings,
        privacyPreferences,
        updatePrivacyPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
