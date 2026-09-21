/**
 * JobReady AI - Candidate WhatsApp Notification Drawer
 * Displays real-time job opening match alerts and direct recruiter messages received via WhatsApp.
 */

import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  X,
  ExternalLink,
  Sparkles,
  Building,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  Send,
  Phone,
  Briefcase,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { WhatsAppNotification } from '../types';

interface WhatsAppNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOpening?: (openingId: string) => void;
}

export const WhatsAppNotificationDrawer: React.FC<WhatsAppNotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectOpening,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications/whatsapp?recipientId=${user?.uid || 'usr_default_career'}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.warn('Failed to load candidate WhatsApp notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, user?.uid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
                <MessageCircle className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">WhatsApp Job Match Alerts</h2>
                <p className="text-xs text-emerald-100 font-medium">Direct recruiter invitations & matches</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Candidate Phone verification card */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Alerts delivered to: <strong>{user?.whatsappNumber || '+91 98765 43210'}</strong>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
              Active
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Checking for new WhatsApp recruiter messages...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">No WhatsApp Job Alerts Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  When verified employers post openings that match your skills, you'll receive direct WhatsApp outreach alerts here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                          {notif.matchScore}% Match
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {notif.jobTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{notif.companyName}</span>
                        <span>•</span>
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{notif.location}</span>
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                      {new Date(notif.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    <p>"{notif.messageText}"</p>
                    <div className="mt-2 text-[10px] text-slate-400 font-medium">
                      From: <strong>{notif.senderName}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{notif.salaryRange}</span>
                    </div>

                    <a
                      href={notif.directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by WhatsApp Cloud Direct Connect</span>
            <button
              onClick={fetchNotifications}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
