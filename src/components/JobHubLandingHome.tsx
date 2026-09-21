/**
 * JobHub AI - Primary Portal Homepage & Two-Sided Marketplace
 * Replicates the exact visual identity of JobHub (job.jpg) with rich purple/violet midnight branding,
 * seamless Naukri.com feature parity (Experience/Salary filters, Recruiter Reach, FastForward Resume Health,
 * Hiring Hubs, AmbitionBox company insights), and instant WhatsApp & Gemini AI integration.
 */

import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Building,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Send,
  MessageCircle,
  FileText,
  Radio,
  Bot,
  Zap,
  Phone,
  Mail,
  SlidersHorizontal,
  DollarSign,
  ChevronDown,
  Check,
  ExternalLink,
  ShieldCheck,
  Flame,
  Globe,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

interface JobHubLandingHomeProps {
  onNavigateTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenWhatsApp: () => void;
  onPostJob: () => void;
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  salary: string;
  postedAgo: string;
  featured?: boolean;
  category: string;
  experience: string;
  tags: string[];
  matchScore: number;
  applicantsCount: number;
}

const FEATURED_JOBS: JobListing[] = [
  {
    id: 'job-1',
    title: 'Senior UI/UX Designer',
    company: 'Google',
    logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80',
    location: 'Bangalore, India',
    type: 'Full Time',
    workMode: 'On-site',
    salary: '₹28,00,000 - ₹42,00,000 P.A.',
    postedAgo: '2 days ago',
    category: 'Design',
    experience: '4-7 Yrs',
    tags: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    matchScore: 94,
    applicantsCount: 42,
  },
  {
    id: 'job-2',
    title: 'Software Engineer',
    company: 'Microsoft',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    location: 'Hyderabad, India',
    type: 'Full Time',
    workMode: 'Hybrid',
    salary: '₹24,00,000 - ₹38,00,000 P.A.',
    postedAgo: '3 days ago',
    category: 'IT & Software',
    experience: '3-6 Yrs',
    tags: ['TypeScript', 'React', 'C#', 'Azure', 'Microservices'],
    matchScore: 96,
    applicantsCount: 78,
  },
  {
    id: 'job-3',
    title: 'Product Manager',
    company: 'Amazon',
    logo: 'https://images.unsplash.com/photo-1523474253243-231a511394f4?w=100&auto=format&fit=crop&q=80',
    location: 'Mumbai, India',
    type: 'Full Time',
    workMode: 'On-site',
    salary: '₹32,00,000 - ₹50,00,000 P.A.',
    postedAgo: '1 day ago',
    featured: true,
    category: 'Marketing',
    experience: '5-9 Yrs',
    tags: ['Product Roadmap', 'E-commerce', 'Data Analytics', 'Agile'],
    matchScore: 89,
    applicantsCount: 110,
  },
  {
    id: 'job-4',
    title: 'Data Analyst',
    company: 'TCS',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80',
    location: 'Pune, India',
    type: 'Full Time',
    workMode: 'Hybrid',
    salary: '₹10,00,000 - ₹16,00,000 P.A.',
    postedAgo: '5 days ago',
    category: 'Finance',
    experience: '2-4 Yrs',
    tags: ['SQL', 'PowerBI', 'Python', 'Excel', 'Tableau'],
    matchScore: 91,
    applicantsCount: 65,
  },
  {
    id: 'job-5',
    title: 'Graphic Designer',
    company: 'Adobe',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=80',
    location: 'Noida, India',
    type: 'Full Time',
    workMode: 'Remote',
    salary: '₹18,00,000 - ₹26,00,000 P.A.',
    postedAgo: '4 days ago',
    category: 'Design',
    experience: '3-5 Yrs',
    tags: ['Photoshop', 'Illustrator', 'After Effects', 'Branding'],
    matchScore: 88,
    applicantsCount: 38,
  },
  {
    id: 'job-6',
    title: 'Staff Full-Stack AI Engineer',
    company: 'TalentCorp AI',
    logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    location: 'Bangalore / Remote',
    type: 'Full Time',
    workMode: 'Remote',
    salary: '₹35,00,000 - ₹55,00,000 P.A.',
    postedAgo: 'Just now',
    featured: true,
    category: 'IT & Software',
    experience: '5+ Yrs',
    tags: ['Gemini 2.5', 'React', 'Node.js', 'Vector Search', 'Cloud Run'],
    matchScore: 98,
    applicantsCount: 19,
  },
];

