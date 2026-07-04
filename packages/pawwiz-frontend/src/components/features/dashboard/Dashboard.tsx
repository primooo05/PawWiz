import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase.js';
import { API_BASE } from '../../../lib/config.js';
import BottomNav from '../../layout/BottomNav.js';
import GreetingHeader from '../../layout/GreetingHeader';
import BehaviorInsightsWidget from './BehaviorInsightsWidget';
import { CircleWrapper } from '../../ui/CircleWrapper';
import { Activity, Apple, Heart, TrendingUp, AlertCircle } from 'lucide-react';
import { useProfilePanel } from '../../../hooks/features/useProfilePanel';
import { usePregnancyTracker } from '../../../hooks/trackers/usePregnancyTracker.js';
import { useDietRecommender } from '../../../hooks/features/useDietRecommender';
import { useBehaviorDecoder } from '../../../hooks/features/useBehaviorDecoder';
import { getTimeGreeting } from '../../../utils/greeting';

interface DashboardStats {
  diet?: {
    lastRecommendation?: string;
    nextMealTime?: string;
    adherenceScore?: number;
    topRecommendedFood?: string;
  };
  behavior?: {
    overallTrend?: string;
    totalEventsWeek?: number;
    primaryBehavior?: string;
    healthStatus?: 'healthy' | 'needs_attention' | 'concerning';
  };
  pregnancy?: {
    isPregnant?: boolean;
    weeksAlong?: number;
    estimatedDelivery?: string;
    currentStage?: string;
    lastUpdate?: string;
  };
  catName?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfilePanel();
  const pregnancy = usePregnancyTracker();
  const diet = useDietRecommender();
  const behavior = useBehaviorDecoder('');
  
  const [stats, setStats] = useState<DashboardStats>({});
  const [catName, setCatName] = useState<string>('Your Cat');
  
