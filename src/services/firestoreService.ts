/**
 * JobReady AI - Firestore Data Persistence Service
 * Handles user profiles, applications, resumes, chat threads, and interview history.
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  UserProfile,
  JobApplication,
  ResumeAnalysis,
  ResumeVersion,
  SavedJob,
  JobAlert,
  InterviewSession,
} from '../types';

export interface ChatThreadMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  modelUsed?: string;
  citations?: Array<{ title: string; url: string }>;
  mapPlaces?: Array<{ name: string; address?: string; uri?: string }>;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  uid: string;
  title: string;
  rolePreset: string;
  modelId: string;
  messages: ChatThreadMessage[];
  createdAt: string;
  updatedAt: string;
}

export const firestoreService = {
  // User Profile
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      const ref = doc(db, 'profiles', profile.uid);
      await setDoc(ref, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore profile save fallback:', err);
    }
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const ref = doc(db, 'profiles', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('Firestore profile get fallback:', err);
    }
    return null;
  },

  // Job Applications
  async saveApplication(app: JobApplication): Promise<void> {
    try {
      const ref = doc(db, 'applications', app.id);
      await setDoc(ref, app, { merge: true });
    } catch (err) {
      console.warn('Firestore application save fallback:', err);
    }
  },

  async getApplications(uid: string): Promise<JobApplication[]> {
    try {
      const q = query(collection(db, 'applications'), where('uid', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as JobApplication);
    } catch (err) {
      console.warn('Firestore applications get fallback:', err);
      return [];
    }
  },

  async deleteApplication(appId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'applications', appId));
    } catch (err) {
      console.warn('Firestore application delete fallback:', err);
    }
  },

  // Chat Threads
  async saveChatThread(thread: ChatThread): Promise<void> {
    try {
      const ref = doc(db, 'chat_threads', thread.id);
      await setDoc(ref, thread, { merge: true });
    } catch (err) {
      console.warn('Firestore chat thread save fallback:', err);
    }
  },

  async getChatThreads(uid: string): Promise<ChatThread[]> {
    try {
      const q = query(collection(db, 'chat_threads'), where('uid', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as ChatThread);
    } catch (err) {
      console.warn('Firestore chat threads get fallback:', err);
      return [];
    }
  },

  async deleteChatThread(threadId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'chat_threads', threadId));
    } catch (err) {
      console.warn('Firestore chat thread delete fallback:', err);
    }
  },

  // Saved Jobs
  async saveJobItem(savedJob: SavedJob): Promise<void> {
    try {
      const ref = doc(db, 'saved_jobs', savedJob.id);
      await setDoc(ref, savedJob, { merge: true });
    } catch (err) {
      console.warn('Firestore saved job save fallback:', err);
    }
  },

  async getSavedJobs(uid: string): Promise<SavedJob[]> {
    try {
      const q = query(collection(db, 'saved_jobs'), where('uid', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as SavedJob);
    } catch (err) {
      console.warn('Firestore saved jobs get fallback:', err);
      return [];
    }
  },

  async removeSavedJob(savedJobId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'saved_jobs', savedJobId));
    } catch (err) {
      console.warn('Firestore remove saved job fallback:', err);
    }
  },

  // Job Alerts
  async saveJobAlert(alert: JobAlert): Promise<void> {
    try {
      const ref = doc(db, 'job_alerts', alert.id);
      await setDoc(ref, alert, { merge: true });
    } catch (err) {
      console.warn('Firestore alert save fallback:', err);
    }
  },

  async getJobAlerts(uid: string): Promise<JobAlert[]> {
    try {
      const q = query(collection(db, 'job_alerts'), where('uid', '==', uid));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as JobAlert);
    } catch (err) {
      console.warn('Firestore alerts get fallback:', err);
      return [];
    }
  },

  async deleteJobAlert(alertId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'job_alerts', alertId));
    } catch (err) {
      console.warn('Firestore alert delete fallback:', err);
    }
  },

  // Employer Job Openings
  async saveJobOpening(opening: any): Promise<void> {
    try {
      const ref = doc(db, 'job_openings', opening.id);
      await setDoc(ref, { ...opening, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.warn('Firestore save job opening fallback:', err);
    }
  },

  async getJobOpenings(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, 'job_openings'));
      return snap.docs.map((d) => d.data());
    } catch (err) {
      console.warn('Firestore get all openings fallback:', err);
      return [];
    }
  },

  async getEmployerOpenings(employerId: string): Promise<any[]> {
    try {
      const q = query(collection(db, 'job_openings'), where('employerId', '==', employerId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (err) {
      console.warn('Firestore get employer openings fallback:', err);
      return [];
    }
  },

  async deleteJobOpening(openingId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'job_openings', openingId));
    } catch (err) {
      console.warn('Firestore delete opening fallback:', err);
    }
  },

  // Candidate Matches
  async saveCandidateMatch(match: any): Promise<void> {
    try {
      const ref = doc(db, 'candidate_matches', match.id);
      await setDoc(ref, match, { merge: true });
    } catch (err) {
      console.warn('Firestore save candidate match fallback:', err);
    }
  },

  async getCandidateMatches(openingId?: string): Promise<any[]> {
    try {
      if (openingId) {
        const q = query(collection(db, 'candidate_matches'), where('openingId', '==', openingId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data());
      }
      const snap = await getDocs(collection(db, 'candidate_matches'));
      return snap.docs.map((d) => d.data());
    } catch (err) {
      console.warn('Firestore get candidate matches fallback:', err);
      return [];
    }
  },

  // WhatsApp Notifications
  async saveWhatsAppNotification(notification: any): Promise<void> {
    try {
      const ref = doc(db, 'whatsapp_notifications', notification.id);
      await setDoc(ref, notification, { merge: true });
    } catch (err) {
      console.warn('Firestore save whatsapp notification fallback:', err);
    }
  },

  async getWhatsAppNotifications(recipientId?: string): Promise<any[]> {
    try {
      if (recipientId) {
        const q = query(collection(db, 'whatsapp_notifications'), where('recipientId', '==', recipientId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data());
      }
      const snap = await getDocs(collection(db, 'whatsapp_notifications'));
      return snap.docs.map((d) => d.data());
    } catch (err) {
      console.warn('Firestore get whatsapp notifications fallback:', err);
      return [];
    }
  },

  // All Candidate Profiles for Matchmaking
  async getCandidateProfiles(): Promise<UserProfile[]> {
    try {
      const q = query(collection(db, 'profiles'), where('role', '==', 'candidate'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as UserProfile);
    } catch (err) {
      console.warn('Firestore candidate profiles fallback:', err);
      return [];
    }
  },
};
