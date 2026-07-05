import React, { useEffect, useState } from 'react';
import {
  Check,
  Droplet,
  Zap,
  Sparkles,
  Heart,
  Volume2,
  CloudRain,
  Flame,
  Moon,
} from 'lucide-react';
import { useQuickLog, type QuickLogBehaviorType } from '../../../hooks/features/useQuickLog';
import type { MealLog } from '../../../hooks/features/useDietRecommender';
import type { FoodType, MealUnit } from '../../../lib/foods';
import MealLogModal from '../diet/sub-components/MealLogModal';
import { defaultTimeForMeal } from '../diet/sub-components/mealTime';

// Neo-brutalist palette (shared with the dashboard + charts)
const ORANGE = '#FF6B35';
const TEAL = '#4ECDC4';
const PINK = '#F98080';

type MealName = 'Breakfast' | 'Lunch' | 'Dinner';

interface BehaviorButton {
  type: QuickLogBehaviorType;
  label: string;
  Icon: React.FC<{ className?: string; strokeWidth?: number }>;
  color: string;
}

// Colors mirror the dashboard's behavior composition palette so the whole app
// reads the same behavior the same way (playful=teal, affectionate=orange, ...).
const BEHAVIORS: BehaviorButton[] = [
  { type: 'playful', label: 'Playful', Icon: Sparkles, color: TEAL },
  { type: 'affectionate', label: 'Affection', Icon: Heart, color: ORANGE },
  { type: 'vocal', label: 'Vocal', Icon: Volume2, color: '#8b5cf6' },
  { type: 'anxious', label: 'Anxious', Icon: CloudRain, color: PINK },
  { type: 'aggressive', label: 'Aggressive', Icon: Flame, color: '#b91c1c' },
  { type: 'lethargic', label: 'Lethargic', Icon: Moon, color: '#94a3b8' },
];

const MEAL_IDS: Record<MealName, string> = {
  Breakfast: '1',
  Lunch: '2',
  Dinner: '3',
};

const STANDARD_MEALS: MealName[] = ['Breakfast', 'Lunch', 'Dinner'];
const WATER_STEP = 50;

export interface QuickLogBarProps {
  /** Today's meals for the active cat (drives the meal pill state). */
  meals: MealLog[];
  /** Active cat's name (shown in the meal modal). */
  catName: string;
  /** Diet hook meal actions — reused so logging matches the Diet Recommender. */
  addMeal: (
    mealId: string,
    foodType: string,
    amount: number,
    unit: MealUnit,
    timestamp?: string,
    kcal?: number
  ) => void;
  skipMeal: (mealId: string) => void;
  resetMealLog: (mealId: string) => void;
  /** Current water intake (ml) for the active cat. */
  waterIntake: number;
  /** Called with an ml delta when the water quick-add is tapped. */
  onAddWater: (amount: number) => void;
  /** Optional cat id attached to logged behaviors. */
  catId?: string;
  /** Disable interactions when there is no active diet profile yet. */
  disabled?: boolean;
  /** Called after a behavior is successfully logged (lets the dashboard refresh). */
  onBehaviorLogged?: () => void;
  className?: string;
}

// Must match the server-side DEDUP_WINDOW_MS in quick-log.service.ts: one entry
// per behavior type per minute. Surfaced in the UI so users see the window
// instead of silently having repeat taps dropped.
const BEHAVIOR_COOLDOWN_MS = 60_000;

/** Parse a stored 12h timestamp (e.g. "8:30am") back to a 24h "HH:MM" value. */
/** Parse a stored 12h timestamp (e.g. "8:30am") back to a 24h "HH:MM" value. */
const parseTimestampTo24h = (timestamp?: string | null, mealName?: MealName): string =>
  defaultTimeForMeal(mealName ?? 'Breakfast', timestamp ?? undefined);

