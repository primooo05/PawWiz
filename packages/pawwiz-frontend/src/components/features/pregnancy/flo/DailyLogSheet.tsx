import React, { useEffect, useState } from 'react';
import { X, ChevronDown, Home } from 'lucide-react';
import type {
  PregnancyLogEntry,
  SymptomChip,
  MoodChip,
  AppetiteLevel,
  EnergyLevel,
} from '../../../../../../pawwiz-backend/src/types/shared.js';
import type { DailyLogPayload } from '../../../../hooks/features/useCatPregnancy';
import {
  SYMPTOM_META,
  MOOD_META,
  APPETITE_META,
  ENERGY_META,
  SYMPTOM_KEYS,
  MOOD_KEYS,
  APPETITE_KEYS,
  ENERGY_KEYS,
  isProminent,
} from '../chipRegistry';

interface DailyLogSheetProps {
  isOpen: boolean;
  onClose: () => void;
  gestationWeek: number;
  existing: PregnancyLogEntry | null;
  isSaving: boolean;
  onSave: (payload: DailyLogPayload) => Promise<PregnancyLogEntry | null>;
}

const NOTES_MAX = 300;

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * Flo-style daily log bottom sheet.
 *
 * Chips are the PRIMARY input (symptoms, mood, appetite, energy) — a log can be
 * submitted with a single tap. Measurements (weight, temp) and free-text notes
 * are SECONDARY: collapsed behind an "Add measurements" toggle, never shown up
 * front. If a log already exists for today, the sheet opens pre-filled in edit
 * mode (one log per day, editable — never duplicated).
 */
