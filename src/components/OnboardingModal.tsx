/**
 * JobReady AI - 7-Step Guided Onboarding Flow
 * Accelerates users to their First Value Moment (Resume analysis & career readiness).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  MapPin,
  Award,
  Upload,
  Search,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onAnalyzeInitialResume: (resumeText: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onAnalyzeInitialResume,
}) => {
  const { completeOnboarding, user } = useAuth();
  const [step, setStep] = useState(1);

  // Form states
  const [careerGoal, setCareerGoal] = useState(user?.careerGoal || 'Land a Senior Frontend or Full-Stack Engineering role in top tech');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Senior Frontend Engineer');
  const [preferredLocation, setPreferredLocation] = useState(user?.preferredLocation || 'Remote / Bangalore');
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive'>('Senior');
  const [resumeText, setResumeText] = useState(
    `ALEX MORGAN\nEmail: alex.morgan@example.com | Location: Remote\n\nPROFESSIONAL SUMMARY\nSenior Frontend Engineer with 5+ years of experience building scalable web applications with React, TypeScript, and Tailwind CSS. Proven track record of optimizing client-side performance and collaborating with cross-functional teams.\n\nEXPERIENCE\nFrontend Engineer | TechCorp Inc (2021 - Present)\n- Built responsive dashboard interfaces serving 500k+ monthly active users.\n- Reduced bundle load time by 38% via code-splitting and asset optimization.\n- Mentored 4 junior engineers on modern TypeScript patterns.\n\nSKILLS\nReact, TypeScript, Next.js, Tailwind CSS, Node.js, GraphQL, State Management, Jest, Git`
  );
  const [employmentType, setEmploymentType] = useState('Full-time');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 7) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    completeOnboarding({
      careerGoal,
      targetRole,
      preferredLocation,
      experienceLevel,
      employmentType: employmentType as any,
    });
    if (resumeText) {
      onAnalyzeInitialResume(resumeText);
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4"
      >
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Step {step} of 7</span>
            </div>
            <button
              onClick={finishOnboarding}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Skip to Dashboard
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: CAREER GOAL */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">What is your primary career goal?</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    JobReady AI personalizes your daily preparation plan and mock interviews around this target.
                  </p>
                </div>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. Land a Senior Frontend role at a high-growth tech startup"
                  className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </motion.div>
            )}

            {/* STEP 2: TARGET ROLE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">What job title are you targeting?</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    We will tailor keyword scans and interview drills specifically for this position.
                  </p>
                </div>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </motion.div>
            )}

            {/* STEP 3: PREFERRED LOCATION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Where would you like to work?</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Select locations for curated job recommendations and alerts.
                  </p>
                </div>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Remote, San Francisco, Bangalore"
                  className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </motion.div>
            )}

            {/* STEP 4: EXPERIENCE LEVEL */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">What is your experience level?</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    This calibrates question difficulty and resume ATS metrics.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['Entry', 'Mid', 'Senior', 'Lead', 'Executive'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                        experienceLevel === lvl
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: RESUME INPUT */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Add your current resume text</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Paste your resume text to instantly calculate your ATS score and skill gaps.
                  </p>
                </div>
                <textarea
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </motion.div>
            )}

            {/* STEP 6: JOB SEARCH PREFERENCE */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Employment Type Preference</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Select your primary work arrangement preference.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Full-time', 'Contract', 'Remote', 'Hybrid'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEmploymentType(type)}
                      className={`p-3 text-xs font-bold rounded-xl border transition-all ${
                        employmentType === type
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 7: FIRST VALUE MOMENT */}
            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">You're all set, {user?.displayName || 'Alex'}!</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                    Your career profile has been calibrated. We are generating your custom Daily Plan and ATS Resume Breakdown.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-left text-xs text-blue-900 space-y-1.5 max-w-sm mx-auto">
                  <div className="font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Target: {targetRole}</span>
                  </div>
                  <div className="text-slate-600">Location: {preferredLocation} • {employmentType}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>{step === 7 ? 'Enter Career Dashboard' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
