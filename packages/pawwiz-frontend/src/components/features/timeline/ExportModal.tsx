import { useRef } from 'react';
import DatePicker from 'react-datepicker';
import { motion } from 'motion/react';
import { FileDown, Loader2, AlertTriangle, Clock, Calendar } from 'lucide-react';
import type { UseHealthExportReturn } from '../../../hooks/features/useHealthExport.js';
import '../../../styles/datepicker-custom.css';

const NOTES_MAX = 500;

// Error codes we surface with specific UI copy
const ERROR_RATE_LIMIT = '429';
const ERROR_EMPTY_RANGE = '400';

function classifyError(error: string): 'rate-limit' | 'empty-range' | 'generic' {
  const lower = error.toLowerCase();
  if (lower.includes('too many') || lower.includes(ERROR_RATE_LIMIT)) return 'rate-limit';
  if (
    lower.includes('no events') ||
    lower.includes('no health') ||
    lower.includes(ERROR_EMPTY_RANGE) ||
    lower.includes('no records') ||
    lower.includes('empty')
  )
    return 'empty-range';
  return 'generic';
}

interface ErrorBannerProps {
  error: string;
}

function ErrorBanner({ error }: ErrorBannerProps) {
  const kind = classifyError(error);

  if (kind === 'rate-limit') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex items-start gap-3 bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 shadow-[2px_2px_0_0_rgba(15,23,42,0.15)]"
      >
        <Clock
          className="shrink-0 mt-0.5 text-amber-600"
          size={16}
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-black text-amber-800 uppercase tracking-wider mb-0.5">
            Rate limit reached
          </p>
          <p className="text-xs font-semibold text-amber-700 leading-relaxed">
            You've exported too many reports recently. Please wait a moment before
            trying again.
          </p>
        </div>
      </div>
    );
  }

  if (kind === 'empty-range') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex items-start gap-3 bg-sky-50 border-2 border-sky-400 rounded-2xl p-4 shadow-[2px_2px_0_0_rgba(15,23,42,0.15)]"
      >
        <Calendar
          className="shrink-0 mt-0.5 text-sky-600"
          size={16}
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-black text-sky-800 uppercase tracking-wider mb-0.5">
            No events in range
          </p>
          <p className="text-xs font-semibold text-sky-700 leading-relaxed">
            There are no health events recorded for the selected date range. Try
            widening the date range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 bg-red-50 border-2 border-red-400 rounded-2xl p-4 shadow-[2px_2px_0_0_rgba(15,23,42,0.15)]"
    >
      <AlertTriangle
        className="shrink-0 mt-0.5 text-red-600"
        size={16}
        aria-hidden="true"
      />
      <div>
        <p className="text-xs font-black text-red-800 uppercase tracking-wider mb-0.5">
          Export failed
        </p>
        <p className="text-xs font-semibold text-red-700 leading-relaxed">{error}</p>
      </div>
    </div>
  );
}

export interface ExportModalProps
  extends Pick<
    UseHealthExportReturn,
    | 'isOpen'
    | 'startDate'
    | 'endDate'
    | 'notes'
    | 'isExporting'
    | 'error'
    | 'setStartDate'
    | 'setEndDate'
    | 'setNotes'
    | 'exportPdf'
    | 'closeModal'
  > {}

/**
 * ExportModal — health timeline PDF export dialog.
 *
 * Validates: Requirements 7.1, 7.7, 7.8
 */