export const DailyLogSheet: React.FC<DailyLogSheetProps> = ({
  isOpen,
  onClose,
  gestationWeek,
  existing,
  isSaving,
  onSave,
}) => {
  const [symptoms, setSymptoms] = useState<SymptomChip[]>([]);
  const [moodBehavior, setMoodBehavior] = useState<MoodChip[]>([]);
  const [appetiteLevel, setAppetiteLevel] = useState<AppetiteLevel | undefined>();
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | undefined>();
  const [nestingObserved, setNestingObserved] = useState(false);
  const [weight, setWeight] = useState('');
  const [temp, setTemp] = useState('');
  const [notes, setNotes] = useState('');
  const [showMeasurements, setShowMeasurements] = useState(false);

  // Hydrate from the existing log whenever the sheet opens (edit mode).
  useEffect(() => {
    if (!isOpen) return;
    setSymptoms(existing?.symptoms ?? []);
    setMoodBehavior(existing?.moodBehavior ?? []);
    setAppetiteLevel(existing?.appetiteLevel ?? undefined);
    setEnergyLevel(existing?.energyLevel ?? undefined);
    setNestingObserved(existing?.nestingObserved ?? false);
    setWeight(existing?.weight != null ? String(existing.weight) : '');
    setTemp(existing?.temp != null ? String(existing.temp) : '');
    setNotes(existing?.notes ?? '');
    // Auto-expand measurements only if the existing log already has some.
    setShowMeasurements(existing?.weight != null || existing?.temp != null || !!existing?.notes);
  }, [isOpen, existing]);

  if (!isOpen) return null;

  const nestingVisible = gestationWeek >= 5;
  const nestingProminent = gestationWeek >= 7 && gestationWeek <= 9;

  const handleSave = async () => {
    const payload: DailyLogPayload = {
      symptoms,
      moodBehavior,
      appetiteLevel,
      energyLevel,
      nestingObserved,
    };
    const w = parseFloat(weight);
    if (!Number.isNaN(w) && w > 0) payload.weight = w;
    const t = parseFloat(temp);
    if (!Number.isNaN(t)) payload.temp = t;
    const trimmed = notes.trim();
    if (trimmed) payload.notes = trimmed;

    const saved = await onSave(payload);
    if (saved) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Daily log"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border-2 border-slate-900 bg-white shadow-[4px_4px_0_0_rgba(15,23,42,1)] sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {existing ? "Edit today's log" : 'Log today'}
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F8C90]">Week {gestationWeek}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Symptoms */}
          <ChipSection title="Symptoms">
            {SYMPTOM_KEYS.map((key) => (
              <Chip
                key={key}
                label={SYMPTOM_META[key].label}
                selected={symptoms.includes(key)}
                prominent={isProminent(SYMPTOM_META[key], gestationWeek)}
                onClick={() => setSymptoms((prev) => toggle(prev, key))}
              />
            ))}
          </ChipSection>

          {/* Mood / behavior */}
          <ChipSection title="Mood & behavior">
            {MOOD_KEYS.map((key) => (
              <Chip
                key={key}
                label={MOOD_META[key].label}
                selected={moodBehavior.includes(key)}
                prominent={isProminent(MOOD_META[key], gestationWeek)}
                onClick={() => setMoodBehavior((prev) => toggle(prev, key))}
              />
            ))}
          </ChipSection>

          {/* Appetite (single-select) */}
          <ChipSection title="Appetite">
            {APPETITE_KEYS.map((key) => (
              <Chip
                key={key}
                label={APPETITE_META[key]}
                selected={appetiteLevel === key}
                onClick={() => setAppetiteLevel((prev) => (prev === key ? undefined : key))}
              />
            ))}
          </ChipSection>

          {/* Energy (single-select) */}
          <ChipSection title="Energy">
            {ENERGY_KEYS.map((key) => (
              <Chip
                key={key}
                label={ENERGY_META[key]}
                selected={energyLevel === key}
                onClick={() => setEnergyLevel((prev) => (prev === key ? undefined : key))}
              />
            ))}
          </ChipSection>

          {/* Nesting quick-tap (weeks 5+, prominent 7-9) */}
          {nestingVisible && (
            <button
              type="button"
              onClick={() => setNestingObserved((v) => !v)}
              className={`mb-4 flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 font-bold transition-colors ${
                nestingObserved
                  ? 'border-slate-900 bg-[#15AFB4] text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              } ${nestingProminent ? 'ring-2 ring-amber-300' : ''}`}
            >
              <span className="flex items-center gap-2">
                <Home className="h-5 w-5" strokeWidth={2.25} />
                Nesting observed
                {nestingProminent && !nestingObserved && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                    Watch now
                  </span>
                )}
              </span>
              <span className={`inline-block h-3 w-3 rounded-full ${nestingObserved ? 'bg-white' : 'bg-slate-300'}`} />
            </button>
          )}

          {/* Measurements — SECONDARY, collapsed by default */}
          {!showMeasurements ? (
            <button
              type="button"
              onClick={() => setShowMeasurements(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700"
            >
              <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
              Add measurements (optional)
            </button>
          ) : (
            <div className="rounded-2xl border-2 border-slate-100 p-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Weight (kg)
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    max="20"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="rounded-xl border-2 border-slate-200 px-3 py-2 text-base font-semibold text-slate-900 focus:border-[#15AFB4] focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Temp (°C)
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="35"
                    max="42"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="rounded-xl border-2 border-slate-200 px-3 py-2 text-base font-semibold text-slate-900 focus:border-[#15AFB4] focus:outline-none"
                  />
                </label>
              </div>
              <label className="mt-3 flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Notes
                <textarea
                  value={notes}
                  maxLength={NOTES_MAX}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#15AFB4] focus:outline-none"
                  placeholder="Anything else worth noting…"
                />
                <span className="self-end text-[10px] font-semibold text-slate-400">
                  {notes.length}/{NOTES_MAX}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-2xl border-2 border-slate-900 bg-[#15AFB4] py-3 font-black text-white shadow-[2px_2px_0_0_rgba(15,23,42,1)] transition-transform active:translate-y-0.5 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : "Save today's log"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChipSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-4">
    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
    <div className="flex flex-wrap gap-2">{children}</div>
  </section>
);

const Chip: React.FC<{ label: string; selected: boolean; prominent?: boolean; onClick: () => void }> = ({
  label,
  selected,
  prominent = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-colors ${
      selected
        ? 'border-slate-900 bg-[#15AFB4] text-white'
        : prominent
          ? 'border-amber-300 bg-amber-50 text-amber-800'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
    }`}
  >
    {label}
  </button>
);

export default DailyLogSheet;