  const [isTransitioning, setIsTransitioning] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );
  const [isZIndexHigh, setIsZIndexHigh] = useState(
    !!(location.state as { animateIn?: boolean })?.animateIn
  );

  useEffect(() => {
    if ((location.state as { animateIn?: boolean })?.animateIn) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setTimeout(() => setIsZIndexHigh(false), 800);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        // Fetch dashboard stats from API
        const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
          if (data.catName) setCatName(data.catName);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleNavigation = (item: string) => {
    if (item === 'calendar') navigate('/pregnancy-tracker');
    else if (item === 'dashboard') navigate('/dashboard');
    else if (item === 'diet-reco') navigate('/diet-recommender');
    else if (item === 'settings') navigate('/settings');
    else if (item === 'behavior') navigate('/behavior-chat');
    else if (item === 'plant') navigate('/');
  };

  // Count logged meals that are completed
  const completedMealsCount = diet.activeProfile
    ? Object.values(diet.loggedMeals).filter((meal) => meal.status === 'logged').length
    : 0;
  const totalMealsCount = diet.activeProfile ? Object.keys(diet.loggedMeals).length : 3;

  const dashboardGreeting = getTimeGreeting(
    {
      morning: (owner, cat) => ({
        title: `Good morning, ${owner}!`,
        subtitle: `Here's how ${cat} is doing across every module`,
      }),
      midday: (owner, cat) => ({
        title: `Hi ${owner}!`,
        subtitle: `A quick look at ${cat}'s day so far`,
      }),
      evening: (owner, cat) => ({
        title: `Good evening, ${owner}.`,
        subtitle: `Wrapping up ${cat}'s care for today`,
      }),
      night: (owner, cat) => ({
        title: `Hello, ${owner}!`,
        subtitle: `Checking in on ${cat} tonight`,
      }),
    },
    profile?.displayName,
    catName
  );

  const avatarDataList = diet.profiles.map((p) => ({
    id: p.id,
    name: p.name,
    src: p.photoUrl || undefined,
    alt: p.name,
    isActive: p.id === diet.activeProfileId,
    isNew: !p.isTracking,
  }));

  // Merge API stats with hook data
  const mergedStats: DashboardStats = {
    diet: {
      lastRecommendation: stats.diet?.lastRecommendation || 'Today',
      nextMealTime: stats.diet?.nextMealTime || '2:00 PM',
      adherenceScore: stats.diet?.adherenceScore ?? 95,
      topRecommendedFood: stats.diet?.topRecommendedFood || 'Salmon with rice blend',
    },
    behavior: {
      overallTrend: stats.behavior?.overallTrend || 'Healthy & engaged',
      totalEventsWeek: stats.behavior?.totalEventsWeek ?? 24,
      primaryBehavior: stats.behavior?.primaryBehavior || 'Playful',
      healthStatus: stats.behavior?.healthStatus || 'healthy',
    },
    pregnancy: {
      isPregnant: pregnancy.isTracking,
      weeksAlong: pregnancy.currentWeek,
      estimatedDelivery: pregnancy.dueDateString,
      currentStage: pregnancy.isTracking ? `Week ${pregnancy.currentWeek}` : 'Not tracking',
      lastUpdate: stats.pregnancy?.lastUpdate,
    },
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F0] text-[#1a1a1a] font-sans pb-24 md:pb-12 relative overflow-hidden">
      <CircleWrapper isTransitioning={isTransitioning} isZIndexHigh={isZIndexHigh} />
      
      <div className={`transition-opacity duration-300 ${
        isTransitioning
          ? 'invisible opacity-0'
          : isZIndexHigh
            ? 'opacity-0'
            : 'opacity-100'
      }`}>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {/* Greeting Header */}
          <GreetingHeader
            title={dashboardGreeting.title}
            subtitle={dashboardGreeting.subtitle}
            avatars={avatarDataList}
            onAvatarClick={(id) => diet.switchProfile(id)}
            className="mb-10"
          />

          {/* Stats Grid Header */}
          <div className="mb-12">
            <div className="border-l-4 border-[#1a1a1a] pl-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-wider">QUICK OVERVIEW</h2>
              <p className="text-sm text-[#555] mt-2 font-bold">Monitor all modules at a glance</p>
            </div>

            {/* Three-Column Neo Brutalism Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Diet Recommender Card */}
              <div
                onClick={() => navigate('/diet-recommender')}
                className="cursor-pointer group bg-white border-4 border-[#1a1a1a] p-8 hover:shadow-[8px_8px_0_0_#1a1a1a] transition-all duration-300 hover:-translate-y-1 rounded-3xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-[#FF6B35] flex items-center justify-center border-3 border-[#1a1a1a] rounded-2xl group-hover:rotate-12 transition-transform">
                    <Apple className="w-8 h-8 text-white font-black" strokeWidth={3} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#888] uppercase tracking-widest">Score</p>
                    <p className="text-3xl font-black text-[#FF6B35]">
                      {mergedStats.diet?.adherenceScore ?? '--'}%
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-black mb-2 tracking-wide">DIET PLAN</h3>
                <p className="text-sm text-[#555] mb-4 font-bold">
                  {mergedStats.diet?.topRecommendedFood || 'No recommendations yet'}
                </p>

                <div className="space-y-2 mb-6 pb-6 border-b-2 border-[#1a1a1a]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black uppercase">Next meal:</span>
                    <span className="font-bold">{mergedStats.diet?.nextMealTime || 'Not scheduled'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black uppercase">Last Update:</span>
                    <span className="font-bold">{mergedStats.diet?.lastRecommendation || 'Never'}</span>
                  </div>
                </div>

                <button className="w-full bg-[#FF6B35] text-white font-black py-3 border-2 border-[#1a1a1a] rounded-2xl hover:bg-white hover:text-[#FF6B35] transition-all">
                  VIEW PLAN
                </button>
              </div>

              {/* Behavior Tracker Card */}
              <div
                onClick={() => navigate('/behavior-chat')}
                className="cursor-pointer group bg-white border-4 border-[#1a1a1a] p-8 hover:shadow-[8px_8px_0_0_#1a1a1a] transition-all duration-300 hover:-translate-y-1 rounded-3xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-[#4ECDC4] flex items-center justify-center border-3 border-[#1a1a1a] rounded-2xl group-hover:rotate-12 transition-transform">
                    <Activity className="w-8 h-8 text-white font-black" strokeWidth={3} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#888] uppercase tracking-widest">Events</p>
                    <p className="text-3xl font-black text-[#4ECDC4]">
                      {mergedStats.behavior?.totalEventsWeek ?? '--'}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-black mb-2 tracking-wide">BEHAVIOR</h3>
                <p className="text-sm text-[#555] mb-4 font-bold">
                  {mergedStats.behavior?.overallTrend || 'Data pending'}
                </p>

                <div className="space-y-2 mb-6 pb-6 border-b-2 border-[#1a1a1a]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black uppercase">Top Behavior:</span>
                    <span className="font-bold">{mergedStats.behavior?.primaryBehavior || 'Analyzing'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black uppercase">Status:</span>
                    <span
                      className={`font-black uppercase px-2 py-1 rounded-lg ${
                        mergedStats.behavior?.healthStatus === 'healthy'
                          ? 'bg-green-200 text-green-900'
                          : mergedStats.behavior?.healthStatus === 'needs_attention'
                            ? 'bg-yellow-200 text-yellow-900'
                            : 'bg-red-200 text-red-900'
                      }`}
                    >
                      {mergedStats.behavior?.healthStatus?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                </div>

                <button className="w-full bg-[#4ECDC4] text-white font-black py-3 border-2 border-[#1a1a1a] rounded-2xl hover:bg-white hover:text-[#4ECDC4] transition-all">
                  TRACK BEHAVIOR
                </button>
              </div>

              {/* Pregnancy Tracker Card */}
              <div
                onClick={() => navigate('/pregnancy-tracker')}
                className="cursor-pointer group bg-white border-4 border-[#1a1a1a] p-8 hover:shadow-[8px_8px_0_0_#1a1a1a] transition-all duration-300 hover:-translate-y-1 rounded-3xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-[#F98080] flex items-center justify-center border-3 border-[#1a1a1a] rounded-2xl group-hover:rotate-12 transition-transform">
                    <Heart className="w-8 h-8 text-white font-black" strokeWidth={3} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#888] uppercase tracking-widest">Weeks</p>
                    <p className="text-3xl font-black text-[#F98080]">
                      {mergedStats.pregnancy?.weeksAlong ?? '--'}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-black mb-2 tracking-wide">PREGNANCY</h3>
                <p className="text-sm text-[#555] mb-4 font-bold">
                  {mergedStats.pregnancy?.isPregnant
                    ? `Stage: ${mergedStats.pregnancy?.currentStage || 'Tracking'}`
                    : 'Not currently tracking'}
                </p>

                <div className="space-y-2 mb-6 pb-6 border-b-2 border-[#1a1a1a]">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black uppercase">Est. Delivery:</span>
                    <span className="font-bold">{mergedStats.pregnancy?.estimatedDelivery || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black uppercase">Status:</span>
                    <span className="font-bold">{mergedStats.pregnancy?.isPregnant ? '🤰 Active' : '⏳ Standby'}</span>
                  </div>
                </div>

                <button className="w-full bg-[#F98080] text-white font-black py-3 border-2 border-[#1a1a1a] rounded-2xl hover:bg-white hover:text-[#F98080] transition-all">
                  MONITOR
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-16">
            <div className="border-l-4 border-[#1a1a1a] pl-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-wider">RECENT ACTIVITY</h2>
              <p className="text-sm text-[#555] mt-2 font-bold">Latest updates across all modules</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Alert Card - Left */}
              <div className="bg-white border-4 border-[#FFD700] p-8 rounded-3xl">
                <div className="flex items-start gap-4 mb-4">
                  <AlertCircle className="w-8 h-8 text-[#FFD700] flex-shrink-0 mt-1" strokeWidth={3} />
                  <div>
                    <h3 className="font-black text-lg tracking-wide">HEALTH ALERTS</h3>
                    <p className="text-xs text-[#888] font-bold mt-1 uppercase">Active notifications</p>
                  </div>
                </div>
                <div className="space-y-3 border-t-2 border-[#1a1a1a] pt-4 mt-4">
                  {mergedStats.behavior?.healthStatus === 'concerning' ? (
                    <p className="text-sm font-bold text-[#FF6B35]">
                      ⚠️ Concerning behavior patterns detected. Review immediately.
                    </p>
                  ) : mergedStats.behavior?.healthStatus === 'needs_attention' ? (
                    <p className="text-sm font-bold text-[#F98080]">
                      📋 Minor health changes detected. Consider consulting vet.
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-[#4ECDC4]">
                      ✓ All systems normal. Your cat is doing great!
                    </p>
                  )}
                </div>
              </div>

              {/* Recommendations Card - Right */}
              <div className="bg-white border-4 border-[#1a1a1a] p-8 rounded-3xl">
                <div className="flex items-start gap-4 mb-4">
                  <TrendingUp className="w-8 h-8 text-[#1a1a1a] flex-shrink-0 mt-1" strokeWidth={3} />
                  <div>
                    <h3 className="font-black text-lg tracking-wide">RECOMMENDATIONS</h3>
                    <p className="text-xs text-[#888] font-bold mt-1 uppercase">Personalized insights</p>
                  </div>
                </div>
                <div className="space-y-3 border-t-2 border-[#1a1a1a] pt-4 mt-4">
                  <p className="text-sm font-bold">
                    → Focus on balanced diet with hydration support
                  </p>
                  <p className="text-sm font-bold">
                    → Increase interactive playtime by 15 minutes daily
                  </p>
                  <p className="text-sm font-bold">
                    → Schedule regular wellness check-ins
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Widget Cards Section */}
          <div className="mt-16">
            <div className="border-l-4 border-[#1a1a1a] pl-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-wider">DETAILED WIDGETS</h2>
              <p className="text-sm text-[#555] mt-2 font-bold">Comprehensive module details</p>
            </div>

            <div className="space-y-6">
              {/* Pregnancy Widget */}
              {pregnancy.isTracking ? (
                <div className="bg-[#FFFDF0] border-4 border-[#1a1a1a] p-6 shadow-[4px_4px_0_0_#1a1a1a] rounded-3xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xs font-black text-[#b8860b] uppercase tracking-widest mb-2">
                        Pregnancy Monitoring
                      </h2>
                      <p className="text-3xl font-black text-slate-900">
                        Day {pregnancy.currentDay} / 65
                      </p>
                    </div>
                    <span className="inline-block bg-[#FFB870] border-2 border-[#1a1a1a] px-4 py-2 text-xs font-black text-slate-900 uppercase tracking-widest rounded-xl">
                      Week {pregnancy.currentWeek}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-4 border-2 border-[#1a1a1a] overflow-hidden mb-4 rounded-full">
                    <div
                      className="bg-[#30c290] h-full transition-all duration-300 border-r-2 border-[#1a1a1a]"
                      style={{ width: `${pregnancy.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-600 border-t-2 border-[#1a1a1a] pt-3 mb-4">
                    <span>Mating: {pregnancy.matingDate}</span>
                    <span className="text-slate-900 font-black">
                      {pregnancy.daysRemaining} DAYS LEFT!
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/pregnancy-tracker')}
                    className="w-full bg-[#F98080] hover:bg-white text-white hover:text-[#F98080] font-black py-3 border-2 border-[#1a1a1a] rounded-2xl shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all text-sm tracking-wider uppercase"
                  >
                    Open Pregnancy Tracker
                  </button>
                </div>
              ) : null}

              {/* Diet Widget */}
              {diet.activeProfile && (
                <div className="bg-[#EBF7F5] border-4 border-[#1a1a1a] p-6 shadow-[4px_4px_0_0_#1a1a1a] rounded-3xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xs font-black text-[#0d7377] uppercase tracking-widest mb-2">
                        Daily Nutrition Log
                      </h2>
                      <p className="text-3xl font-black text-slate-900">
                        {completedMealsCount} / {totalMealsCount} Meals
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Water Intake</p>
                      <p className="text-2xl font-black text-[#0d7377]">{diet.activeProfile.waterIntake} ml</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {Object.entries(diet.loggedMeals).map(([key, meal]) => (
                      <div
                        key={key}
                        className={`border-2 p-3 text-center transition-all font-black rounded-xl ${
                          meal.status === 'logged'
                            ? 'bg-[#30c290]/20 border-[#30c290] text-teal-950'
                            : meal.status === 'skipped'
                            ? 'bg-slate-100 border-slate-300 text-slate-400 line-through'
                            : 'bg-white border-[#1a1a1a] text-slate-500'
                        }`}
                      >
                        <div className="text-xs uppercase tracking-wider">{key}</div>
                        <div className="text-sm mt-1 uppercase tracking-wider">
                           {meal.status === 'logged' ? 'Done' : meal.status === 'skipped' ? 'Skipped' : 'Pending'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/diet-recommender')}
                    className="w-full bg-[#30c290] hover:bg-white text-white hover:text-[#30c290] font-black py-3 border-2 border-[#1a1a1a] rounded-2xl shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all text-sm tracking-wider uppercase"
                  >
                    Manage Diet & Water
                  </button>
                </div>
              )}

              {/* Behavior Insights Widget */}
              <BehaviorInsightsWidget onViewMore={() => navigate('/behavior-chat')} />

              {/* Behavior Explainer Widget */}
              <div className="bg-[#FFF5F5] border-4 border-[#1a1a1a] p-6 shadow-[4px_4px_0_0_#1a1a1a] rounded-3xl">
                <h2 className="text-xs font-black text-[#b91c1c] uppercase tracking-widest mb-4">
                  Feline Behavior Explainer
                </h2>
                {behavior.decodeResult ? (
                  <div className="bg-white border-2 border-[#1a1a1a] p-4 mb-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">
                        Decoded State
                      </span>
                      <span className="text-xs font-black bg-red-100 text-red-700 px-3 py-1 rounded-lg">
                        {Math.round(behavior.decodeResult.confidenceScore * 100)}% MATCH
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-800 mb-2">
                      {behavior.decodeResult.catState}
                    </p>
                    <p className="text-xs font-bold text-slate-600">
                      "{behavior.decodeResult.decodedMeaning}"
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-gray-600 mb-4">
                    Understand what your cat is trying to communicate through body language and vocals.
                  </p>
                )}

                <button
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('behavior')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full bg-[#FFB870] hover:bg-white text-slate-900 hover:text-[#FFB870] font-black py-3 border-2 border-[#1a1a1a] rounded-2xl shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all text-sm tracking-wider uppercase"
                >
                  Analyze Behavior
                </button>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
        <BottomNav activeItem="dashboard" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
      </div>
    </div>
  );
};

export default Dashboard;
