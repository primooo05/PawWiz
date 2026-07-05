import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase.js';
import { API_BASE } from '../../../lib/config.js';
import BottomNav from '../../layout/BottomNav.js';
import GreetingHeader from '../../layout/GreetingHeader';
import QuickLogBar from '../quicklog/QuickLogBar';
import ProfileCard from '../diet/sub-components/ProfileCard.js';
import { CircleWrapper } from '../../ui/CircleWrapper';
import { StackedBarChart, DonutChartLabeled, LineChart } from './charts/Charts';
import { Activity, Apple, Heart, BarChart3, Droplet, Stethoscope } from 'lucide-react';
import { useProfilePanel } from '../../../hooks/features/useProfilePanel';
import { usePregnancyTracker } from '../../../hooks/trackers/usePregnancyTracker.js';
import { useDietRecommender, getAgeBracketInfo } from '../../../hooks/features/useDietRecommender';
import { getTimeGreeting } from '../../../utils/greeting';
import HealthInsightsWidget from './HealthInsightsWidget.js';

// Neo-brutalist palette (shared with charts)
const ORANGE = '#FF6B35';
const TEAL = '#4ECDC4';
const PINK = '#F98080';
const GREEN = '#30c290';

// Behavior → color map, shared with the Quick Log bar so a behavior reads the
// same everywhere (playful=teal, affectionate=orange, ...).
const BEHAVIOR_COLORS: Record<string, string> = {
  playful: TEAL,
  affectionate: ORANGE,
  vocal: '#8b5cf6',
  anxious: PINK,
  aggressive: '#b91c1c',
  lethargic: '#94a3b8',
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

  const [stats, setStats] = useState<DashboardStats>({});
  const [behaviorPatterns, setBehaviorPatterns] = useState<Array<{ type: string; frequency: number }>>([]);
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

  // Pull behavior data from the real behavior-dashboard endpoints (there is no
  // /api/dashboard/stats aggregator). Exposed as a callback so it can be
  // re-run after a Quick Log entry to keep the composition live.
  const refreshBehaviorStats = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };

      const [patternsRes, insightsRes] = await Promise.all([
        fetch(`${API_BASE}/api/behavior/dashboard/patterns?days=7`, { headers }),
        fetch(`${API_BASE}/api/behavior/dashboard/insights`, { headers }),
      ]);

      const behavior: DashboardStats['behavior'] = {};

      if (patternsRes.ok) {
        const patterns: Array<{ type: string; frequency: number }> = await patternsRes.json();
        setBehaviorPatterns(patterns);
        behavior.totalEventsWeek = patterns.reduce((sum, p) => sum + (p.frequency || 0), 0);
        const top = [...patterns].sort((a, b) => b.frequency - a.frequency)[0];
        if (top) behavior.primaryBehavior = capitalize(top.type);
      }

      if (insightsRes.ok) {
        const insights: { overallTrend?: string } = await insightsRes.json();
        if (insights.overallTrend) {
          behavior.overallTrend = insights.overallTrend;
          const trend = insights.overallTrend.toLowerCase();
          behavior.healthStatus = trend.includes('concern')
            ? 'concerning'
            : trend.includes('attention')
              ? 'needs_attention'
              : 'healthy';
        }
      }

      setStats({ behavior });
    } catch (err) {
      console.error('Failed to fetch behavior stats:', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      refreshBehaviorStats();
    })();
  }, [navigate, refreshBehaviorStats]);

  // Keep the greeting/activity cat name in sync with the active diet profile.
  useEffect(() => {
    if (diet.activeProfile?.name) setCatName(diet.activeProfile.name);
  }, [diet.activeProfile?.name]);

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
    ? diet.loggedMeals.filter((meal) => meal.status === 'logged').length
    : 0;
  const totalMealsCount = diet.activeProfile ? diet.loggedMeals.length : 3;

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

  // Real diet KPIs (no placeholders): adherence = today's completed-meal ratio,
  // recommended food + next meal derived from the active profile.
  const dietAdherence = totalMealsCount > 0
    ? Math.round((completedMealsCount / totalMealsCount) * 100)
    : 0;
  const ageInfo = diet.activeProfile
    ? getAgeBracketInfo(diet.activeProfile.lifeStage, diet.activeProfile.age)
    : undefined;
  const nextPendingMeal = (diet.activeProfile?.loggedMeals ?? []).find(
    (m) => m.status === 'pending'
  );

  // Today's activity feed — built from real logged meals + water intake.
  const activityItems = useMemo(() => {
    type ActivityItem = {
      key: string;
      title: string;
      subtitle: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Icon: React.ComponentType<any>;
      color: string;
      badge?: string;
      badgeBg?: string;
      badgeColor?: string;
    };
    const items: ActivityItem[] = [];
    const loggedMeals = diet.activeProfile?.loggedMeals ?? [];

    for (const m of loggedMeals) {
      if (m.status === 'logged') {
        const amountLabel =
          m.amount != null
            ? `${m.amount} ${m.unit ?? 'spoon'}${m.amount !== 1 ? 's' : ''} · `
            : '';
        items.push({
          key: `meal-${m.id}`,
          title: `${m.mealName} logged`,
          subtitle: `${amountLabel}${Math.round(m.kcal || 0)} kcal`,
          Icon: Apple,
          color: ORANGE,
          badge: m.timestamp || 'Done',
          badgeBg: '#fff0e8',
          badgeColor: ORANGE,
        });
      } else if (m.status === 'skipped') {
        items.push({
          key: `meal-${m.id}`,
          title: `${m.mealName} skipped`,
          subtitle: 'Marked as skipped for today',
          Icon: Apple,
          color: '#94a3b8',
          badge: 'Skipped',
          badgeBg: '#f0f0eb',
          badgeColor: '#555',
        });
      }
    }

    if (waterNow > 0) {
      items.push({
        key: 'water',
        title: 'Water intake',
        subtitle: `${waterNow} / ${waterGoal} ml today`,
        Icon: Droplet,
        color: TEAL,
        badge: `${Math.min(100, Math.round((waterNow / waterGoal) * 100))}%`,
        badgeBg: '#e6faf8',
        badgeColor: '#0d7377',
      });
    }

    return items;
  }, [diet.activeProfile, waterNow, waterGoal]);

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

  // Real behavior composition (mood mix) derived from the last 7 days of logs.
  const behaviorComposition = useMemo(
    () =>
      [...behaviorPatterns]
        .filter((p) => p.frequency > 0)
        .sort((a, b) => b.frequency - a.frequency)
        .map((p) => ({
          name: capitalize(p.type),
          color: BEHAVIOR_COLORS[p.type] ?? '#94a3b8',
          value: p.frequency,
        })),
    [behaviorPatterns]
  );
  const totalBehaviorLogs = behaviorComposition.reduce((sum, c) => sum + c.value, 0);
  const dominantBehavior = behaviorComposition[0];
  const dominantShare =
    totalBehaviorLogs > 0 && dominantBehavior
      ? Math.round((dominantBehavior.value / totalBehaviorLogs) * 100)
      : 0;

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
      lastRecommendation: diet.activeProfile?.updatedAt
        ? new Date(diet.activeProfile.updatedAt).toLocaleDateString()
        : '—',
      nextMealTime: diet.activeProfile
        ? nextPendingMeal
          ? nextPendingMeal.mealName
          : 'All logged'
        : '—',
      adherenceScore: diet.activeProfile ? dietAdherence : undefined,
      topRecommendedFood: ageInfo?.recommendedFood || 'Set up a diet profile',
    },
    behavior: {
      overallTrend: stats.behavior?.overallTrend || 'Not enough data yet',
      totalEventsWeek: stats.behavior?.totalEventsWeek ?? 0,
      primaryBehavior: stats.behavior?.primaryBehavior || '—',
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

          {/* Cat Profile + Behavior Analytics — side-by-side on desktop, stacked on mobile */}
          <div className="flex flex-col md:flex-row md:items-start gap-8 mb-12">
            {/* Cat Profile Card */}
            {diet.activeProfile && (
              <div className="w-full md:w-auto md:flex-shrink-0">
                <ProfileCard
                  catName={diet.activeProfile.name}
                  displayName={profile?.displayName}
                  gender={diet.activeProfile.gender}
                  weight={diet.activeProfile.weight}
                  isKg={diet.activeProfile.isKg}
                  foodPreference={diet.activeProfile.foodPreference}
                  isSpayedNeutered={diet.activeProfile.isSpayedNeutered}
                  activeLifeStage={diet.activeProfile.lifeStage}
                  lifeStage={diet.activeProfile.lifeStage}
                  age={diet.activeProfile.age}
                  onEditProfile={() => navigate('/diet-recommender')}
                  photoUrl={diet.activeProfile.photoUrl}
                />
              </div>
            )}

            {/* Behavior Analytics — right side on desktop */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="border-l-4 border-[#1a1a1a] pl-4">
                  <h2 className="text-2xl md:text-3xl font-black tracking-wider flex items-center gap-3">
                    <BarChart3 className="w-7 h-7" strokeWidth={3} /> BEHAVIOR ANALYTICS
                  </h2>
                  <p className="text-sm text-[#555] mt-1 font-bold">Trends and composition across logged behaviors</p>
                </div>
                {/* Period toggle */}
                <div className="flex border-3 border-[#1a1a1a] rounded-xl overflow-hidden self-start">
                  {(['7', '30', 'all'] as TrendPeriod[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setTrendPeriod(p)}
                      className={`px-3 py-1.5 text-xs font-black tracking-wider uppercase border-r-2 border-[#1a1a1a] last:border-r-0 transition-colors ${
                        trendPeriod === p ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#1a1a1a] hover:bg-[#f0f0eb]'
                      }`}
                    >
                      {p === 'all' ? 'ALL' : `${p}D`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border-4 border-[#1a1a1a] p-5 rounded-3xl shadow-[4px_4px_0_0_#1a1a1a]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
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
                <StackedBarChart labels={behaviorTrend.labels} series={behaviorTrend.series} height={220} />
              </div>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-5">
              <p className="text-[11px] font-black text-[#888] uppercase tracking-widest">Meals Today</p>
              <p className="text-3xl font-black mt-1" style={{ color: ORANGE }}>
                {completedMealsCount}/{totalMealsCount}
              </p>
              <p className="text-xs font-bold text-[#555] mt-1">logged</p>
            </div>

            {/* Top Behavior — includes the composition legend + donut inline */}
            <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-5">
              <p className="text-[11px] font-black text-[#888] uppercase tracking-widest">Top Behavior</p>
              {behaviorComposition.length > 0 ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-lg font-black leading-tight truncate"
                      style={{ color: dominantBehavior?.color ?? TEAL }}
                    >
                      {dominantBehavior ? dominantBehavior.name : '—'}
                    </p>
                    <p className="text-[11px] font-bold text-[#555] mt-0.5">
                      {dominantBehavior ? `${dominantShare}% of this week` : 'No logs yet'}
                    </p>
                    <ul className="mt-2 space-y-0.5">
                      {behaviorComposition.map((c) => (
                        <li key={c.name} className="flex items-center gap-1.5 text-[10px] font-black">
                          <span
                            className="inline-block w-2.5 h-2.5 border border-[#1a1a1a] rounded-sm flex-shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0">
                    <DonutChartLabeled data={behaviorComposition} size={104} minLabelPercent={15} />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-3xl font-black mt-1" style={{ color: TEAL }}>—</p>
                  <p className="text-xs font-bold text-[#555] mt-1">No logs yet</p>
                </>
              )}
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

          {/* Quick Log */}
          <div className="mb-12">
            <QuickLogBar
              meals={diet.activeProfile?.loggedMeals ?? []}
              catName={diet.activeProfile?.name ?? catName}
              addMeal={diet.addMeal}
              skipMeal={diet.skipMeal}
              resetMealLog={diet.resetMealLog}
              waterIntake={waterNow}
              onAddWater={(amount) => diet.addWater(amount)}
              catId={diet.activeProfileId || undefined}
              disabled={!diet.activeProfile}
              onBehaviorLogged={refreshBehaviorStats}
            />
          </div>

          {/* Stats Grid Header */}
          <div className="mb-12">
            <div className="border-l-4 border-[#1a1a1a] pl-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-wider">QUICK OVERVIEW</h2>
              <p className="text-sm text-[#555] mt-2 font-bold">Monitor all modules at a glance</p>
            </div>

            {/* Swipeable on mobile (horizontal scroll-snap), 3-col grid on desktop */}
            <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Diet Recommender Card */}
              <div
                onClick={() => navigate('/diet-recommender')}
                className="snap-center shrink-0 w-[82%] sm:w-[58%] md:w-auto cursor-pointer group bg-white border-4 border-[#1a1a1a] p-8 hover:shadow-[8px_8px_0_0_#1a1a1a] transition-all duration-300 hover:-translate-y-1 rounded-3xl"
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
                className="snap-center shrink-0 w-[82%] sm:w-[58%] md:w-auto cursor-pointer group bg-white border-4 border-[#1a1a1a] p-8 hover:shadow-[8px_8px_0_0_#1a1a1a] transition-all duration-300 hover:-translate-y-1 rounded-3xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-[#4ECDC4] flex items-center justify-center border-3 border-[#1a1a1a] rounded-2xl group-hover:rotate-12 transition-transform">
                    <Activity className="w-8 h-8 text-white font-black" strokeWidth={3} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#888] uppercase tracking-widest">Top Mood</p>
                    <p
                      className="text-3xl font-black truncate max-w-[7rem]"
                      style={{ color: dominantBehavior?.color ?? TEAL }}
                    >
                      {dominantBehavior ? `${dominantShare}%` : '--'}
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
                className="snap-center shrink-0 w-[82%] sm:w-[58%] md:w-auto cursor-pointer group bg-white border-4 border-[#1a1a1a] p-8 hover:shadow-[8px_8px_0_0_#1a1a1a] transition-all duration-300 hover:-translate-y-1 rounded-3xl"
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
                    <div
                      className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-3 border-[#1a1a1a] rounded-xl"
                      style={{ backgroundColor: PINK }}
                    >
                      <Heart className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
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
          <div className="mt-16 pb-4">
            <div className="border-l-4 border-[#1a1a1a] pl-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-wider">RECENT ACTIVITY</h2>
              <p className="text-sm text-[#555] mt-2 font-bold">Today's logged events at a glance</p>
            </div>

            {activityItems.length === 0 ? (
              <div className="bg-white border-4 border-[#1a1a1a] rounded-3xl p-8 shadow-[4px_4px_0_0_#1a1a1a] flex flex-col items-center justify-center gap-3 text-center">
                <div
                  className="w-14 h-14 flex items-center justify-center border-4 border-[#1a1a1a] rounded-2xl"
                  style={{ backgroundColor: ORANGE }}
                >
                  <Activity className="w-7 h-7 text-white" strokeWidth={3} />
                </div>
                <p className="text-lg font-black uppercase tracking-wide">Nothing logged yet</p>
                <p className="text-sm font-bold text-[#888]">
                  Use Quick Log above to record meals, water, and behaviors.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activityItems.map((item) => {
                  const { Icon } = item;
                  return (
                    <div
                      key={item.key}
                      className="bg-white border-4 border-[#1a1a1a] rounded-2xl px-5 py-4 shadow-[3px_3px_0_0_#1a1a1a] flex items-center gap-4"
                    >
                      <span
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-3 border-[#1a1a1a] rounded-xl"
                        style={{ backgroundColor: item.color }}
                      >
                        <Icon className="w-5 h-5 text-white" strokeWidth={3} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm uppercase tracking-wide truncate">{item.title}</p>
                        <p className="text-xs font-bold text-[#888] truncate">{item.subtitle}</p>
                      </div>
                      {item.badge && (
                        <span
                          className="flex-shrink-0 px-3 py-1 border-2 border-[#1a1a1a] rounded-lg text-[11px] font-black uppercase tracking-wide"
                          style={{ backgroundColor: item.badgeBg, color: item.badgeColor }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Health Insights Section */}
          {diet.activeProfile?.catId && (
            <div className="mt-16">
              <div className="border-l-4 border-[#1a1a1a] pl-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-black tracking-wider flex items-center gap-3">
                  <Stethoscope className="w-7 h-7" strokeWidth={3} /> HEALTH INSIGHTS
                </h2>
                <p className="text-sm text-[#555] mt-2 font-bold">AI-detected patterns across behavior, diet, and reproductive events</p>
              </div>
              <HealthInsightsWidget catId={diet.activeProfile.catId} />
            </div>
          )}

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
