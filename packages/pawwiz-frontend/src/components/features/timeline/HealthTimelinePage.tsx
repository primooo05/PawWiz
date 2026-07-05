import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { FileDown, RotateCcw, Activity, Utensils, Heart, Flame } from 'lucide-react';
import type { EventSource } from '../../../../../pawwiz-backend/src/types/shared.js';
import { useHealthTimeline } from '../../../hooks/features/useHealthTimeline.js';
import { useTimelineInsights } from '../../../hooks/features/useTimelineInsights.js';
import { useHealthExport } from '../../../hooks/features/useHealthExport.js';
import { SkeletonLine } from '../../ui/skeletons/SkeletonLoader.js';
import TimelineCard from './TimelineCard.js';
import InsightsPanel from './InsightsPanel.js';
import ExportModal from './ExportModal.js';
import GreetingHeader from '../../layout/GreetingHeader.js';
import BottomNav from '../../layout/BottomNav.js';
import '../../../styles/datepicker-custom.css';

// ─── Source filter config ─────────────────────────────────────────────────────

const ALL_SOURCES: EventSource[] = ['behavior', 'diet', 'pregnancy', 'heat'];

const SOURCE_LABELS: Record<EventSource, { label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  behavior: { label: 'Behavior', Icon: Activity },
  diet:     { label: 'Diet',     Icon: Utensils },
  pregnancy:{ label: 'Pregnancy',Icon: Heart },
  heat:     { label: 'Heat',     Icon: Flame },
};

// ─── Skeleton cards for loading state ────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-5 shadow-[4px_4px_0_0_#1a1a1a] flex gap-4 items-start">
    <div className="shrink-0 w-12 h-12 bg-slate-200 animate-pulse border-2 border-slate-300 rounded-xl" />
    <div className="flex-1 min-w-0 space-y-2">
      <SkeletonLine width="w-1/3" height="h-3" />
      <SkeletonLine width="w-2/3" height="h-4" />
      <SkeletonLine width="w-full" height="h-3" />
      <SkeletonLine width="w-1/4" height="h-2" />
    </div>
  </div>
);

// ─── HealthTimelinePage ───────────────────────────────────────────────────────

/**
 * Route page at /health-timeline/:catId.
 *
 * Composes useHealthTimeline, useTimelineInsights, and useHealthExport.
 * Redirects to /dashboard on 403.
 *
 * Validates: Requirements 6.1 – 6.10, 7.1, 7.7, 7.8
 */