const QuickLogBar: React.FC<QuickLogBarProps> = ({
  meals,
  catName,
  addMeal,
  skipMeal,
  resetMealLog,
  waterIntake,
  onAddWater,
  catId,
  disabled = false,
  onBehaviorLogged,
  className = '',
}) => {
  const { logBehavior, isLogging } = useQuickLog();

  // Brief client-side lockout so a rapid double-tap can't fire two water writes
  // before the first settles. The server rate-limit + daily cap are the real
  // guardrails; this just smooths the UX.
  const [waterCooling, setWaterCooling] = useState(false);

  // Per-behavior cooldown (mirrors the server's 60s dedup window) so the user
  // can see exactly when a behavior can be logged again, rather than having
  // repeat taps silently collapsed into one.
  const [cooldownUntil, setCooldownUntil] = useState<Partial<Record<QuickLogBehaviorType, number>>>({});
  const [nowTs, setNowTs] = useState<number>(() => Date.now());

  useEffect(() => {
    const hasActive = Object.values(cooldownUntil).some((ts) => (ts ?? 0) > Date.now());
    if (!hasActive) return;

    const id = window.setInterval(() => {
      const now = Date.now();
      setNowTs(now);
      // Prune expired entries — clearing the last one lets this effect re-run
      // and stop the interval.
      setCooldownUntil((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const key of Object.keys(next) as QuickLogBehaviorType[]) {
          if ((next[key] ?? 0) <= now) {
            delete next[key];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const behaviorCooldownRemaining = (type: QuickLogBehaviorType): number => {
    const until = cooldownUntil[type];
    if (!until) return 0;
    return Math.max(0, Math.ceil((until - nowTs) / 1000));
  };

  // Meal modal state (mirrors the Diet Recommender's MealLogModal wiring).
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isEditingMeal, setIsEditingMeal] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [modalMealName, setModalMealName] = useState<MealName>('Breakfast');
  const [modalTimestamp, setModalTimestamp] = useState<string>('08:00');
  const [modalFoodType, setModalFoodType] = useState<FoodType>('dry');
  const [modalUnit, setModalUnit] = useState<MealUnit>('spoon');
  const [modalAmount, setModalAmount] = useState<number>(3);

  const mealStatus = (mealName: MealName): MealLog['status'] => {
    return meals.find((m) => m.mealName === mealName)?.status ?? 'pending';
  };

  const openMealModal = (mealName: MealName) => {
    if (disabled) return;
    const meal = meals.find((m) => m.mealName === mealName);

    if (meal && meal.status === 'logged') {
      // Re-open a logged meal for editing, seeded from its saved values.
      setIsEditingMeal(true);
      setEditingMealId(meal.id);
      setModalFoodType((meal.foodType as FoodType) ?? 'dry');
      setModalUnit((meal.unit as MealUnit) ?? 'spoon');
      setModalAmount(meal.amount ?? 3);
      setModalTimestamp(parseTimestampTo24h(meal.timestamp, mealName));
    } else {
      setIsEditingMeal(false);
      setEditingMealId(null);
      setModalFoodType('dry');
      setModalUnit('spoon');
      setModalAmount(3);
      setModalTimestamp(defaultTimeForMeal(mealName));
    }

    setModalMealName(mealName);
    setIsMealModalOpen(true);
  };

  const handleMealSubmit = (
    mealName: MealName,
    foodType: string,
    amount: number,
    unit: MealUnit,
    timestamp: string,
    kcal: number
  ) => {
    const targetMealId = MEAL_IDS[mealName];
    // If the meal type was changed while editing, clear the original slot.
    if (isEditingMeal && editingMealId && editingMealId !== targetMealId) {
      resetMealLog(editingMealId);
    }
    addMeal(targetMealId, foodType, amount, unit, timestamp, kcal);
    setIsMealModalOpen(false);
  };

  const handleAddWater = () => {
    if (disabled || waterCooling) return;
    setWaterCooling(true);
    onAddWater(WATER_STEP);
    window.setTimeout(() => setWaterCooling(false), 500);
  };

  const handleBehavior = async (type: QuickLogBehaviorType) => {
    if (disabled || behaviorCooldownRemaining(type) > 0) return;
    const ok = await logBehavior(type, { catId });
    if (ok) {
      setCooldownUntil((prev) => ({ ...prev, [type]: Date.now() + BEHAVIOR_COOLDOWN_MS }));
      onBehaviorLogged?.();
    }
  };

  return (
    <section
      aria-label="Quick log"
      className={`bg-white border-4 border-[#1a1a1a] rounded-3xl p-5 md:p-6 shadow-[4px_4px_0_0_#1a1a1a] ${className}`}
    >
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-9 h-9 flex items-center justify-center border-3 border-[#1a1a1a] rounded-xl"
          style={{ backgroundColor: ORANGE }}
        >
          <Zap className="w-5 h-5 text-white" strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-black tracking-wide uppercase">Quick Log</h2>
          <p className="text-[11px] font-bold text-[#888] uppercase tracking-widest">
            One tap to record today
          </p>
        </div>
      </div>

      {disabled && (
        <div className="mb-4 text-xs font-bold text-[#8a6d3b] bg-[#fff6e0] border-2 border-[#1a1a1a] rounded-xl px-3 py-2">
          Set up a diet profile to start quick-logging meals and water.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Meals */}
        <div>
          <h3
            className="text-[11px] font-black uppercase tracking-widest mb-3"
            style={{ color: ORANGE }}
          >
            Meals
          </h3>
          <div className="flex flex-col gap-2">
            {STANDARD_MEALS.map((mealName) => {
              const status = mealStatus(mealName);
              const done = status === 'logged';
              const skipped = status === 'skipped';
              return (
                <button
                  key={mealName}
                  type="button"
                  disabled={disabled}
                  onClick={() => openMealModal(mealName)}
                  aria-label={
                    done
                      ? `Edit ${mealName}`
                      : skipped
                        ? `${mealName} skipped`
                        : `Log ${mealName}`
                  }
                  className={`flex items-center justify-between px-4 py-2.5 border-3 border-[#1a1a1a] rounded-xl text-sm font-black transition-all active:translate-y-[2px] hover:shadow-[3px_3px_0_0_#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50 ${
                    done
                      ? 'bg-[#30c290] text-white'
                      : skipped
                        ? 'bg-[#f0f0eb] text-[#888] line-through'
                        : 'bg-white text-[#1a1a1a]'
                  }`}
                >
                  <span className="uppercase tracking-wide">{mealName}</span>
                  {done ? (
                    <Check className="w-4 h-4" strokeWidth={4} />
                  ) : skipped ? (
                    <span className="text-[11px] font-bold uppercase no-underline">Skipped</span>
                  ) : (
                    <span className="text-[11px] font-bold text-[#888] uppercase">Log →</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Water */}
        <div>
          <h3
            className="text-[11px] font-black uppercase tracking-widest mb-3"
            style={{ color: '#2ec4b6' }}
          >
            Water
          </h3>
          <div className="border-3 border-[#1a1a1a] rounded-xl p-4 flex flex-col items-center justify-center h-[calc(100%-1.75rem)]">
            <div className="flex items-center gap-2 mb-3">
              <Droplet className="w-5 h-5" strokeWidth={3} style={{ color: TEAL }} />
              <span className="text-2xl font-black" style={{ color: '#2ec4b6' }}>
                {waterIntake}
                <span className="text-sm"> ml</span>
              </span>
            </div>
            <button
              type="button"
              disabled={disabled || waterCooling}
              onClick={handleAddWater}
              aria-label={`Add ${WATER_STEP} millilitres of water`}
              className="w-full px-4 py-2.5 border-3 border-[#1a1a1a] rounded-xl text-sm font-black uppercase tracking-wide text-white transition-all active:translate-y-[2px] hover:shadow-[3px_3px_0_0_#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: TEAL }}
            >
              + {WATER_STEP} ml
            </button>
          </div>
        </div>

        {/* Behaviors */}
        <div>
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3
              className="text-[11px] font-black uppercase tracking-widest"
              style={{ color: TEAL }}
            >
              Behavior
            </h3>
            <span className="text-[10px] font-bold text-[#aaa] uppercase tracking-wide">
              1 log / min each
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {BEHAVIORS.map((b) => {
              const remaining = behaviorCooldownRemaining(b.type);
              const cooling = remaining > 0;
              const { Icon } = b;
              return (
                <button
                  key={b.type}
                  type="button"
                  disabled={isLogging || disabled || cooling}
                  onClick={() => handleBehavior(b.type)}
                  aria-label={
                    cooling
                      ? `${b.label} logged — available again in ${remaining} seconds`
                      : `Log ${b.label} behavior`
                  }
                  title={cooling ? `Logged. Available again in ${remaining}s` : undefined}
                  className="group flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-white border-3 border-[#1a1a1a] rounded-2xl transition-all active:translate-y-[2px] hover:shadow-[3px_3px_0_0_#1a1a1a] disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  <span
                    className="w-10 h-10 flex items-center justify-center border-2 border-[#1a1a1a] rounded-xl transition-colors"
                    style={{ backgroundColor: cooling ? '#cbd5e1' : b.color }}
                  >
                    {cooling ? (
                      <Check className="w-5 h-5 text-[#1a1a1a]" strokeWidth={4} />
                    ) : (
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.75} />
                    )}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wide leading-none tabular-nums">
                    {cooling ? `${remaining}s` : b.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <MealLogModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        onSubmit={handleMealSubmit}
        onSkip={(meal) => {
          skipMeal(meal.id);
          setIsMealModalOpen(false);
        }}
        onReset={(mealId) => {
          resetMealLog(mealId);
          setIsMealModalOpen(false);
        }}
        isEditing={isEditingMeal}
        editingMealId={editingMealId}
        initialMealName={modalMealName}
        initialTimestamp={modalTimestamp}
        initialFoodType={modalFoodType}
        initialUnit={modalUnit}
        initialAmount={modalAmount}
        catName={catName}
        loggedMeals={meals}
        showMealPeriodSelector={false}
      />
    </section>
  );
};

export default QuickLogBar;
