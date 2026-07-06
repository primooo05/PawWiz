import React from 'react';
import BottomNav from '../../layout/BottomNav';
import LoadingScreen from '../../layout/LoadingScreen';
import SetupView from './SetupView';
import DashboardView from './DashboardView';
import FemaleOnlyModal from './FemaleOnlyModal';
import FemaleCatSelector from './FemaleCatSelector';

import { usePregnancyTracker } from '../../../hooks/trackers/usePregnancyTracker';
import { useDietRecommender } from '../../../hooks/features/useDietRecommender';
import { useProfilePanel } from '../../../hooks/features/useProfilePanel';
import { useCatPregnancy } from '../../../hooks/features/useCatPregnancy';
import { useNavigate } from 'react-router-dom';
import InsightCardFeed from './flo/InsightCardFeed';

const CatPregnancyTracker: React.FC = () => {
    const navigate = useNavigate();
    const diet = useDietRecommender();
    const { profile, isLoading: isProfileLoading } = useProfilePanel();

    // ── Female cat roster ────────────────────────────────────────────────────
    // Gather ALL female cats regardless of which diet profile is currently active.
    // The pregnancy tracker is cat-specific, not active-profile-specific — a user
    // on a male profile should still be able to open the tracker and pick a female
    // cat from this roster.
    const femaleRoster = diet.profiles
        .filter((p) => p.gender === 'female')
        .map((p) => ({ id: p.catId ?? p.id, name: p.name, photoUrl: p.photoUrl ?? null }));

    // Fallback: primary profile cat is female but no diet profile exists yet.
    // catSex from the backend may be 'Female' (capitalised) or 'female' — normalise.
    if (femaleRoster.length === 0 && profile?.catSex?.toLowerCase() === 'female') {
        femaleRoster.push({ id: 'primary', name: profile.catName || 'Your Cat', photoUrl: null });
    }
    const hasFemaleCat = femaleRoster.length > 0;

    // Auto-select only when exactly one female cat exists AND the active diet
    // profile is that same female cat. When the active profile is a male cat,
    // selectedCatId stays null so the user explicitly picks from the selector.
    const activeProfileIsFemale = (() => {
        const activeProfile = diet.profiles.find((p) => p.id === diet.activeProfileId);
        return activeProfile ? activeProfile.gender === 'female' : profile?.catSex?.toLowerCase() === 'female';
    })();

    const [selectedCatId, setSelectedCatId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (femaleRoster.length === 1 && activeProfileIsFemale && !selectedCatId) {
            setSelectedCatId(femaleRoster[0].id);
        }
    }, [femaleRoster.length, activeProfileIsFemale, selectedCatId]);

    const selectedCat = femaleRoster.find(c => c.id === selectedCatId);
    const selectedCatName = selectedCat ? selectedCat.name : (profile?.catName || 'Your Cat');

    // ── Backend session ──────────────────────────────────────────────────────
    const catIdForApi = selectedCatId && selectedCatId !== 'primary' ? selectedCatId : null;
    const pregnancy = useCatPregnancy(catIdForApi);

    const {
        matingDate,
        setMatingDate,
        isTracking,
        setIsTracking,
        currentDay,
        daysRemaining,
        currentWeek,
        dueDateString,
        progressPercentage,
        currentYear,
        currentMonthIndex,
        currentMonthLabel,
        calendarGrid,
        changeCalendarMonth,
        getElapsedDayLabel,
        getWeekMilestone,
        getLocalDateStr,
        getDayBadgeClassName,
        logs,
        selectedDateStr,
        isBottomSheetOpen,
        openLogForDate,
        closeBottomSheet,
        saveLogForDate,
        isDateLoggable,
        todayStr,
        todayLog,
        todayLoggable,
        elapsedDayForSelected,
        hasVetWarningForSelected,
        hasNauseaInEarlyWeeksForSelected,
    } = usePregnancyTracker();

    // ── Restore session from backend ─────────────────────────────────────────
    // When the backend already has an active session for this cat, hydrate the
    // local tracker so the user goes straight to the dashboard on every visit.
    React.useEffect(() => {
        if (pregnancy.session && !isTracking) {
            const serverMatingDate = pregnancy.session.matingDate.split('T')[0];
            setMatingDate(serverMatingDate);
            setIsTracking(true);
        }
    }, [pregnancy.session, isTracking, setMatingDate, setIsTracking]);

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const startTrackingWithLoading = (e: React.FormEvent) => {
        e.preventDefault();
        if (matingDate) {
            setIsLoading(true);
            if (catIdForApi) {
                void pregnancy.startSession(matingDate);
            }
        }
    };

    const saveLogForDateWithSync = React.useCallback(
        (dateStr: string, log: typeof todayLog) => {
            saveLogForDate(dateStr, log);
            if (pregnancy.hasActiveSession && dateStr === todayStr) {
                const symptoms = (log.symptoms || []).map((s: string) =>
                    s.toLowerCase().replace(/\s+/g, '_'),
                );
                const moods = (log.moods || []).map((m: string) =>
                    m.toLowerCase().replace(/\s+/g, '_'),
                );
                void pregnancy.saveDailyLog({
                    symptoms: symptoms as any,
                    moodBehavior: moods as any,
                    nestingObserved: symptoms.includes('nesting'),
                    weight: log.weight,
                    temp: log.temperature,
                });
            }
        },
        [saveLogForDate, pregnancy, todayStr],
    );

    const handleNavigation = (item: string) => {
        if (item === 'calendar') navigate('/pregnancy-tracker');
        else if (item === 'dashboard') navigate('/dashboard');
        else if (item === 'diet-reco') navigate('/diet-recommender');
        else if (item === 'behavior') navigate('/behavior-chat');
        else if (item === 'settings') navigate('/settings');
        else if (item === 'plant') navigate('/');
    };

    // ── Guards ───────────────────────────────────────────────────────────────
    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!hasFemaleCat) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
                <FemaleOnlyModal onClose={() => navigate('/dashboard')} />
                <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                    <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" hasUntracked={diet.profiles.some(p => !p.isTracking)} />
                </div>
            </div>
        );
    }

    // Active profile is male, or multiple female cats → always show picker.
    if (!selectedCatId) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
                <main className="max-w-[1440px] w-full px-4 sm:px-6 md:px-8 py-12 mx-auto flex-grow">
                    <FemaleCatSelector cats={femaleRoster} onSelect={(id) => setSelectedCatId(id)} />
                </main>
                <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                    <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" hasUntracked={diet.profiles.some(p => !p.isTracking)} />
                </div>
            </div>
        );
    }

    // Waiting for the backend session check after cat selection.
    if (pregnancy.isLoading && !pregnancy.session) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ── Main view ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
            <main className={!isTracking ? "max-w-[1440px] w-full px-8 py-12 mx-auto" : "w-full px-4 sm:px-6 md:px-8 py-6 flex-grow flex flex-col justify-stretch"}>
                {!isTracking ? (
                    <SetupView
                        matingDate={matingDate}
                        setMatingDate={setMatingDate}
                        onSubmit={startTrackingWithLoading}
                    />
                ) : (
                    <>
                        {pregnancy.insights.length > 0 && (
                            <InsightCardFeed
                                insights={pregnancy.insights}
                                onMarkRead={pregnancy.markInsightRead}
                                className="mb-6 max-w-lg mx-auto"
                            />
                        )}



                        <DashboardView
                            catName={selectedCatName}
                            setIsTracking={setIsTracking}
                            currentDay={currentDay}
                            daysRemaining={daysRemaining}
                            currentWeek={currentWeek}
                            dueDateString={dueDateString}
                            progressPercentage={progressPercentage}
                            currentYear={currentYear}
                            currentMonthIndex={currentMonthIndex}
                            currentMonthLabel={currentMonthLabel}
                            calendarGrid={calendarGrid}
                            changeCalendarMonth={changeCalendarMonth}
                            getElapsedDayLabel={getElapsedDayLabel}
                            getWeekMilestone={getWeekMilestone}
                            getLocalDateStr={getLocalDateStr}
                            getDayBadgeClassName={getDayBadgeClassName}
                            logs={logs}
                            selectedDateStr={selectedDateStr}
                            isBottomSheetOpen={isBottomSheetOpen}
                            openLogForDate={openLogForDate}
                            closeBottomSheet={closeBottomSheet}
                            saveLogForDate={saveLogForDateWithSync}
                            isDateLoggable={isDateLoggable}
                            todayStr={todayStr}
                            todayLog={todayLog}
                            todayLoggable={todayLoggable}
                            elapsedDayForSelected={elapsedDayForSelected}
                            hasVetWarningForSelected={hasVetWarningForSelected}
                            hasNauseaInEarlyWeeksForSelected={hasNauseaInEarlyWeeksForSelected}
                            loggedToday={pregnancy.loggedToday}
                        />
                    </>
                )}
            </main>

            <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" hasUntracked={diet.profiles.some(p => !p.isTracking)} />
            </div>

            {isLoading && (
                <LoadingScreen
                    durationMs={7000}
                    onComplete={() => {
                        setIsLoading(false);
                        setIsTracking(true);
                    }}
                />
            )}
        </div>
    );
};

export default CatPregnancyTracker;