export default function ExportModal({
  isOpen,
  startDate,
  endDate,
  notes,
  isExporting,
  error,
  setStartDate,
  setEndDate,
  setNotes,
  exportPdf,
  closeModal,
}: ExportModalProps) {
  const notesRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const startDateObj = startDate ? new Date(startDate) : null;
  const endDateObj = endDate ? new Date(endDate) : null;
  const notesLength = notes.length;
  const notesOverLimit = notesLength > NOTES_MAX;
  const charCountColour =
    notesOverLimit
      ? 'text-red-600'
      : notesLength >= NOTES_MAX * 0.9
      ? 'text-amber-600'
      : 'text-slate-400';

  function handleStartDateChange(date: Date | null) {
    setStartDate(date ? date.toISOString() : '');
  }

  function handleEndDateChange(date: Date | null) {
    setEndDate(date ? date.toISOString() : '');
  }

  function handleNotesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    // Hook already enforces 500-char slice; we still guard here defensively
    setNotes(e.target.value);
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] cursor-pointer"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4 z-[90] pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-white border-4 border-slate-900 rounded-[2.5rem] max-w-md w-full shadow-[8px_8px_0_0_rgba(15,23,42,1)] pointer-events-auto max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="px-8 pt-8 pb-4 border-b-2 border-slate-100 shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-[#40C48E] border-2 border-slate-900 rounded-xl p-2 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                <FileDown size={18} className="text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.22em] text-[#40C48E] uppercase">
                  Health Report
                </p>
                <h2
                  id="export-modal-title"
                  className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight"
                >
                  Export PDF
                </h2>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed mt-2">
              Choose a date range and add optional notes for your vet visit report.
            </p>
          </div>

          {/* ── Scrollable body ───────────────────────────────────────── */}
          <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">

            {/* Date range pickers */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Date Range
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Start date */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="export-start-date"
                    className="block text-xs font-black text-slate-700 uppercase tracking-wider"
                  >
                    From
                  </label>
                  <DatePicker
                    id="export-start-date"
                    selected={startDateObj}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={startDateObj ?? undefined}
                    endDate={endDateObj ?? undefined}
                    maxDate={endDateObj ?? new Date()}
                    dateFormat="MMM d, yyyy"
                    calendarClassName="custom-calendar"
                    disabled={isExporting}
                    customInput={
                      <input
                        className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#40C48E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        aria-label="Export start date"
                        readOnly
                      />
                    }
                  />
                </div>

                {/* End date */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="export-end-date"
                    className="block text-xs font-black text-slate-700 uppercase tracking-wider"
                  >
                    To
                  </label>
                  <DatePicker
                    id="export-end-date"
                    selected={endDateObj}
                    onChange={handleEndDateChange}
                    selectsEnd
                    startDate={startDateObj ?? undefined}
                    endDate={endDateObj ?? undefined}
                    minDate={startDateObj ?? undefined}
                    maxDate={new Date()}
                    dateFormat="MMM d, yyyy"
                    calendarClassName="custom-calendar"
                    disabled={isExporting}
                    customInput={
                      <input
                        className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#40C48E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        aria-label="Export end date"
                        readOnly
                      />
                    }
                  />
                </div>
              </div>
            </div>

            {/* Notes textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="export-notes"
                  className="text-xs font-black text-slate-700 uppercase tracking-wider"
                >
                  Owner Notes
                  <span className="ml-1 text-[10px] font-semibold text-slate-400 normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <span
                  className={`text-[11px] font-black tabular-nums ${charCountColour}`}
                  aria-live="polite"
                  aria-label={`${notesLength} of ${NOTES_MAX} characters used`}
                >
                  {notesLength}/{NOTES_MAX}
                </span>
              </div>
              <textarea
                id="export-notes"
                ref={notesRef}
                value={notes}
                onChange={handleNotesChange}
                disabled={isExporting}
                placeholder="Any notes for your vet — medications, concerns, recent changes…"
                rows={4}
                maxLength={NOTES_MAX}
                aria-describedby="export-notes-hint"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed ${
                  notesOverLimit
                    ? 'border-red-400 focus:ring-2 focus:ring-red-300'
                    : 'border-slate-900 focus:ring-2 focus:ring-[#40C48E]'
                }`}
              />
              <p
                id="export-notes-hint"
                className="text-[10px] font-semibold text-slate-400 leading-relaxed"
              >
                These notes will appear in the exported PDF alongside your cat's
                health events.
              </p>
            </div>

            {/* Error banner */}
            {error !== null && error.length > 0 && (
              <ErrorBanner error={error} />
            )}
          </div>

          {/* ── Footer actions ────────────────────────────────────────── */}
          <div className="px-8 pb-8 pt-4 border-t-2 border-slate-100 shrink-0 space-y-3">
            {/* Export PDF button */}
            <button
              type="button"
              onClick={() => void exportPdf()}
              disabled={isExporting || notesOverLimit}
              aria-busy={isExporting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#40C48E] border-2 border-slate-900 rounded-2xl font-black text-white text-sm uppercase tracking-widest hover:bg-[#34a87a] active:scale-[0.98] transition-all shadow-[4px_4px_0_0_rgba(15,23,42,1)] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  <span>Exporting…</span>
                </>
              ) : (
                <>
                  <FileDown size={16} aria-hidden="true" />
                  <span>Export PDF</span>
                </>
              )}
            </button>

            {/* Cancel button */}
            <button
              type="button"
              onClick={closeModal}
              disabled={isExporting}
              className="w-full py-3 border-2 border-slate-900 rounded-2xl font-black text-slate-800 text-sm uppercase tracking-widest hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
