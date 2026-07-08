/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Brain,
  Calendar,
  TrendingUp,
  MessageSquare,
  User,
  Settings,
  Sparkles,
  Search,
  BookOpen,
  Menu,
  X,
  HelpCircle,
  Award,
  CheckCircle,
  LogOut,
} from 'lucide-react';
import { Problem, UserStats, WeeklyChallenge, Contest, CommunityDiscussion, Topic, Level } from './types';
import Dashboard from './components/Dashboard';
import Learn from './components/Learn';
import Compete from './components/Compete';
import ProgressView from './components/ProgressView';
import Community from './components/Community';
import Profile from './components/Profile';
import AITutorChat from './components/AITutorChat';
import WelcomeScreen from './components/WelcomeScreen';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const DISCUSSION_CLEANUP_KEY = 'calculix_discussions_demo_cleanup_v1';
const LEGACY_DEMO_DISCUSSION_IDS = new Set(['disc-1', 'disc-2']);

const isLegacyDemoDiscussion = (discussion: CommunityDiscussion) => {
  const normalizedContent = discussion.content.trim().toLowerCase();

  return (
    LEGACY_DEMO_DISCUSSION_IDS.has(discussion.id) ||
    (discussion.role === 'Student' && normalizedContent === 'hello')
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Deep navigation overrides for AI recommendations
  const [overrideFilters, setOverrideFilters] = useState<{ topic?: Topic; level?: Level } | undefined>(undefined);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => sessionStorage.getItem('calculix_is_logged_in') === 'true');

  const handleLoginSuccess = (name: string, level: Level) => {
    const authUserId = supabase?.auth.getUser ? undefined : undefined;
    sessionStorage.setItem('calculix_is_logged_in', 'true');
    sessionStorage.setItem('calculix_user_name', name);
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const userId = data.session?.user?.id;
        if (userId) {
          sessionStorage.setItem('calculix_user_id', userId);
          localStorage.setItem('calculix_user_id', userId);
        }
      });
    }
    setIsLoggedIn(true);

    // Update user difficulty index as requested in the onboarding profile form
    const updatedStats = {
      ...userStats,
      level: level,
    };
    saveStatsToLocal(updatedStats);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('calculix_is_logged_in');
    sessionStorage.removeItem('calculix_user_name');
    sessionStorage.removeItem('calculix_user_id');
    localStorage.removeItem('calculix_is_logged_in');
    localStorage.removeItem('calculix_user_name');
    localStorage.removeItem('calculix_user_id');
    localStorage.removeItem('calculix_user_name');
    localStorage.removeItem('calculix_stats');
    localStorage.removeItem('calculix_completed');
    localStorage.removeItem('calculix_discussions');
    localStorage.removeItem('calculix_contests');
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setCompletedProblems([]);
    setUserStats({
      rank: 10,
      points: 0,
      streak: 0,
      completedCount: 0,
      accuracy: 100,
      timeSpent: 0,
      skills: {
        Algebra: 0,
        Geometry: 0,
        Combinatorics: 0,
        'Number Theory': 0,
      },
      weaknesses: [],
      learningTimeline: [],
    });
  };

  // States
  const [problems, setProblems] = useState<Problem[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<WeeklyChallenge[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [completedProblems, setCompletedProblems] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    rank: 10,
    points: 0,
    streak: 0,
    completedCount: 0,
    accuracy: 100,
    timeSpent: 0,
    skills: {
      Algebra: 0,
      Geometry: 0,
      Combinatorics: 0,
      'Number Theory': 0,
    },
    weaknesses: [],
    learningTimeline: [],
  });

  // Settings State
  const [customGoal, setCustomGoal] = useState<string>('Mục tiêu thi đạt giải Chuyên toán Tỉnh/Thành phố');
  const [studyPace, setStudyPace] = useState<string>('30 phút / ngày');
  const [studyReminders, setStudyReminders] = useState<boolean>(true);
  const [saveSuccessNotify, setSaveSuccessNotify] = useState<boolean>(false);

  // Load from database seeds & localStorage on mount
  useEffect(() => {
    // 1. Fetch static math database problems
    const fetchProblems = async () => {
      try {
        const response = await fetch('/api/problems');
        if (response.ok) {
          const data = await response.json();
          setProblems(data);
        }
      } catch (err) {
        console.error('Error fetching math catalog:', err);
      }
    };

    // 2. Fetch standard seeds (Leaderboard, etc.)
    const fetchSeeds = async () => {
      try {
        const response = await fetch('/api/statistics-seed');
        if (response.ok) {
          const data = await response.json();
          setWeeklyChallenges(data.weeklyChallenges || []);
          setContests(data.contests || []);
        }
      } catch (err) {
        console.error('Error fetching math seeds:', err);
      }
    };

    fetchProblems();
    fetchSeeds();

    // 3. Sync local storage states
    const localCompleted = localStorage.getItem('calculix_completed');
    if (localCompleted) {
      setCompletedProblems(JSON.parse(localCompleted));
    }

    const localStats = localStorage.getItem('calculix_stats');
    if (localStats) {
      setUserStats(JSON.parse(localStats));
    }

    const localDiscussions = localStorage.getItem('calculix_discussions');
    if (localDiscussions) {
      const parsedDiscussions = JSON.parse(localDiscussions) as CommunityDiscussion[];
      const shouldCleanDemoDiscussions = !localStorage.getItem(DISCUSSION_CLEANUP_KEY);
      const storedDiscussions = shouldCleanDemoDiscussions
        ? parsedDiscussions.filter((discussion) => !isLegacyDemoDiscussion(discussion))
        : parsedDiscussions;

      if (shouldCleanDemoDiscussions) {
        localStorage.setItem(DISCUSSION_CLEANUP_KEY, 'true');
        if (storedDiscussions.length > 0) {
          localStorage.setItem('calculix_discussions', JSON.stringify(storedDiscussions));
        } else {
          localStorage.removeItem('calculix_discussions');
        }
      }

      setDiscussions(storedDiscussions);
    }

    const localContests = localStorage.getItem('calculix_contests');
    if (localContests) {
      setContests(JSON.parse(localContests));
    }
  }, []);

  // Sync to local storage on edits
  const saveStatsToLocal = (newStats: UserStats) => {
    setUserStats(newStats);
    localStorage.setItem('calculix_stats', JSON.stringify(newStats));
  };

  // Solve problem event trigger
  const handleSolveProblemStatus = (id: string, isCorrect: boolean, scorePoints: number) => {
    // 1. Update completed list if correct
    let updatedCompleted = [...completedProblems];
    if (isCorrect && !completedProblems.includes(id)) {
      updatedCompleted.push(id);
      setCompletedProblems(updatedCompleted);
      localStorage.setItem('calculix_completed', JSON.stringify(updatedCompleted));
    }

    // 2. Estimate skill map adaptively
    const problem = problems.find((p) => p.id === id);
    let updatedSkills = { ...userStats.skills };
    if (problem) {
      const topicName = problem.topic;
      const currentScale = updatedSkills[topicName] || 50;
      if (isCorrect) {
        // Boost score for correct solution
        updatedSkills[topicName] = Math.min(100, currentScale + 8);
      } else {
        // Moderate drag down or stable
        updatedSkills[topicName] = Math.max(0, currentScale - 2);
      }
    }

    // Sort skills to find weakest
    const skillList = Object.entries(updatedSkills) as [string, number][];
    skillList.sort((a, b) => a[1] - b[1]);
    const weakestName = skillList[0][0];

    // 3. Recalculate metrics
    const preCount = userStats.completedCount;
    const newCount = isCorrect ? preCount + 1 : preCount;
    const isNewCorrect = isCorrect && !completedProblems.includes(id);

    const calculatedPoints = userStats.points + scorePoints;
    const tempAcc = isCorrect ? 100 : 0;
    const accumulatedAcc = Math.round((userStats.accuracy * 4 + tempAcc) / 5);

    const updatedUserStats: UserStats = {
      ...userStats,
      points: calculatedPoints,
      completedCount: newCount,
      accuracy: userStats.completedCount === 0 ? tempAcc : accumulatedAcc,
      streak: isNewCorrect ? userStats.streak + 1 : userStats.streak,
      timeSpent: userStats.timeSpent + 3, // Add avg 3 minutes per try
      skills: updatedSkills,
      weaknesses: [weakestName],
    };

    saveStatsToLocal(updatedUserStats);

    if (isCorrect) {
      fetch('/api/live-stats/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'problem-solved' }),
      }).catch(err => console.error('Error reporting problem-solved event:', err));
    }
  };

  // Register or Join Challenge
  const handleJoinChallenge = (id: string) => {
    const updated = weeklyChallenges.map((wc) => {
      if (wc.id === id) {
        return { ...wc, completed: true, participants: wc.participants + 1 };
      }
      return wc;
    });
    setWeeklyChallenges(updated);

    // Boost points slightly for registry
    const updatedStats = {
      ...userStats,
      points: userStats.points + 10,
    };
    saveStatsToLocal(updatedStats);
  };

  // Register or Join Contest
  const handleJoinContest = (id: string) => {
    const updated = contests.map((cont) => {
      if (cont.id === id) {
        return { ...cont, joined: true };
      }
      return cont;
    });
    setContests(updated);
    localStorage.setItem('calculix_contests', JSON.stringify(updated));

    // Boost points slightly for registration
    const updatedStats = {
      ...userStats,
      points: userStats.points + 15,
    };
    saveStatsToLocal(updatedStats);
  };

  // Add customized comment from student inside forum
  const handleAddCommunityComment = (comment: Omit<CommunityDiscussion, 'id' | 'timestamp' | 'likes' | 'replies'>) => {
    const newDiscussionEntry: CommunityDiscussion = {
      ...comment,
      id: Date.now().toString(),
      timestamp: 'Vừa xong',
      likes: 0,
      replies: 0,
    };

    const updatedAll = [newDiscussionEntry, ...discussions];
    setDiscussions(updatedAll);
    localStorage.setItem('calculix_discussions', JSON.stringify(updatedAll));

    // Reward active contributor points
    const updatedStats = {
      ...userStats,
      points: userStats.points + 5,
    };
    saveStatsToLocal(updatedStats);
  };

  // Navigation controller with search query injection
  const navigateWithFilters = (tab: string, args?: { topic?: Topic; level?: Level }) => {
    setActiveTab(tab);
    if (args) {
      setOverrideFilters(args);
    } else {
      setOverrideFilters(undefined);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessNotify(true);
    setTimeout(() => setSaveSuccessNotify(false), 3000);
  };

  if (!isLoggedIn) {
    return <WelcomeScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative text-slate-800 antialiased font-sans">
      
      {/* MOBILE HEADER NAVIGATION BAR */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 text-white p-4 flex items-center justify-between w-full select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-2 rounded-lg text-white font-extrabold w-9 h-9 flex items-center justify-center text-sm shadow-md">
            C
          </div>
          <span className="font-black text-sm tracking-widest text-slate-100 uppercase">Calculix Hub</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer text-slate-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION BAR (Desktop persistent / Mobile sliding) */}
      <aside
        id="side-nav-rail"
        className={`fixed md:sticky top-0 left-0 h-full z-40 bg-slate-900 border-r border-slate-850 text-slate-300 w-64 p-5 md:p-6 shrink-0 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8 select-none">
          {/* Logo Brand area */}
          <div className="hidden md:flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2.5 rounded-xl text-white font-black w-10 h-10 flex items-center justify-center text-base shadow-lg">
              C
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-widest text-slate-100 uppercase">Calculix Hub</h1>
              <span className="text-[9px] font-bold text-slate-500 block -mt-0.5 uppercase tracking-wider">Math OS Platform</span>
            </div>
          </div>

          {/* Quick Point badge in sidebar */}
          <div className="bg-slate-850 rounded-2xl p-4.5 border border-slate-800/80 space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Tình trạng học tập</span>
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-slate-200">Bạn (Học viên)</span>
              <span className="text-xs font-black text-amber-400">🏆 {userStats.points} pts</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2.5">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-400"
                style={{ width: `${Math.min(100, (userStats.points / 500) * 100)}%` }}
              />
            </div>
          </div>

          {/* Nav groups links */}
          <nav className="space-y-1.5 font-medium" id="side-nav-links">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4.5 py-3 text-xs rounded-xl transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white font-extrabold'
                  : 'hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                navigateWithFilters('learn');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4.5 py-3 text-xs rounded-xl transition-all cursor-pointer ${
                activeTab === 'learn'
                  ? 'bg-blue-600 text-white font-extrabold'
                  : 'hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Brain className="w-4 h-4 shrink-0" />
              <span>Learn (Học tập)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('compete');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4.5 py-3 text-xs rounded-xl transition-all cursor-pointer ${
                activeTab === 'compete'
                  ? 'bg-blue-600 text-white font-extrabold'
                  : 'hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Compete (Thi đấu)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('progress');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4.5 py-3 text-xs rounded-xl transition-all cursor-pointer ${
                activeTab === 'progress'
                  ? 'bg-blue-600 text-white font-extrabold'
                  : 'hover:bg-slate-850 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Progress (Phân tích)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('community');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4.5 py-3 text-xs rounded-xl transition-all cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-blue-600 text-white font-extrabold'
                  : 'hover:bg-slate-850 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Community (Thảo luận)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4.5 py-3 text-xs rounded-xl transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white font-extrabold'
                  : 'hover:bg-slate-850 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Student Profile (Hồ sơ)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4.5 py-3 text-xs rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white font-extrabold'
                  : 'hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings (Cài đặt)</span>
            </button>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="space-y-3.5 border-t border-slate-800/60 pt-4 mt-8">
          {/* User Name Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 select-none">
            <span className="truncate max-w-[125px] font-semibold text-slate-200">
              👤 {sessionStorage.getItem('calculix_user_name') || localStorage.getItem('calculix_user_name') || 'Học viên'}
            </span>
            <span className="bg-indigo-900 border border-indigo-700/50 text-indigo-200 text-[8px] font-black uppercase px-2 py-0.5 rounded shrink-0 scale-90 tracking-wide">
              {userStats.level || 'Foundation'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs rounded-xl bg-rose-950/40 hover:bg-rose-900/40 active:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-900/30 hover:border-rose-800/60 font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất (Logout)</span>
          </button>

          <div className="text-[10px] text-slate-500 select-none hidden md:block leading-snug pt-1">
            <p>© 2026 Calculix Platform.</p>
            <p className="mt-0.5">Democratizing Math with AI.</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT VIEWPORT */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* HEADER WELCOME SEARCH ADVISOR ON DESKTOP */}
          <header className={`hidden md:flex items-center justify-between border-b border-slate-200/80 pb-3 mt-1 select-none ${
              activeTab === 'learn' || activeTab === 'compete' || activeTab === 'community' ? 'hidden' : ''
          }`}>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Calculix OS Workspace</p>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 mt-0.5">
                {activeTab === 'dashboard' && 'Xin chào, Học viên 👋'}
                {activeTab === 'progress' && 'EduReach Core Stats'}
                {activeTab === 'profile' && 'Student Honor Space'}
                {activeTab === 'settings' && 'Workspace Configuration'}
              </h2>
            </div>

            <div className="flex gap-4">
              <span className="text-xs font-semibold text-slate-500 self-center">
                📆 UTC: <strong className="text-slate-800 font-mono">22-06-2026</strong>
              </span>
            </div>
          </header>

          {/* RENDER DYNAMIC TAB CONTENT VIEW */}
          {activeTab === 'dashboard' && (
            <Dashboard
              userStats={userStats}
              weeklyChallenges={weeklyChallenges}
              contests={contests}
              onNavigateToTab={navigateWithFilters}
              onJoinChallenge={handleJoinChallenge}
              onJoinContest={handleJoinContest}
            />
          )}

          {activeTab === 'learn' && (
            <Learn
              problems={problems}
              completedProblems={completedProblems}
              userStats={userStats}
              onSolveProblem={handleSolveProblemStatus}
              initialFilters={overrideFilters}
            />
          )}

          {activeTab === 'compete' && (
            <Compete
              weeklyChallenges={weeklyChallenges}
              contests={contests}
              leaderboard={initialLeaderboard}
              onJoinChallenge={handleJoinChallenge}
              onJoinContest={handleJoinContest}
              userPoints={userStats.points}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView userStats={userStats} />
          )}

          {activeTab === 'community' && (
            <Community
              discussions={discussions}
              problems={problems}
              onAddComment={handleAddCommunityComment}
            />
          )}

          {activeTab === 'profile' && (
            <Profile
              userStats={userStats}
              completedProblems={completedProblems}
              problems={problems}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5">
                  <Settings className="w-5 h-5 text-slate-700" /> Cấu hình Học tập Cá nhân (Settings)
                </h2>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Quản lý tần suất học tập thích ứng, nhắc nhở định cấu hình và kết nối.
                </p>
              </div>

              {saveSuccessNotify && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Cấu hình rèn luyện đã được áp dụng thành công vào hệ thống OS.
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div className="space-y-4">
                  
                  {/* Goal set input */}
                  <div className="space-y-1.5.">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mục tiêu rèn luyện cá nhân</label>
                    <select
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      className="w-full border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-3 text-xs outline-hidden font-medium text-slate-800 bg-slate-50"
                    >
                      <option value="Mục tiêu thi đạt giải Chuyên toán Tỉnh/Thành phố">Chuyên toán Tỉnh/Thành phố hoặc Quốc gia Olympic</option>
                      <option value="Đạt điểm tuyệt đối SAT & AMC8/10/12">Điểm tuyệt đối SAT, AMC 8/10/12</option>
                      <option value="Gia tăng thói quen tư duy Đại số & Tổ hợp">Xây dựng vững phản xạ tư duy Đại số và Tổ hợp rời rạc</option>
                    </select>
                  </div>

                  {/* Pace goal select */}
                  <div className="space-y-1.5.">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Thời lượng luyện tập mục tiêu hàng ngày</label>
                    <select
                      value={studyPace}
                      onChange={(e) => setStudyPace(e.target.value)}
                      className="w-full border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-3 text-xs outline-hidden font-medium text-slate-800 bg-slate-50"
                    >
                      <option value="15 phút / ngày">15 phút / ngày (Nhẹ nhàng duy trì đà)</option>
                      <option value="30 phút / ngày">30 phút / ngày (Nghiêm túc rèn luyện phản xạ)</option>
                      <option value="60 phút / ngày">60 phút / ngày (Cố gắng bứt phá ranh giới học thuật)</option>
                    </select>
                  </div>

                  {/* Toggle Reminders */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Bật nhắc nhở thích ứng</span>
                      <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Calculix Email gửi tóm tắt phân tích điểm yếu định kỳ.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={studyReminders}
                        onChange={(e) => setStudyReminders(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    id="btn-save-settings"
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Áp Dụng Cấu Hình
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Reset data simulation back
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="bg-rose-50 hover:bg-rose-100/80 text-rose-700 font-bold text-xs px-4 py-3 rounded-xl transition-all border border-rose-100 cursor-pointer"
                  >
                    Reset Dữ Liệu Rèn Luyện
                  </button>
                </div>
              </form>

              <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl space-y-2 text-xs text-slate-600 leading-normal">
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase block w-fit">
                  Hệ điều hành học toán Calculix Hub
                </span>
                <p className="font-medium">
                  Hệ thống thiết kế theo trật tự 4 lớp cốt lõi: <strong>Learning Engine</strong>, <strong>AI Personalization (EduReach)</strong>, <strong>Competition Arena</strong> và <strong>Analytics Radar</strong>. Dữ liệu rèn luyện của bạn được lưu hoàn toàn cục bộ trên trình duyệt để bảo mật tuyệt đối.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* CHATBOT COOPERATIVE ASSISTANT ON FLOATING LAYER */}
      <AITutorChat />

    </div>
  );
}

// Initial default leaderboard (to ensure scope matching and smooth loading)
const initialLeaderboard: any[] = [];