const JOB_CATEGORIES = [
  { id: 'it', name: 'IT & Software', count: '12,540 Jobs', iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: '💻' },
  { id: 'marketing', name: 'Marketing', count: '8,450 Jobs', iconBg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', icon: '📢' },
  { id: 'sales', name: 'Sales', count: '6,780 Jobs', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: '📊' },
  { id: 'design', name: 'Design', count: '4,230 Jobs', iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', icon: '🎨' },
  { id: 'finance', name: 'Finance', count: '5,670 Jobs', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: '💰' },
  { id: 'hr', name: 'HR & Admin', count: '3,980 Jobs', iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: '👥' },
  { id: 'engineering', name: 'Engineering', count: '7,890 Jobs', iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', icon: '⚙️' },
  { id: 'all', name: 'More Categories', count: 'Browse All 50+', iconBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300', icon: '📱' },
];

const TOP_COMPANIES = [
  { name: 'Google', jobs: '120+ Jobs', rating: 4.8, reviews: '14.2k', logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=80&auto=format&fit=crop&q=80' },
  { name: 'Microsoft', jobs: '95+ Jobs', rating: 4.7, reviews: '11.8k', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=80' },
  { name: 'Amazon', jobs: '150+ Jobs', rating: 4.6, reviews: '19.4k', logo: 'https://images.unsplash.com/photo-1523474253243-231a511394f4?w=80&auto=format&fit=crop&q=80' },
  { name: 'Adobe', jobs: '80+ Jobs', rating: 4.8, reviews: '8.6k', logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=80&auto=format&fit=crop&q=80' },
  { name: 'TCS', jobs: '110+ Jobs', rating: 4.2, reviews: '24.1k', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&auto=format&fit=crop&q=80' },
  { name: 'Infosys', jobs: '70+ Jobs', rating: 4.1, reviews: '21.5k', logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&auto=format&fit=crop&q=80' },
];

const TESTIMONIALS = [
  {
    name: 'Rohit Sharma',
    role: 'UI/UX Designer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    quote: 'JobHub helped me find the perfect job opportunity and the process was so smooth and easy! The AI resume feedback pushed my ATS score from 68 to 94.',
    rating: 5,
    hiredAt: 'Google',
  },
  {
    name: 'Priya Mehta',
    role: 'Marketing Manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    quote: 'I got multiple interview calls within days of applying. Highly recommended platform for all ambitious job seekers! The WhatsApp instant alerts kept me ahead of 100+ candidates.',
    rating: 5,
    hiredAt: 'Amazon',
  },
  {
    name: 'Ankit Verma',
    role: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    quote: 'The user interface is amazing and very beginner friendly. The Gemini mock voice interview simulator was exactly like my actual Amazon technical rounds.',
    rating: 5,
    hiredAt: 'Microsoft',
  },
];

const BLOG_POSTS = [
  {
    id: 'b1',
    dateBadge: { month: 'MAY', day: '15' },
    title: '10 Tips to Prepare for a Successful AI & Tech Interview',
    category: 'Interview Prep',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&auto=format&fit=crop&q=80',
    excerpt: 'Master behavioural STAR frameworks and live coding benchmarks with Gemini AI voice practice.',
  },
  {
    id: 'b2',
    dateBadge: { month: 'MAY', day: '10' },
    title: 'Top In-Demand Skills for Full-Stack & Generative AI in 2026',
    category: 'Career Trends',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80',
    excerpt: 'From TypeScript orchestration to multimodal embeddings, explore skills commanding top tier salaries.',
  },
  {
    id: 'b3',
    dateBadge: { month: 'MAY', day: '05' },
    title: 'How to Build an ATS-Beating AI Resume in Under 10 Minutes',
    category: 'Resume Building',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=80',
    excerpt: 'Learn the exact impact formatting and keyword density algorithms preferred by Fortune 500 recruiters.',
  },
  {
    id: 'b4',
    dateBadge: { month: 'APR', day: '28' },
    title: 'Cover Letter & Recruiter Pitch Tips That Get You WhatsApp Replies',
    category: 'Recruiter Outreach',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&auto=format&fit=crop&q=80',
    excerpt: 'How to craft personalized, punchy outreach summaries that recruiters open and reply to immediately.',
  },
];

const TOP_CITIES = [
  { city: 'Bangalore', count: '14,850+ Jobs', bg: 'from-blue-600 to-indigo-600' },
  { city: 'Delhi / NCR', count: '11,200+ Jobs', bg: 'from-purple-600 to-pink-600' },
  { city: 'Mumbai', count: '9,450+ Jobs', bg: 'from-amber-600 to-orange-600' },
  { city: 'Hyderabad', count: '8,600+ Jobs', bg: 'from-emerald-600 to-teal-600' },
  { city: 'Pune', count: '6,400+ Jobs', bg: 'from-cyan-600 to-blue-600' },
  { city: 'Remote Work', count: '7,900+ Jobs', bg: 'from-violet-600 to-purple-700' },
];

export const JobHubLandingHome: React.FC<JobHubLandingHomeProps> = ({
  onNavigateTab,
  onOpenAuth,
  onOpenWhatsApp,
  onPostJob,
}) => {
  const { user, role, switchRole } = useAuth();
  const { isPremium, openUpgradeModal } = useSubscription();

  // Search filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('Experience');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('All');
  const [roleIntent, setRoleIntent] = useState<'job_seeker' | 'hiring'>('job_seeker');

  // Bookmarks state
  const [savedJobs, setSavedJobs] = useState<string[]>(['job-1', 'job-3']);
  const [appliedJobModal, setAppliedJobModal] = useState<JobListing | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const toggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleApplyNow = (job: JobListing, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppliedJobModal(job);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const popularSearches = [
    'UI/UX Designer',
    'Developer',
    'Marketing',
    'Product Manager',
    'Data Analyst',
    'Sales',
    'React Native',
    'AI Engineer',
  ];

  return (
    <div className="w-full font-sans text-slate-900 dark:text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* ---------------------------------------------------- */}
      {/* HERO SECTION - Deep Midnight Violet with Glowing FX */}
      {/* ---------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#0A071E] text-white pt-8 pb-16 lg:pb-24 border-b border-purple-900/40 rounded-2xl shadow-2xl mb-12">
        {/* Ambient Gradient Glows & Orbit Line Canvas */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-indigo-600/25 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 left-10 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl" />
          {/* Subtle orbital contour line */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <circle cx="75%" cy="40%" r="280" fill="none" stroke="url(#orbGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="75%" cy="40%" r="380" fill="none" stroke="url(#orbGrad)" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Find The Job That</span>
              </div>

              {/* High Impact Headline matching image */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                Matches Your Skills <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
                  & Ambitions
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed">
                Explore thousands of job opportunities from top companies, boost your ATS score with AI, and get instant recruiter matches directly via WhatsApp.
              </p>

              {/* Two Intent Toggle Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRoleIntent('job_seeker');
                    if (role === 'employer') switchRole('candidate');
                  }}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                    roleIntent === 'job_seeker'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/50'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-300" />
                  <span>I'm Looking for a Job</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleIntent('hiring');
                    if (role !== 'employer') switchRole('employer');
                    onNavigateTab('employer_portal');
                  }}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
                    roleIntent === 'hiring'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/50'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-purple-300" />
                  <span>I'm Hiring for a Job</span>
                </button>
              </div>

              {/* Search Card Container - Crisp White Rounded Container on Dark Canvas */}
              <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Job title / keyword */}
                  <div className="md:col-span-4 flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Job title, keyword or company"
                      className="w-full text-xs sm:text-sm bg-transparent border-none outline-none placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  {/* Select Category */}
                  <div className="md:col-span-3 flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 cursor-pointer font-medium"
                    >
                      <option value="All Categories">Select Category</option>
                      <option value="IT & Software">IT & Software</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Design">Design</option>
                      <option value="Finance">Finance</option>
                      <option value="HR & Admin">HR & Admin</option>
                      <option value="Engineering">Engineering</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div className="md:col-span-3 flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      placeholder="Location (e.g. Bangalore)"
                      className="w-full text-xs sm:text-sm bg-transparent border-none outline-none placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  {/* Search Button */}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('discovery')}
                      className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <span>Search Jobs</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Naukri-Style Experience & Salary Quick Filters */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Filters:</span>
                    <button
                      onClick={() => setSelectedWorkMode(selectedWorkMode === 'Remote' ? 'All' : 'Remote')}
                      className={`px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
                        selectedWorkMode === 'Remote'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      🏠 Remote Only
                    </button>
                    <button
                      onClick={() => setSelectedExperience('Fresher')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      🎓 Fresher (0-1 Yrs)
                    </button>
                    <button
                      onClick={() => setSelectedExperience('Mid-Senior')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      💼 3-7 Yrs
                    </button>
                    <button
                      onClick={() => setSelectedExperience('Senior+')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      ⚡ ₹25+ LPA High Pay
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold cursor-pointer hover:underline" onClick={() => onNavigateTab('resume')}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Check Resume ATS Match</span>
                  </div>
                </div>
              </div>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Popular Searches:</span>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      onNavigateTab('discovery');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Hero Visual Column with Woman & Floating Stats Badges */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Glowing ring background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/40 via-indigo-600/30 to-cyan-400/20 rounded-3xl blur-2xl transform rotate-3" />

                {/* Main Hero Card Frame */}
                <div className="relative rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-purple-950/60 to-[#0A071E] p-2 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                    alt="Professional Job Seeker"
                    className="w-full h-96 object-cover object-top rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A071E] via-transparent to-transparent opacity-80" />
                </div>

                {/* Floating Stat Badges matching the design in job.jpg */}
                <div className="absolute -top-3 -right-2 bg-slate-900/90 backdrop-blur-md border border-purple-500/40 rounded-2xl p-3 shadow-xl flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-white">10,000+</div>
                    <div className="text-[11px] text-purple-200">Active Jobs</div>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-slate-900/90 backdrop-blur-md border border-indigo-500/40 rounded-2xl p-3 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center">
                    <Building className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-white">2,500+</div>
                    <div className="text-[11px] text-indigo-200">Top Companies</div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-3 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-3 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600/30 text-cyan-300 flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-white">1,00,000+</div>
                    <div className="text-[11px] text-cyan-200">Candidates Placed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* NAUKRI FASTFORWARD & AI CAREER ACCELERATOR STRIP */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-purple-900/10 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/40 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* 1: FastForward Resume Health */}
            <div
              onClick={() => onNavigateTab('resume')}
              className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Resume Health Score</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">Free</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Evaluate ATS readability, keyword gaps & instant bullet point re-writing.
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 mt-2">
                  <span>Score My Resume</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* 2: WhatsApp Recruiter Match */}
            <div
              onClick={onOpenWhatsApp}
              className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">WhatsApp Match Alerts</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Instant</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Receive interview invites and salary offers directly on WhatsApp from verified recruiters.
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                  <span>Open WhatsApp Alerts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* 3: Live Voice AI Mock Interview */}
            <div
              onClick={() => onNavigateTab('voice_live')}
              className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Live Voice Mock Practice</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">Gemini Live</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Practice spoken interview questions with realtime AI voice feedback and scoring.
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                  <span>Start Voice Practice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* BROWSE JOBS BY CATEGORY */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Browse Jobs By Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Discover openings across all major domains and technical industries.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('discovery')}
            className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {JOB_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                onNavigateTab('discovery');
              }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all cursor-pointer group flex flex-col items-start"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-3 ${cat.iconBg} group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {cat.count}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* FEATURED JOBS SECTION - Exactly matching the sample card layout */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Featured Jobs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Top hand-curated roles with direct recruiter contact and high salary packages.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('discovery')}
            className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_JOBS.map((job) => {
            const isSaved = savedJobs.includes(job.id);
            return (
              <div
                key={job.id}
                className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl transition-all flex flex-col justify-between group overflow-hidden"
              >
                {/* Featured Ribbon */}
                {job.featured && (
                  <div className="absolute top-3 -right-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-extrabold uppercase tracking-widest py-1 px-10 rotate-45 shadow-sm">
                    Featured
                  </div>
                )}

                <div>
                  {/* Top: Company Logo + Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center p-1">
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {job.company}
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleSaveJob(job.id, e)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isSaved
                          ? 'bg-purple-50 dark:bg-purple-950 text-purple-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Location & Experience Details */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.experience}</span>
                    </div>
                  </div>

                  {/* Tags & Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {job.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {job.workMode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      ⚡ {job.matchScore}% Match
                    </span>
                  </div>

                  {/* Compensation */}
                  <div className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {job.salary}
                  </div>
                </div>

                {/* Card Footer: Posted date & Apply Button */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{job.postedAgo}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleApplyNow(job, e)}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* STATS BANNER - Dark Midnight Navy Bar matching job.jpg */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="bg-[#0D0A24] text-white rounded-2xl p-6 sm:p-8 border border-purple-900/40 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-purple-900/40">
            <div className="p-3 flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">25,000+</div>
              <div className="text-xs text-purple-200/80 font-medium mt-0.5">Active Jobs</div>
            </div>

            <div className="p-3 flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-2">
                <Building className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">2,500+</div>
              <div className="text-xs text-indigo-200/80 font-medium mt-0.5">Companies</div>
            </div>

            <div className="p-3 flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">1,00,000+</div>
              <div className="text-xs text-cyan-200/80 font-medium mt-0.5">Candidates</div>
            </div>

            <div className="p-3 flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center mb-2">
                <SlidersHorizontal className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">50+</div>
              <div className="text-xs text-pink-200/80 font-medium mt-0.5">Job Categories</div>
            </div>

            <div className="p-3 flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">95%</div>
              <div className="text-xs text-emerald-200/80 font-medium mt-0.5">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* HOW IT WORKS (4 STEPS) */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Follow four simple steps to get shortlisted by top companies and land your dream job.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left relative group hover:border-purple-400 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-xs font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">01</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Sign up and complete your profile, upload your resume and set salary expectations.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left relative group hover:border-blue-400 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">02</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Find Jobs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Search curated job openings that match your exact skills, years of experience, and location.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left relative group hover:border-amber-400 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">03</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Apply Jobs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              1-Click apply with auto-tailored resumes and send instant interview alerts to recruiters.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left relative group hover:border-emerald-400 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">04</div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Get Hired</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Get shortlisted, prepare with AI mock practice and kickstart your dream career.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* EMPLOYER CTA BANNER - Vibrant Violet Card */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white p-6 sm:p-10 shadow-xl border border-purple-500/30">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Send className="w-6 h-6 text-purple-200" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Looking for the perfect candidate?
              </h3>
              <p className="text-sm sm:text-base text-purple-100 max-w-xl leading-relaxed font-normal">
                Post a job and connect with thousands of qualified candidates. Auto-match resumes, trigger instant WhatsApp outreach, and schedule interviews effortlessly.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    switchRole('employer');
                    onNavigateTab('employer_portal');
                  }}
                  className="px-6 py-3 bg-white hover:bg-slate-100 text-purple-800 font-bold rounded-xl transition-all shadow-lg text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Post a Job Now</span>
                  <ArrowRight className="w-4 h-4 text-purple-800" />
                </button>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center md:justify-end">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80"
                alt="Recruiter in Suit"
                className="w-48 h-48 object-cover rounded-2xl border-2 border-white/20 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* TOP COMPANIES HIRING */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Top Companies Hiring
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore open positions, reviews, and salary benchmarks at leading tech giants.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('discovery')}
            className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Companies</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {TOP_COMPANIES.map((company) => (
            <div
              key={company.name}
              onClick={() => {
                setSearchQuery(company.name);
                onNavigateTab('discovery');
              }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 text-center hover:shadow-lg transition-all cursor-pointer group flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center mb-3">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                {company.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{company.rating}</span>
                <span className="text-[10px] text-slate-400 font-normal">({company.reviews})</span>
              </div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 mt-2">
                {company.jobs}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* NAUKRI-STYLE HIRING HUBS / CITY EXPLORER */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Explore Jobs in Top Cities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Find highest paying positions in your preferred location.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {TOP_CITIES.map((city) => (
            <div
              key={city.city}
              onClick={() => {
                setSelectedLocation(city.city);
                onNavigateTab('discovery');
              }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 text-center hover:shadow-md transition-all cursor-pointer group"
            >
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr ${city.bg} text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                {city.city}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {city.count}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* CANDIDATE TESTIMONIALS (What Our Candidates Say) */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="rounded-2xl bg-slate-900 text-white p-8 sm:p-10 border border-purple-900/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left title info */}
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Candidate Reviews</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                What Our <br />Candidates Say
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Trusted by thousands of job seekers who transformed their careers and landed dream roles with JobHub.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('discovery')}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>View All Reviews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 3 Testimonial Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="p-5 rounded-2xl bg-slate-800/90 border border-purple-900/50 flex flex-col justify-between"
                >
                  <div>
                    {/* 5 Stars */}
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-700/60">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-9 h-9 rounded-full object-cover border border-purple-400"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{t.name}</h4>
                      <p className="text-[11px] text-purple-300">{t.role} • Placed at {t.hiredAt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* LATEST FROM OUR BLOG / CAREER ADVICE */}
      {/* ---------------------------------------------------- */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Latest From Our Blog
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Expert guides on resume writing, technical interviews, and salary negotiation.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('gemini_chat')}
            className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Posts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BLOG_POSTS.map((post) => (
            <div
              key={post.id}
              onClick={() => onNavigateTab('gemini_chat')}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:border-purple-400 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Date Badge */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Purple Calendar Badge */}
                  <div className="absolute top-3 left-3 bg-purple-600 text-white rounded-xl py-1 px-2.5 text-center shadow-md">
                    <div className="text-[9px] font-extrabold tracking-wider">{post.dateBadge.month}</div>
                    <div className="text-sm font-black leading-tight">{post.dateBadge.day}</div>
                  </div>
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors mt-1 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span className="text-slate-400 text-[11px] font-normal">{post.readTime}</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read More <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* COMPREHENSIVE FOOTER - Matching JobHub & Naukri Standards */}
      {/* ---------------------------------------------------- */}
      <footer className="rounded-2xl bg-[#09071A] text-slate-300 pt-12 pb-8 px-6 sm:px-10 border border-purple-900/40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-purple-900/40">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/50">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl text-white tracking-tight">JobHub</span>
                <span className="text-[10px] text-purple-300 -mt-1 font-semibold">Find Your Dream Job</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              JobHub is your premier gateway to find the best job opportunities from top companies around the world, powered by Google Gemini AI and instant WhatsApp recruiter matching.
            </p>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>123 Business Street, New Delhi, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>support@jobhub.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: For Candidates */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">For Candidates</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateTab('discovery')} className="hover:text-white transition-colors">
                  Find Jobs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('resume')} className="hover:text-white transition-colors">
                  AI Resume Score
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('voice_live')} className="hover:text-white transition-colors">
                  Live Voice Mock Practice
                </button>
              </li>
              <li>
                <button onClick={onOpenWhatsApp} className="hover:text-white transition-colors">
                  WhatsApp Match Alerts
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('market_intel')} className="hover:text-white transition-colors">
                  Salary Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: For Employers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">For Employers</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={onPostJob} className="hover:text-white transition-colors">
                  Post a Job
                </button>
              </li>
              <li>
                <button onClick={() => { switchRole('employer'); onNavigateTab('employer_matching'); }} className="hover:text-white transition-colors">
                  Browse AI Matched Candidates
                </button>
              </li>
              <li>
                <button onClick={() => { switchRole('employer'); onNavigateTab('employer_portal'); }} className="hover:text-white transition-colors">
                  Employer Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => openUpgradeModal('employer_plans')} className="hover:text-white transition-colors">
                  Pricing & Recruiter Plans
                </button>
              </li>
              <li>
                <button onClick={onOpenAuth} className="hover:text-white transition-colors">
                  Recruiter Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Newsletter</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe to get the latest job alerts, salary reports and career tips.
            </p>
            {newsletterSubscribed ? (
              <div className="p-3 bg-emerald-900/40 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-800 border border-purple-900/50 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} JobHub AI Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms & Conditions</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Center</span>
            <span className="hover:text-slate-300 cursor-pointer">Fraud Alert</span>
          </div>
        </div>
      </footer>

      {/* 1-Click Apply Modal */}
      {appliedJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-purple-200 dark:border-purple-800 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 p-2 flex items-center justify-center">
                  <img src={appliedJobModal.logo} alt={appliedJobModal.company} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{appliedJobModal.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{appliedJobModal.company} • {appliedJobModal.location}</p>
                </div>
              </div>
              <button onClick={() => setAppliedJobModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-xl font-bold">×</button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">ATS Match Readiness:</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{appliedJobModal.matchScore}% Match</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${appliedJobModal.matchScore}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Contact Details</label>
              <div className="space-y-2">
                <input
                  type="text"
                  defaultValue={user?.displayName || 'Applicant'}
                  placeholder="Full Name"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <input
                  type="email"
                  defaultValue={user?.email || 'applicant@example.com'}
                  placeholder="Email Address"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <input
                  type="tel"
                  defaultValue={user?.whatsappNumber || '+91 98765 43210'}
                  placeholder="WhatsApp Number (for instant recruiter match)"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAppliedJobModal(null);
                  onOpenWhatsApp();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Apply & Send WhatsApp Alert</span>
              </button>
              <button
                type="button"
                onClick={() => setAppliedJobModal(null)}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
