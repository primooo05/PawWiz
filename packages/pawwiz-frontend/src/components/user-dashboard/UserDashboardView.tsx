import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfilePanel } from '../../hooks/useProfilePanel';
import { usePregnancyTracker } from '../../hooks/usePregnancyTracker';
import { useDietRecommender } from '../../hooks/useDietRecommender';
import { useBehaviorDecoder } from '../../hooks/useBehaviorDecoder';
import BottomNav from '../BottomNav';
import BehaviorInsightsWidget from './BehaviorInsightsWidget';
import { CircleWrapper } from '../CircleWrapper';

export default function UserDashboardView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfilePanel();
  const pregnancy = usePregnancyTracker();
  const diet = useDietRecommender();
  const behavior = useBehaviorDecoder('');

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

  const handleNavigation = (item: string) => {
    if (item === 'calendar') {
      navigate('/pregnancy-tracker');
    } else if (item === 'dashboard') {
      navigate('/dashboard');
    } else if (item === 'diet-reco') {
      navigate('/diet-recommender');
    } else if (item === 'behavior') {
      navigate('/behavior');
    } else if (item === 'settings') {
      navigate('/settings');
    } else if (item === 'plant') {
      navigate('/');
    }
  };
  // Count logged meals that are completed
  const completedMealsCount = Object.values(diet.loggedMeals).filter(
    (meal) => meal.status === 'logged'
  ).length;
  const totalMealsCount = Object.keys(diet.loggedMeals).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pb-24 relative overflow-hidden">
      <CircleWrapper isTransitioning={isTransitioning} isZIndexHigh={isZIndexHigh} />
      <div className={`transition-opacity duration-300 ${
        isTransitioning
          ? 'invisible opacity-0'
          : isZIndexHigh
            ? 'opacity-0'
            : 'opacity-100'
      }`}>
        {/* Top Banner with Profile Info */}
      <div className="bg-[#15AFB4] border-b-4 border-slate-900 px-6 py-8 shadow-[0_4px_0_0_#0f172a]">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#FFB870] border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] flex items-center justify-center text-3xl font-black">
            🐱
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wide">
              {profile?.catName || 'My Cat'}
            </h1>
            <p className="text-sm font-bold text-teal-900/80">
              {profile?.catBreed || 'Unknown Breed'} • {profile?.catLifeStage || 'Unknown Stage'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Widgets Area */}
      <div className="max-w-md mx-auto px-4 pt-6 flex flex-col gap-5">
        {/* Profile Details Card */}
        <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0_0_#0f172a]">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            Furparent Info
          </h2>
          <div className="flex flex-col gap-2 font-semibold text-sm">
            <div>
              <span className="text-slate-500">Parent: </span>
              <span className="text-slate-900">{profile?.displayName || 'User'}</span>
            </div>
            {profile?.catMarking && (
              <div>
                <span className="text-slate-500">Markings: </span>
                <span className="text-slate-950 font-bold">{profile.catMarking}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500">Sex: </span>
              <span className="text-slate-950 font-bold uppercase tracking-wider">
                {profile?.catSex || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Pregnancy Tracker Widget */}
        {pregnancy.isTracking ? (
          <div className="bg-[#FFFDF0] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0_0_#0f172a] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest">
                  Pregnancy Monitoring
                </h2>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  Day {pregnancy.currentDay} / 65
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-[#FFB870] border border-slate-900 px-3 py-1 rounded-full text-xs font-black text-slate-900 uppercase tracking-wider">
                  Week {pregnancy.currentWeek}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 h-3.5 rounded-full border-2 border-slate-900 overflow-hidden relative">
              <div
                className="bg-[#2ec4b6] h-full rounded-full transition-all duration-300 border-r-2 border-slate-900"
                style={{ width: `${pregnancy.progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Mating: {pregnancy.matingDate}</span>
              <span className="text-slate-900 font-extrabold">
                {pregnancy.daysRemaining} days left!
              </span>
            </div>
            <button
              onClick={() => navigate('/pregnancy-tracker')}
              className="w-full bg-[#FF6B6B] hover:bg-[#ff8585] text-white font-black py-3 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer text-sm tracking-wider uppercase min-h-[44px]"
            >
              Open Pregnancy Tracker
            </button>
          </div>
        ) : (
          <div className="bg-[#FFFDF0] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0_0_#0f172a] flex flex-col gap-3">
            <h2 className="text-xs font-black text-amber-600 uppercase tracking-widest">
              Pregnancy Monitoring
            </h2>
            <p className="text-sm font-bold text-slate-500">
              Track mating cycle, symptoms, daily temperature, and baby milestones.
            </p>
            <button
              onClick={() => navigate('/pregnancy-tracker')}
              className="w-full bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-black py-3 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer text-sm tracking-wider uppercase min-h-[44px]"
            >
              Start Pregnancy Tracker
            </button>
          </div>
        )}

        {/* Diet Tracker Widget */}
        <div className="bg-[#EBF7F5] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0_0_#0f172a] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xs font-black text-teal-700 uppercase tracking-widest">
                Daily Nutrition Log
              </h2>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {completedMealsCount} / {totalMealsCount || 3} Meals
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500">Water Intake:</span>
              <p className="text-lg font-black text-teal-800">{diet.waterIntake} ml</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(diet.loggedMeals).map(([key, meal]) => (
              <div
                key={key}
                className={`border border-slate-900/20 rounded-xl p-2.5 text-center transition-all ${
                  meal.status === 'logged'
                    ? 'bg-[#2ec4b6]/20 border-[#2ec4b6] text-teal-950 font-bold'
                    : meal.status === 'skipped'
                    ? 'bg-slate-100 border-slate-300 text-slate-400 line-through'
                    : 'bg-white text-slate-500'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-wider">{key}</div>
                <div className="text-xs font-extrabold mt-1 truncate capitalize">
                  {meal.status === 'logged' ? 'Done' : meal.status === 'skipped' ? 'Skipped' : 'Pending'}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/diet-recommender')}
            className="w-full bg-[#2ec4b6] hover:bg-[#3bd4c5] text-white font-black py-3 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer text-sm tracking-wider uppercase min-h-[44px]"
          >
            Manage Diet & Water
          </button>
        </div>

        {/* Behavior Insights Widget */}
        <BehaviorInsightsWidget onViewMore={() => navigate('/behavior-insights')} />

        {/* Behavior Explainer Widget */}
        <div className="bg-[#FFF5F5] border-2 border-slate-900 rounded-2xl p-5 shadow-[4px_4px_0_0_#0f172a] flex flex-col gap-3">
          <h2 className="text-xs font-black text-red-600 uppercase tracking-widest">
            Feline Behavior Explainer
          </h2>
          {behavior.decodeResult ? (
            <div className="flex flex-col gap-2 bg-white rounded-xl p-3 border border-red-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-red-950 uppercase tracking-wider">
                  Decoded State
                </span>
                <span className="text-[10px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {Math.round(behavior.decodeResult.confidenceScore * 100)}% Match
                </span>
              </div>
              <p className="text-sm font-black text-slate-800">
                {behavior.decodeResult.catState}
              </p>
              <p className="text-xs font-bold text-slate-500 leading-normal">
                "{behavior.decodeResult.decodedMeaning}"
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-500">
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
            className="w-full bg-[#FFB870] hover:bg-[#ffc587] text-slate-900 font-black py-3 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer text-sm tracking-wider uppercase min-h-[44px]"
          >
            Analyze Behavior
          </button>
        </div>
      </div>

      </div>
      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
        <BottomNav activeItem="dashboard" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
      </div>
    </div>
  );
}
