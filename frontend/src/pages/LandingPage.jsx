import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Calendar,
  FileText,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Pin,
  Menu,
  X,
  Target,
  ChevronRight,
  ShieldCheck,
  Layers,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { darkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: CheckSquare,
      title: 'Smart Task Management',
      subtitle: 'Tasks',
      color: 'brand',
      badge: 'Core Engine',
      description:
        'Organize assignments with custom priorities, status pipelines, due dates, and instant one-click completions.',
      highlights: ['Priority tagging', 'Instant search & filters', 'Urgency status badges'],
    },
    {
      icon: Calendar,
      title: 'Interactive Calendar',
      subtitle: 'Calendar',
      color: 'amber',
      badge: 'Visual Roadmap',
      description:
        'Track deadline distribution across a clean monthly calendar with task dot indicators and instant date filtering.',
      highlights: ['Monthly schedule overview', 'Task density dots', 'Quick date-based filters'],
    },
    {
      icon: FileText,
      title: 'Quick Notes & Scratchpad',
      subtitle: 'Notes',
      color: 'emerald',
      badge: 'Idea Capture',
      description:
        'Capture meeting snippets, checklists, and project ideas. Pin critical memos to the top with tailored color themes.',
      highlights: ['Pinned notes section', '5 color themes', 'Instant ⌘K search access'],
    },
    {
      icon: Zap,
      title: 'Productivity & Velocity',
      subtitle: 'Productivity',
      color: 'indigo',
      badge: 'Zero Friction',
      description:
        'Maintain high focus with real-time statistics, overdue alerts, zero visual clutter, and seamless responsive design.',
      highlights: ['Real-time completion metrics', 'Overdue early alerts', 'Airy, low-density layout'],
    },
  ];

  return (
    <div className="min-h-screen bg-nimbus-50 dark:bg-nimbus-950 text-nimbus-900 dark:text-nimbus-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-700 dark:selection:text-brand-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-nimbus-900/85 backdrop-blur-md border-b border-nimbus-200/80 dark:border-nimbus-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo on Left */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-nimbus-900 dark:text-white tracking-tight">
                TaskFlow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-nimbus-600 dark:text-nimbus-300">
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Workflow
            </a>
            <a href="#preview" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Preview
            </a>
          </nav>

          {/* Action Buttons on Right */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="nimbus-btn-primary text-xs sm:text-sm font-medium"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-nimbus-700 dark:text-nimbus-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-nimbus-100 dark:hover:bg-nimbus-800 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="nimbus-btn-primary text-xs sm:text-sm font-medium shadow-sm hover:shadow"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-nimbus-600 dark:text-nimbus-300 hover:bg-nimbus-100 dark:hover:bg-nimbus-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-b border-nimbus-200 dark:border-nimbus-800 bg-white dark:bg-nimbus-900 px-4 py-4 space-y-3"
            >
              <nav className="flex flex-col gap-2 pb-3 border-b border-nimbus-100 dark:border-nimbus-800 text-sm font-medium text-nimbus-600 dark:text-nimbus-300">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800"
                >
                  Features
                </a>
                <a
                  href="#workflow"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800"
                >
                  Workflow
                </a>
                <a
                  href="#preview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-1.5 rounded-lg hover:bg-nimbus-100 dark:hover:bg-nimbus-800"
                >
                  Preview
                </a>
              </nav>

              <div className="flex flex-col gap-2 pt-1">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="nimbus-btn-primary w-full text-center"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="nimbus-btn-secondary w-full text-center"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="nimbus-btn-primary w-full text-center"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-400/15 via-indigo-500/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-2xs mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Modern Workspace Architecture</span>
            <span className="w-1 h-1 rounded-full bg-brand-400" />
            <span className="font-normal opacity-90">Fast & Minimalist</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight text-nimbus-900 dark:text-white leading-[1.12]"
          >
            Manage tasks with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
              clarity and speed
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-nimbus-600 dark:text-nimbus-300 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            A high-performance workspace combining smart task tracking, interactive monthly scheduling, and instant scratchpad notes — built to keep your daily momentum unbreakable.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <Link
              to="/register"
              className="nimbus-btn-primary w-full sm:w-auto px-7 py-3 text-base shadow-nimbus-md hover:shadow-nimbus-lg transition-all"
            >
              Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              to="/login"
              className="nimbus-btn-secondary w-full sm:w-auto px-7 py-3 text-base"
            >
              Sign in
            </Link>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-nimbus-500 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant setup in seconds
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Light & Dark themes included
            </span>
          </motion.div>
        </div>
      </section>

      {/* Interactive UI Mockup Preview Section */}
      <section id="preview" className="pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="nimbus-card p-4 sm:p-6 lg:p-8 bg-white/90 dark:bg-nimbus-900/90 shadow-nimbus-xl border border-nimbus-200/90 dark:border-nimbus-800 rounded-2xl relative overflow-hidden"
        >
          {/* Mock Window Topbar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-nimbus-100 dark:border-nimbus-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs font-mono text-nimbus-400">taskflow.app/dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Workspace
            </div>
          </div>

          {/* Mock Dashboard Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Mock Task Card */}
            <div className="lg:col-span-7 p-5 rounded-xl bg-nimbus-50/70 dark:bg-nimbus-850/60 border border-nimbus-200/60 dark:border-nimbus-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-nimbus-900 dark:text-white">Today's Tasks</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    3 Completed
                  </span>
                </div>

                <div className="space-y-2 mt-3">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-nimbus-800 border border-nimbus-200/70 dark:border-nimbus-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
                      <span className="font-medium line-through text-nimbus-400">Review quarterly product roadmap</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">Done</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-nimbus-800 border border-nimbus-200/70 dark:border-nimbus-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded border border-brand-400" />
                      <span className="font-medium text-nimbus-900 dark:text-white">Implement push notification scheduler</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-semibold">High</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-nimbus-800 border border-nimbus-200/70 dark:border-nimbus-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded border border-nimbus-300" />
                      <span className="font-medium text-nimbus-800 dark:text-nimbus-200">Prepare slide deck for sprint review</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">Medium</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-nimbus-200/40 text-[11px] text-nimbus-400 flex justify-between items-center">
                <span>Updated 2 minutes ago</span>
                <span className="text-brand-600 dark:text-brand-400 font-medium">85% Completed today</span>
              </div>
            </div>

            {/* Right Mock Calendar & Note Preview */}
            <div className="lg:col-span-5 space-y-4">
              {/* Mini Calendar mockup */}
              <div className="p-4 rounded-xl bg-nimbus-50/70 dark:bg-nimbus-850/60 border border-nimbus-200/60 dark:border-nimbus-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-nimbus-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" /> September 2026
                  </span>
                  <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">Today</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-nimbus-500 font-semibold mt-2">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mt-1">
                  <span className="p-1 rounded text-nimbus-300">30</span>
                  <span className="p-1 rounded text-nimbus-300">31</span>
                  <span className="p-1 rounded">1</span>
                  <span className="p-1 rounded">2</span>
                  <span className="p-1 rounded">3</span>
                  <span className="p-1 rounded">4</span>
                  <span className="p-1 rounded">5</span>
                  <span className="p-1 rounded">6</span>
                  <span className="p-1 rounded">7</span>
                  <span className="p-1 rounded">8</span>
                  <span className="p-1 rounded">9</span>
                  <span className="p-1 rounded bg-brand-600 text-white font-bold shadow-xs">10</span>
                  <span className="p-1 rounded">11</span>
                  <span className="p-1 rounded">12</span>
                </div>
              </div>

              {/* Quick Note mockup */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <Pin className="w-3 h-3 text-amber-600 fill-amber-600" /> Sprint Goals
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300">Pinned</span>
                </div>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                  Focus on landing page responsiveness and high performance metrics.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/70 dark:bg-nimbus-900/60 border-y border-nimbus-200/60 dark:border-nimbus-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
              Engineered For Focus
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-nimbus-900 dark:text-white tracking-tight">
              Everything you need to stay in flow
            </p>
            <p className="mt-3 text-sm sm:text-base text-nimbus-500">
              Four tightly integrated capabilities designed to eliminate clutter and keep you effortlessly productive.
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="p-6 rounded-2xl bg-white dark:bg-nimbus-900 border border-nimbus-200/80 dark:border-nimbus-800 shadow-nimbus hover:shadow-nimbus-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-nimbus-100 text-nimbus-600 dark:bg-nimbus-800 dark:text-nimbus-300">
                        {f.subtitle}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-nimbus-900 dark:text-white mb-2">
                      {f.title}
                    </h3>

                    <p className="text-xs text-nimbus-600 dark:text-nimbus-400 leading-relaxed mb-4">
                      {f.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-nimbus-100 dark:border-nimbus-800 space-y-1.5">
                    {f.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-[11px] font-medium text-nimbus-700 dark:text-nimbus-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow & Productivity Highlights Section */}
      <section id="workflow" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
              <Zap className="w-4 h-4" /> Built For High Velocity
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-nimbus-900 dark:text-white tracking-tight leading-tight">
              Less visual noise, <br />
              more meaningful output.
            </h2>
            <p className="mt-4 text-sm text-nimbus-600 dark:text-nimbus-300 leading-relaxed">
              TaskFlow is deliberately built with reduced visual density: comfortable whitespace, soft card borders, and zero confusing nested panels. You always know what is next on your plate.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-nimbus-900 dark:text-white">Seamless Day Planning</h4>
                  <p className="text-xs text-nimbus-500 mt-0.5">Filter today's priorities and upcoming deadlines without losing the big picture.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-nimbus-900 dark:text-white">Instant Note Scratchpad</h4>
                  <p className="text-xs text-nimbus-500 mt-0.5">Capture thoughts without opening third-party note apps or breaking concentration.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-nimbus-900 dark:text-white">Automatic Synchronization</h4>
                  <p className="text-xs text-nimbus-500 mt-0.5">Always stay in sync whether you are managing tasks from your phone, tablet, or desktop.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 text-white shadow-nimbus-xl flex flex-col justify-between min-h-[380px] relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-200 bg-white/15 px-3 py-1 rounded-full">
                Unified Productivity
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mt-4 leading-tight">
                Designed to make work feel effortless every single day.
              </h3>
              <p className="mt-3 text-sm text-brand-100 leading-relaxed">
                Join thousands of creators and professionals who streamlined their routine with TaskFlow.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-brand-200 font-medium">Ready in under 60 seconds</p>
                <p className="text-lg font-bold">Free forever for personal use</p>
              </div>

              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-white text-brand-700 font-semibold text-sm hover:bg-brand-50 transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                Create Account <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-white dark:bg-nimbus-900 border-t border-nimbus-200/80 dark:border-nimbus-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-nimbus-900 dark:text-white tracking-tight">
            Ready to organize your workflow?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-nimbus-500 max-w-xl mx-auto">
            Get started today with TaskFlow and experience a cleaner, faster task and schedule management workspace.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="nimbus-btn-primary w-full sm:w-auto px-8 py-3 text-base shadow-nimbus-md"
            >
              Get Started Now <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              to="/login"
              className="nimbus-btn-secondary w-full sm:w-auto px-8 py-3 text-base"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-nimbus-50 dark:bg-nimbus-950 border-t border-nimbus-200 dark:border-nimbus-800 text-xs text-nimbus-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-nimbus-800 dark:text-nimbus-200">TaskFlow</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Register
            </Link>
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Features
            </a>
          </div>

          <p>© {new Date().getFullYear()} TaskFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