const HealthTimelinePage: React.FC = () => {
  const { catId } = useParams<{ catId: string }>();
  const navigate = useNavigate();

  const timeline = useHealthTimeline(catId ?? '');
  const insightsHook = useTimelineInsights(catId ?? '');
  const exportHook = useHealthExport(catId ?? '');

  // Redirect to dashboard on 403 (Req 6.9)
  useEffect(() => {
    if (timeline.error === 'Access denied' || insightsHook.error === 'Access denied') {
      navigate('/dashboard', { replace: true });
    }
  }, [timeline.error, insightsHook.error, navigate]);

  if (!catId) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // ── Filter helpers ──────────────────────────────────────────────────────────

  function toggleSource(source: EventSource) {
    const next = timeline.sources.includes(source)
      ? timeline.sources.filter((s) => s !== source)
      : [...timeline.sources, source];
    if (next.length > 0) timeline.setSources(next);
  }

  function handleStartDateChange(date: Date | null) {
    timeline.setStartDate(date ? date.toISOString() : null);
  }

  function handleEndDateChange(date: Date | null) {
    timeline.setEndDate(date ? date.toISOString() : null);
  }

  const startDateObj = timeline.startDate ? new Date(timeline.startDate) : null;
  const endDateObj = timeline.endDate ? new Date(timeline.endDate) : null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-[#F5F5F0] text-[#1a1a1a] font-sans pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">

        {/* ── Greeting header (matches Dashboard style) ─────────────────── */}
        <GreetingHeader
          title="Health Timeline"
          subtitle="Full history across all health features"
          className="mb-8"
        />

        {/* ── Export PDF button row ─────────────────────────────────────── */}
        <div className="flex justify-end mb-6">
          <button
            onClick={exportHook.openModal}
            className="flex items-center gap-2 px-4 py-3 bg-[#30c290] text-white font-black text-xs uppercase tracking-widest border-2 border-[#1a1a1a] shadow-[3px_3px_0_0_#1a1a1a] hover:bg-white hover:text-[#30c290] active:shadow-none active:translate-y-[2px] transition-all"
            aria-label="Export health summary PDF"
          >
            <FileDown size={14} aria-hidden="true" />
            Export PDF
          </button>
        </div>

        {/* ── Source error banners (partial failures) ───────────────────── */}
        {timeline.sourceErrors.length > 0 && (
          <div className="mb-6 space-y-2" role="alert" aria-live="polite">
            {timeline.sourceErrors.map(({ source, message }) => (
              <div
                key={source}
                className="flex items-center gap-3 bg-amber-50 border-2 border-amber-400 px-4 py-3 rounded-xl text-xs font-bold text-amber-800"
              >
                <span aria-hidden="true">⚠️</span>
                <span>
                  <span className="font-black uppercase">{source}</span>: {message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ───────────────────────────────────────────────────── */}
        <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-5 shadow-[4px_4px_0_0_#1a1a1a] mb-8 space-y-5">
          {/* Date range pickers */}
          <div>
            <p className="text-[10px] font-black text-[#888] uppercase tracking-widest mb-3">
              Date Range
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="timeline-start-date"
                  className="block text-xs font-black text-[#555] uppercase tracking-wider mb-1"
                >
                  From
                </label>
                <DatePicker
                  id="timeline-start-date"
                  selected={startDateObj}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={startDateObj ?? undefined}
                  endDate={endDateObj ?? undefined}
                  maxDate={endDateObj ?? new Date()}
                  dateFormat="MMM d, yyyy"
                  placeholderText="30 days ago"
                  calendarClassName="custom-calendar"
                  isClearable
                  customInput={
                    <input
                      className="w-full px-3 py-2 bg-[#F5F5F0] border-2 border-[#1a1a1a] rounded-xl text-xs font-black text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#30c290] cursor-pointer"
                      aria-label="Timeline start date"
                      readOnly
                    />
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="timeline-end-date"
                  className="block text-xs font-black text-[#555] uppercase tracking-wider mb-1"
                >
                  To
                </label>
                <DatePicker
                  id="timeline-end-date"
                  selected={endDateObj}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={startDateObj ?? undefined}
                  endDate={endDateObj ?? undefined}
                  minDate={startDateObj ?? undefined}
                  maxDate={new Date()}
                  dateFormat="MMM d, yyyy"
                  placeholderText="Today"
                  calendarClassName="custom-calendar"
                  isClearable
                  customInput={
                    <input
                      className="w-full px-3 py-2 bg-[#F5F5F0] border-2 border-[#1a1a1a] rounded-xl text-xs font-black text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#30c290] cursor-pointer"
                      aria-label="Timeline end date"
                      readOnly
                    />
                  }
                />
              </div>
            </div>
          </div>

          {/* Source filter checkboxes */}
          <div>
            <p className="text-[10px] font-black text-[#888] uppercase tracking-widest mb-3">
              Sources
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_SOURCES.map((source) => {
                const selected = timeline.sources.includes(source);
                const { label, Icon } = SOURCE_LABELS[source];
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    aria-pressed={selected}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black border-2 border-[#1a1a1a] rounded-xl transition-colors ${
                      selected
                        ? 'bg-[#2ec4b6] text-white border-[#2ec4b6]'
                        : 'bg-white text-[#1a1a1a] hover:bg-[#e8f9f8]'
                    }`}
                  >
                    <Icon className="w-3 h-3" strokeWidth={3} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Insights panel ────────────────────────────────────────────── */}
        <div className="mb-8">
          <InsightsPanel
            insights={insightsHook.insights}
            isLoading={insightsHook.isLoading}
            onRefresh={() => void insightsHook.refresh()}
          />
        </div>

        {/* ── Timeline events ───────────────────────────────────────────── */}
        <div>
          <div className="border-l-4 border-[#1a1a1a] pl-4 mb-5">
            <h2 className="text-lg font-black tracking-wider uppercase">Events</h2>
          </div>

          {/* General error (non-403 cases) */}
          {timeline.error && timeline.error !== 'Access denied' && (
            <div
              role="alert"
              className="bg-red-50 border-4 border-red-400 rounded-2xl p-6 mb-6 flex flex-col items-center gap-3 text-center"
            >
              <p className="text-sm font-black text-red-800">{timeline.error}</p>
              <button
                onClick={() => timeline.refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-400 rounded-xl text-xs font-black text-red-800 hover:bg-red-50 transition-colors"
              >
                <RotateCcw size={12} aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {timeline.isLoading && timeline.events.length === 0 && (
            <div className="space-y-4" aria-busy="true" aria-label="Loading timeline events">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!timeline.isLoading && !timeline.error && timeline.events.length === 0 && (
            <div className="bg-white border-4 border-[#1a1a1a] rounded-2xl p-10 shadow-[4px_4px_0_0_#1a1a1a] flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 flex items-center justify-center border-4 border-[#1a1a1a] rounded-2xl bg-[#4ECDC4]">
                <Activity className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
              <p className="text-lg font-black uppercase tracking-wide">No events found</p>
              <p className="text-sm font-bold text-[#888] max-w-xs">
                No health events match the current filters. Try adjusting the date range or
                start logging behavior, diet, or reproductive events.
              </p>
            </div>
          )}

          {/* Event list */}
          {timeline.events.length > 0 && (
            <div className="space-y-4" role="list" aria-label="Health timeline events">
              {timeline.events.map((event) => (
                <TimelineCard key={`${event.source}-${event.id}`} event={event} />
              ))}
            </div>
          )}

          {/* Load more */}
          {timeline.pagination.hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => void timeline.loadMore()}
                disabled={timeline.isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-white border-4 border-[#1a1a1a] rounded-2xl font-black text-sm uppercase tracking-widest shadow-[4px_4px_0_0_#1a1a1a] hover:bg-[#f0f0eb] active:shadow-none active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {timeline.isLoading ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" aria-hidden="true" />
                    Loading…
                  </>
                ) : (
                  'Load more'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Export modal ────────────────────────────────────────────────── */}
      <ExportModal
        isOpen={exportHook.isOpen}
        startDate={exportHook.startDate}
        endDate={exportHook.endDate}
        notes={exportHook.notes}
        isExporting={exportHook.isExporting}
        error={exportHook.error}
        setStartDate={exportHook.setStartDate}
        setEndDate={exportHook.setEndDate}
        setNotes={exportHook.setNotes}
        exportPdf={exportHook.exportPdf}
        closeModal={exportHook.closeModal}
      />

      {/* ── Bottom navigation ───────────────────────────────────────────── */}
      <div className="fixed bottom-5 left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 flex justify-center px-4 md:px-0">
        <BottomNav
          activeItem="dashboard"
          onItemClick={(item: string) => {
            if (item === 'dashboard') navigate('/dashboard');
            else if (item === 'diet-reco') navigate('/diet-recommender');
            else if (item === 'behavior') navigate('/behavior-chat');
            else if (item === 'calendar') navigate('/pregnancy-tracker');
            else if (item === 'settings') navigate('/settings');
          }}
          className="w-full max-w-2xl md:w-auto md:scale-110"
        />
      </div>
    </div>
  );
};

export default HealthTimelinePage;
