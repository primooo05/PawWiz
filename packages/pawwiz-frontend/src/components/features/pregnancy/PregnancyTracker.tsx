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
import TodayLogStatus from './flo/TodayLogStatus';

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
    if (femaleRoster.length === 0 && profile?.catSex === 'female') {
        femaleRoster.push({ id: 'primary', name: profile.catName || 'Your Cat', photoUrl: null });
    }
    const hasFemaleCat = femaleRoster.length > 0;

    // selectedCatId tracks which female cat we are tracking right now.
    // It is NOT pre-seeded from the active diet profile — the user always picks
    // from the female roster explicitly (or auto-lands if there's only one female
    // cat and the active profile is also female).
    const activeProfileIsFemale = (() => {
        const activeProfile = diet.profiles.find((p) => p.id === diet.activeProfileId);
        return activeProfile ? activeProfile.gender === 'female' : profile?.catSex === 'female';
    })();

    const [selectedCatId, setSelectedCatId] = React.useState<string | null>(null);

    // Auto-select only when:
    //  - Exactly one female cat exists AND
    //  - The currently active diet profile is that same female cat
    // This avoids silently selecting a random female cat when the user is
    // currently on a male profile — in that case we always show the selector.
    React.useEffect(() => {
        if (femaleRoster.length === 1 && activeProfileIsFemale && !selectedCatId) {
            setSelectedCatId(femaleRoster[0].id);
        }
    }, [femaleRoster.length, activeProfileIsFemale, selectedCatId]);

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
    // local tracker state so the user goes straight to the dashboard instead of
    // seeing the setup form again.
    React.useEffect(() => {
        if (pregnancy.session && !isTracking) {
            const serverMatingDate = pregnancy.session.matingDate.split('T')[0];
            setMatingDate(serverMatingDate);
            setIsTracking(true);
        }
    }, [pregnancy.session, isTracking, setMatingDate, setIsTracking]);

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    // ── Setup form submit ────────────────────────────────────────────────────
    const startTrackingWithLoading = (e: React.FormEvent) => {
        e.preventDefault();
        if (matingDate) {
            setIsLoading(true);
            if (catIdForApi) {
                void pregnancy.startSession(matingDate);
            }
        }
    };

    // ── Backend log sync ─────────────────────────────────────────────────────
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

    // ── Loading guard ────────────────────────────────────────────────────────
    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ── No female cats at all → block ────────────────────────────────────────
    if (!hasFemaleCat) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
                <FemaleOnlyModal onClose={() => navigate('/dashboard')} />
                <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                    <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
                </div>
            </div>
        );
    }

    // ── No cat selected yet → show female-cat picker ─────────────────────────
    // This includes the case where the active diet profile is a male cat:
    // we always ask the user to explicitly pick which female cat to track.
    if (!selectedCatId) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
                <main className="max-w-[1440px] w-full px-4 sm:px-6 md:px-8 py-12 mx-auto flex-grow">
                    <FemaleCatSelector cats={femaleRoster} onSelect={(id) => setSelectedCatId(id)} />
                </main>
                <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                    <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
                </div>
            </div>
        );
    }

    // ── Backend session loading (cat selected, waiting for API) ──────────────
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

                        <div className="flex justify-end mb-4">
                            <TodayLogStatus
                                loggedToday={pregnancy.loggedToday}
                                onClick={() => openLogForDate(todayStr)}
                            />
                        </div>

                        <DashboardView
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
                <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
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

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    // When the user submits the setup form, start both the local tracker and
    // (if a real catId is available) a server-side pregnancy session.
    const startTrackingWithLoading = (e: React.FormEvent) => {
        e.preventDefault();
        if (matingDate) {
            setIsLoading(true);
            // Start the backend session (fire-and-forget; the local UI drives UX).
            if (catIdForApi) {
                void pregnancy.startSession(matingDate);
            }
        }
    };

    // Sync today's log to the backend whenever it changes locally.
    const saveLogForDateWithSync = React.useCallback(
        (dateStr: string, log: typeof todayLog) => {
            saveLogForDate(dateStr, log);

            // If we have an active backend session, persist the log server-side.
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
        if (item === 'calendar') {
            navigate('/pregnancy-tracker');
        } else if (item === 'dashboard') {
            navigate('/dashboard');
        } else if (item === 'diet-reco') {
            navigate('/diet-recommender');
        } else if (item === 'behavior') {
            navigate('/behavior-chat');
        } else if (item === 'settings') {
            navigate('/settings');
        } else if (item === 'plant') {
            navigate('/');
        }
    };

    // Wait until profile data has loaded before deciding gender eligibility,
    // so male owners don't briefly see the tracker (and vice versa).
    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Male-only owners: block the feature with a modal.
    if (!hasFemaleCat) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
                <FemaleOnlyModal onClose={() => navigate('/dashboard')} />
                <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                    <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
                </div>
            </div>
        );
    }

    // Female owners with more than one female cat: pick which cat is pregnant.
    if (!selectedCatId) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
                <main className="max-w-[1440px] w-full px-4 sm:px-6 md:px-8 py-12 mx-auto flex-grow">
                    <FemaleCatSelector cats={femaleRoster} onSelect={(id) => setSelectedCatId(id)} />
                </main>
                <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
                    <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 pb-20 flex flex-col">
            {/* Main Content Area */}
            <main className={!isTracking ? "max-w-[1440px] w-full px-8 py-12 mx-auto" : "w-full px-4 sm:px-6 md:px-8 py-6 flex-grow flex flex-col justify-stretch"}>
                {!isTracking ? (
                    <SetupView
                        matingDate={matingDate}
                        setMatingDate={setMatingDate}
                        onSubmit={startTrackingWithLoading}
                    />
                ) : (
                    <>
                        {/* Flo-style insight cards (from backend) — shown above the dashboard */}
                        {pregnancy.insights.length > 0 && (
                            <InsightCardFeed
                                insights={pregnancy.insights}
                                onMarkRead={pregnancy.markInsightRead}
                                className="mb-6 max-w-lg mx-auto"
                            />
                        )}

                        {/* "Logged today" status pill — links to existing bottom sheet */}
                        <div className="flex justify-end mb-4">
                            <TodayLogStatus
                                loggedToday={pregnancy.loggedToday}
                                onClick={() => openLogForDate(todayStr)}
                            />
                        </div>

                        <DashboardView
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
                <BottomNav activeItem="calendar" onItemClick={handleNavigation} className="w-full max-w-2xl md:w-auto md:scale-110" />
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
