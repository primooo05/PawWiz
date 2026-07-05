import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase.js';
import { API_BASE } from '../../../lib/config.js';
import BottomNav from '../../layout/BottomNav.js';
import GreetingHeader from '../../layout/GreetingHeader';
import BehaviorInsightsWidget from './BehaviorInsightsWidget';
import { CircleWrapper } from '../../ui/CircleWrapper';
import { StackedBarChart, DonutChart, LineChart } from './charts/Charts';
import { Activity, Apple, Heart, TrendingUp, AlertCircle, BarChart3, Droplet } from 'lucide-react';
import { useProfilePanel } from '../../../hooks/features/useProfilePanel';
import { usePregnancyTracker } from '../../../hooks/trackers/usePregnancyTracker.js';
import { useDietRecommender } from '../../../hooks/features/useDietRecommender';
import { useBehaviorDecoder } from '../../../hooks/features/useBehaviorDecoder';
import { getTimeGreeting } from '../../../utils/greeting';

// Neo-brutalist palette (shared with charts)
const ORANGE = '#FF6B35';
const TEAL = '#4ECDC4';
const PINK = '#F98080';
const GREEN = '#30c290';

type TrendPeriod = '7' | '30' | 'all';

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

  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('7');

  // Count logged meals that are completed
  const completedMealsCount = diet.activeProfile
    ? Object.values(diet.loggedMeals).filter((meal) => meal.status === 'logged').length
    : 0;
  const totalMealsCount = diet.activeProfile ? Object.keys(diet.loggedMeals).length : 3;

  // --- Gender gating: pregnancy features require at least one female cat ---
  const femaleCats = diet.profiles.filter((p) => p.gender === 'female');
  const hasFemaleCat = femaleCats.length > 0 || profile?.catSex === 'female';

  // --- Nutrition analytics (real data from the active diet profile) ---
  const activeMeals = diet.activeProfile?.loggedMeals ?? [];
  const mealLabels = activeMeals.length
    ? activeMeals.map((m) => m.mealName.slice(0, 3))
    : ['Bre', 'Lun', 'Din'];
  const mealKcals = activeMeals.length ? activeMeals.map((m) => Math.round(m.kcal || 0)) : [0, 0, 0];

  const weightKg = diet.activeProfile
    ? diet.activeProfile.isKg
      ? diet.activeProfile.weight
      : diet.activeProfile.weight / 2.205
    : 0;
  // Resting Energy Requirement (veterinary RER formula), split per meal.
  const dailyRer = weightKg > 0 ? Math.round(70 * Math.pow(weightKg, 0.75)) : 0;
  const perMealTarget = dailyRer > 0 ? Math.round(dailyRer / (mealLabels.length || 3)) : undefined;

  const waterNow = diet.activeProfile?.waterIntake ?? 0;
  const waterGoal = weightKg > 0 ? Math.round(weightKg * 50) : 250; // ~50 ml/kg/day

  // --- Behavior analytics (representative series until a trend endpoint exists) ---
  const behaviorTrendByPeriod: Record<TrendPeriod, { labels: string[]; series: { name: string; color: string; data: number[] }[] }> = {
    '7': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      series: [
        { name: 'Playful', color: TEAL, data: [3, 2, 4, 3, 5, 4, 3] },
        { name: 'Anxious', color: PINK, data: [1, 3, 1, 2, 1, 0, 1] },
        { name: 'Affectionate', color: ORANGE, data: [2, 1, 2, 3, 2, 3, 2] },
      ],
    },
    '30': {
      labels: ['W1', 'W2', 'W3', 'W4'],
      series: [
        { name: 'Playful', color: TEAL, data: [22, 18, 25, 20] },
        { name: 'Anxious', color: PINK, data: [8, 12, 6, 7] },
        { name: 'Affectionate', color: ORANGE, data: [14, 11, 16, 13] },
      ],
    },
    all: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      series: [
        { name: 'Playful', color: TEAL, data: [80, 92, 75, 88, 95] },
        { name: 'Anxious', color: PINK, data: [30, 25, 40, 22, 18] },
        { name: 'Affectionate', color: ORANGE, data: [55, 60, 50, 62, 58] },
      ],
    },
  };
  const behaviorTrend = behaviorTrendByPeriod[trendPeriod];

  const behaviorComposition = [
    { name: 'Playful', color: TEAL, value: 42 },
    { name: 'Affectionate', color: ORANGE, value: 28 },
    { name: 'Anxious', color: PINK, value: 15 },
    { name: 'Aggressive', color: '#b91c1c', value: 8 },
    { name: 'Lethargic', color: '#94a3b8', value: 7 },
  ];

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

          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-5">
              <p className="text-[11px] font-black text-[#888] uppercase tracking-widest">Meals Today</p>
              <p className="text-3xl font-black mt-1" style={{ color: ORANGE }}>
                {completedMealsCount}/{totalMealsCount}
              </p>
              <p className="text-xs font-bold text-[#555] mt-1">logged</p>
            </div>
            <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-5">
              <p className="text-[11px] font-black text-[#888] uppercase tracking-widest">Behaviors / Week</p>
              <p className="text-3xl font-black mt-1" style={{ color: TEAL }}>
                {mergedStats.behavior?.totalEventsWeek ?? '--'}
              </p>
              <p className="text-xs font-bold text-[#555] mt-1">{mergedStats.behavior?.primaryBehavior || 'tracking'}</p>
            </div>
            <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-5">
              <p className="text-[11px] font-black text-[#888] uppercase tracking-widest">Water Today</p>
              <p className="text-3xl font-black mt-1" style={{ color: '#0d7377' }}>
                {waterNow}
                <span className="text-lg"> ml</span>
              </p>
              <p className="text-xs font-bold text-[#555] mt-1">goal {waterGoal} ml</p>
            </div>
            <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-5">
              <p className="text-[11px] font-black text-[#888] uppercase tracking-widest">Diet Score</p>
              <p className="text-3xl font-black mt-1" style={{ color: GREEN }}>
                {mergedStats.diet?.adherenceScore ?? '--'}%
              </p>
              <p className="text-xs font-bold text-[#555] mt-1">adherence</p>
            </div>
          </div>

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

              {/* Pregnancy Tracker Card (female cats only) */}
              {hasFemaleCat && (
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
              )}
            </div>
          </div>

          {/* Behavior Analytics Section */}
          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div className="border-l-4 border-[#1a1a1a] pl-4">
                <h2 className="text-2xl md:text-3xl font-black tracking-wider flex items-center gap-3">
                  <BarChart3 className="w-7 h-7" strokeWidth={3} /> BEHAVIOR ANALYTICS
                </h2>
                <p className="text-sm text-[#555] mt-2 font-bold">Trends and composition across logged behaviors</p>
              </div>
              {/* Period toggle */}
              <div className="flex border-3 border-[#1a1a1a] rounded-xl overflow-hidden self-start">
                {(['7', '30', 'all'] as TrendPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTrendPeriod(p)}
                    className={`px-4 py-2 text-xs font-black tracking-wider uppercase border-r-2 border-[#1a1a1a] last:border-r-0 transition-colors ${
                      trendPeriod === p ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#1a1a1a] hover:bg-[#f0f0eb]'
                    }`}
                  >
                    {p === 'all' ? 'ALL' : `${p}D`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
              <div className="lg:col-span-3 bg-white border-4 border-[#1a1a1a] p-6 rounded-3xl shadow-[4px_4px_0_0_#1a1a1a]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: '#0d7377' }}>
                    Behavior Trend
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {behaviorTrend.series.map((s) => (
                      <span key={s.name} className="flex items-center gap-1.5 text-xs font-black">
                        <span
                          className="inline-block w-3 h-3 border-2 border-[#1a1a1a] rounded-sm"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
                <StackedBarChart labels={behaviorTrend.labels} series={behaviorTrend.series} height={260} />
              </div>

              <div className="lg:col-span-2 bg-white border-4 border-[#1a1a1a] p-6 rounded-3xl shadow-[4px_4px_0_0_#1a1a1a]">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#0d7377' }}>
                  Behavior Composition
                </h3>
                <DonutChart data={behaviorComposition} size={180} />
              </div>
            </div>
          </div>

          {/* Nutrition Analytics Section */}
          <div className="mt-16">
            <div className="border-l-4 border-[#1a1a1a] pl-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-wider flex items-center gap-3">
                <Apple className="w-7 h-7" strokeWidth={3} /> NUTRITION ANALYTICS
              </h2>
              <p className="text-sm text-[#555] mt-2 font-bold">Calorie intake vs target and hydration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white border-4 border-[#1a1a1a] p-6 rounded-3xl shadow-[4px_4px_0_0_#1a1a1a]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: ORANGE }}>
                    Calorie Intake vs RER Target
                  </h3>
                  {perMealTarget !== undefined && (
                    <span className="text-xs font-black text-[#555]">Target ~{perMealTarget} kcal/meal</span>
                  )}
                </div>
                <LineChart labels={mealLabels} values={mealKcals} target={perMealTarget} color={ORANGE} height={240} />
              </div>

              <div className="bg-white border-4 border-[#1a1a1a] p-6 rounded-3xl shadow-[4px_4px_0_0_#1a1a1a]">
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#0d7377' }}>
                  <Droplet className="w-4 h-4" strokeWidth={3} /> Hydration — Today vs Goal
                </h3>
                <StackedBarChart
                  labels={['Intake', 'Goal']}
                  series={[{ name: 'ml', color: TEAL, data: [waterNow, waterGoal] }]}
                  height={240}
                />
              </div>
            </div>
          </div>

          {/* Pregnancy & Insights Section (female cats only) */}
          {hasFemaleCat && (
            <div className="mt-16">
              <div className="border-l-4 border-[#1a1a1a] pl-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-black tracking-wider flex items-center gap-3">
                  <Heart className="w-7 h-7" strokeWidth={3} /> PREGNANCY &amp; INSIGHTS
                </h2>
                <p className="text-sm text-[#555] mt-2 font-bold">Gestation milestones and prep guidance</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Gestation timeline */}
                <div className="bg-white border-4 border-[#1a1a1a] p-6 rounded-3xl shadow-[4px_4px_0_0_#1a1a1a]">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: PINK }}>
                      Gestation Timeline
                    </h3>
                    <span className="text-xs font-black text-[#555]">
                      {pregnancy.isTracking ? `Day ${pregnancy.currentDay} / 65` : 'Not tracking'}
                    </span>
                  </div>

                  <div className="flex items-start">
                    {[
                      { label: 'Mating', day: 0 },
                      { label: 'Confirm', day: 14 },
                      { label: 'Mid-term', day: 30 },
                      { label: 'Nesting', day: 50 },
                      { label: 'Birth', day: 65 },
                    ].map((step, idx, arr) => {
                      const reached = pregnancy.currentDay >= step.day;
                      const isActive =
                        pregnancy.currentDay >= step.day &&
                        (idx === arr.length - 1 || pregnancy.currentDay < arr[idx + 1].day);
                      return (
                        <div key={step.label} className="flex-1 text-center relative">
                          {idx < arr.length - 1 && (
                            <div
                              className="absolute top-[10px] left-1/2 w-full h-1 border-t-4 border-[#1a1a1a]"
                              style={{ zIndex: 0 }}
                            />
                          )}
                          <div
                            className={`relative z-10 w-6 h-6 mx-auto mb-2 border-3 border-[#1a1a1a] rounded-full ${
                              isActive ? 'bg-[#FFD700]' : reached ? 'bg-[#30c290]' : 'bg-white'
                            }`}
                          />
                          <span className="text-[10px] md:text-xs font-black uppercase">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 bg-[#f5f5f0] border-3 border-[#1a1a1a] rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-[#30c290] border-r-2 border-[#1a1a1a] transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, pregnancy.progressPercentage))}%` }}
                    />
                  </div>
                  <p className="text-xs font-black mt-2 text-right">
                    {Math.round(pregnancy.progressPercentage)}% COMPLETE
                    {pregnancy.isTracking ? ` · ${pregnancy.daysRemaining} DAYS LEFT` : ''}
                  </p>

                  <button
                    onClick={() => navigate('/pregnancy-tracker')}
                    className="mt-5 w-full bg-[#F98080] hover:bg-white text-white hover:text-[#F98080] font-black py-3 border-2 border-[#1a1a1a] rounded-2xl shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all text-sm tracking-wider uppercase"
                  >
                    Open Pregnancy Tracker
                  </button>
                </div>

                {/* Prep recommendations */}
                <div className="bg-white border-4 border-[#1a1a1a] p-6 rounded-3xl shadow-[4px_4px_0_0_#1a1a1a]">
                  <div className="flex items-start gap-4 mb-4">
                    <TrendingUp className="w-7 h-7 flex-shrink-0 mt-1" strokeWidth={3} />
                    <div>
                      <h3 className="font-black text-lg tracking-wide">PREP INSIGHTS</h3>
                      <p className="text-xs text-[#888] font-bold mt-1 uppercase">Stage-based guidance</p>
                    </div>
                  </div>
                  <div className="space-y-3 border-t-2 border-[#1a1a1a] pt-4">
                    {pregnancy.currentWeek >= 7 ? (
                      <p className="text-sm font-bold">→ Prepare a quiet birthing box in a warm, private spot</p>
                    ) : (
                      <p className="text-sm font-bold">→ Schedule a vet checkup to confirm pregnancy and litter size</p>
                    )}
                    <p className="text-sm font-bold">→ Increase calorie intake with a kitten/gestation formula</p>
                    <p className="text-sm font-bold">→ Keep fresh water available and monitor daily weight</p>
                    <p className="text-sm font-bold">→ Log symptoms daily so we can flag anything concerning</p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              {/* Pregnancy Widget (female cats only) */}
              {hasFemaleCat && pregnancy.isTracking ? (
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
                  onClick={() => navigate('/behavior-chat')}
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
