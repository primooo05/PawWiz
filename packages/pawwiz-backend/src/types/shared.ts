export interface PlantToxicityRecord {
  plantName: string;
  scientificName: string;
  isToxic: boolean;
  clinicalSigns: string[];
  severity: "None" | "Mild" | "Moderate" | "Severe";
  actionRequired: string;
  mediaUrl?: string | null;
}

export interface PlantLookupRequest {
  plantName: string;
}

export interface PlantLookupResponse {
  plantName: string;
  scientificName: string;
  isToxic: boolean;
  clinicalSigns: string[];
  severity: "None" | "Mild" | "Moderate" | "Severe";
  actionRequired: string;
}

export interface ToxicityScanRequest {
  image?: string; // base64 encoded photo
  plantNameQuery?: string; // text search backup
}

export interface ToxicityScanResult {
  identifiedPlant: string | null;
  scientificName: string | null;
  toxicityStatus: 'SAFE' | 'TOXIC' | 'UNKNOWN';
  severity: 'mild' | 'moderate' | 'severe' | 'lethal' | 'none' | null;
  clinicalSigns: string[];
  actionRequired: string;
  identificationConfidence: number | null;  // null for TextPipeline, 0.0–1.0 for ImagePipeline
  lowConfidenceWarning: boolean;            // true when identificationConfidence < 0.6
  dataSource: 'aspca' | 'perenual_cache' | 'fallback';
  mediaUrl?: string | null;                 // only populated when perenual_id is known
  physicalDescription?: string | null;      // Wikipedia-sourced extract, only populated for DB-backed hits
}

export interface CacheRecord {
  id: string;
  commonName: string;
  scientificName: string;
  toxicityStatus: 'toxic' | 'caution' | 'safe';
  severity: 'mild' | 'moderate' | 'severe' | 'lethal' | null;
  clinicalSigns: string[];
  source: 'aspca' | 'perenual_cache';
  mediaUrl: string | null;
  perenualId: string | null;
  physicalDescription: string | null;
  cachedAt: Date | null;
  lastVerifiedAt: Date;
}

export interface DietOptimizeRequest {
  weightKg: number;
  ageYears: number;
  activityLevel: "sedentary" | "moderate" | "active";
  healthConditions: string[]; // e.g., "renal disease", "obesity", "diabetes", "none"
}

export interface DietPlan {
  dailyCalories: number;
  macronutrientSplit: {
    proteinPercent: number;
    fatPercent: number;
    carbsPercent: number;
  };
  recommendedFoods: string[];
  avoidFoods: string[];
  feedingSchedule: string;
  dietRationale: string;
}

export interface BehaviorDecodeRequest {
  vocalDescription: string;
  bodyLanguageSigns: string[]; // e.g., "tail twitching", "pupils dilated", "ears back"
  context: string; // e.g., "approaching food", "after play", "petting tail"
  /** Recent conversation turns passed for context-aware follow-up handling.
   *  Each entry is a { role, content } pair (max 6 turns = 3 exchanges). */
  conversationHistory?: Array<{ role: 'user' | 'wiz'; content: string }>;
}

export interface BehaviorDecodeResponse {
  vocalAnalysis: string;
  bodyLanguageAnalysis: string;
  decodedMeaning: string;
  catState: "Happy/Relaxed" | "Anxious/Stressed" | "Playful" | "Aggressive/Defensive" | "Overstimulated" | "Sick/In Pain" | "Unknown";
  confidenceScore: number;
  actionPlan: string[];
}

/** Plain-text conversational reply — no structured analysis, just a direct answer. */
export interface ConversationalReply {
  type: 'conversational';
  text: string;
}

/** Snapshot of a cat's current diet profile, passed as grounding context to the Diet Advisor AI. */
export interface DietAdviceCatContext {
  catName: string;
  gender: 'male' | 'female';
  lifeStage: 'kitten' | 'adult' | 'senior';
  age: number;
  weight: number;
  isKg: boolean;
  foodPreference: 'dry' | 'wet' | 'mixed' | 'chicken' | 'chicken_thigh' | 'fish' | 'egg' | 'other';
  isSpayedNeutered: boolean;
  dailyCalories: number;
  totalLoggedCalories: number;
  waterIntake: number;
  waterTarget: number;
  mealsLoggedToday: number;
  mealsPendingToday: number;
}

export interface DietAdviceRequest {
  question: string;
  catProfile: DietAdviceCatContext;
  /** Recent conversation turns for context-aware follow-up handling.
   *  Each entry is a { role, content } pair (max 6 turns = 3 exchanges). */
  conversationHistory?: Array<{ role: 'user' | 'wiz'; content: string }>;
}

// ─── Unified Health Timeline types ───────────────────────────────────────────

export type EventSource = 'behavior' | 'diet' | 'pregnancy' | 'heat';

export type EventType =
  | 'behavior_log'
  | 'meal_logged'
  | 'diet_profile_updated'
  | 'water_updated'
  | 'pregnancy_started'
  | 'pregnancy_daily_log'
  | 'heat_cycle_started'
  | 'mating_logged';

export interface HealthEvent {
  id: string;               // originating record id (cuid from source table)
  catId: string;
  source: EventSource;
  eventType: EventType;
  occurredAt: string;       // ISO 8601 UTC with ms precision: YYYY-MM-DDTHH:mm:ss.sssZ
  title: string;            // human-readable headline (≤ 80 chars)
  description: string;      // short prose summary (≤ 200 chars; truncated before AI prompt)
  metadata?: Record<string, unknown>; // source-specific fields
}

export type InsightSeverity = 'info' | 'warning' | 'concern';

export interface CorrelationInsight {
  id: string;               // UUID
  catId: string;
  type: string;             // correlation type slug
  summary: string;          // ≤ 160 chars
  detail: string;           // ≤ 500 chars
  severity: InsightSeverity;
  eventIds: string[];       // correlated HealthEvent ids, lowercase hyphen-separated UUIDs
  source: 'ai' | 'heuristic';
  generatedAt: string;      // ISO 8601 UTC
}

export interface TimelineResponse {
  data: HealthEvent[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
  errors: Array<{ source: EventSource; message: string }>;
}

export interface InsightsResponse {
  data: CorrelationInsight[];
}

// ─── Cat Pregnancy Tracker — Flo-style logging types ─────────────────────────
//
// Chip Registry — the single source of truth for the tappable chips the daily
// log offers. Both the backend (Zod enum validation) and the frontend (chip
// rendering) import these const arrays, so an unknown chip value can never be
// persisted and the two sides can never drift apart.

export const SYMPTOM_CHIPS = [
  'appetite_loss',
  'appetite_increase',
  'vomiting',
  'discharge',        // clear/mucus — normal near labor
  'panting',
  'restless',
  'lethargy',
  'contractions',     // Week 9 only — surfaced prominently
  'nesting',          // Weeks 7-9 — surfaced prominently
  'nipple_swelling',  // Weeks 3-4
  'weight_gain',
] as const;

export const MOOD_CHIPS = [
  'affectionate',
  'hiding',
  'vocal',
  'aggressive',
  'calm',
  'anxious',
  'grooming_more',
  'grooming_less',
  'seeking_solitude', // Common Weeks 7-9
] as const;

export const APPETITE_LEVELS = [
  'normal',
  'increased',
  'reduced',
  'none',
] as const;

export const ENERGY_LEVELS = [
  'normal',
  'high',
  'low',
  'very_low',
] as const;

export type SymptomChip = typeof SYMPTOM_CHIPS[number];
export type MoodChip = typeof MOOD_CHIPS[number];
export type AppetiteLevel = typeof APPETITE_LEVELS[number];
export type EnergyLevel = typeof ENERGY_LEVELS[number];

export type PregnancyInsightType =
  | 'pattern_detected'
  | 'milestone_reached'
  | 'vet_reminder'
  | 'warning';

export interface PregnancyLogEntry {
  id: string;
  pregnancySessionId: string;
  symptoms: SymptomChip[];
  moodBehavior: MoodChip[];
  appetiteLevel: AppetiteLevel | null;
  energyLevel: EnergyLevel | null;
  nestingObserved: boolean;
  weight: number | null;
  temp: number | null;
  notes: string | null;
  gestationWeek: number;
  logDate: string;   // ISO 8601 UTC
  createdAt: string; // ISO 8601 UTC
}

export interface PregnancyInsightCard {
  id: string;
  insightType: PregnancyInsightType;
  title: string;
  body: string;
  gestationWeek: number;
  isRead: boolean;
  createdAt: string; // ISO 8601 UTC
}

export interface WeeklyLogGroup {
  week: number;
  phase: string; // e.g. "Fetal Swell", "Nesting Search"
  logs: PregnancyLogEntry[];
}

export interface ActiveSessionResponse {
  sessionId: string;
  catId: string;
  matingDate: string;           // ISO 8601 UTC
  expectedDeliveryDate: string; // ISO 8601 UTC
  daysPregnant: number;         // now - matingDate, in whole days
  gestationWeek: number;        // Math.ceil(daysPregnant / 7), clamped 1..10
  daysRemaining: number;        // expectedDelivery - now, in whole days (>= 0)
  status: 'active' | 'completed';
  todayLog: PregnancyLogEntry | null; // null if not yet logged today
  recentLogs: PregnancyLogEntry[];    // last 7 days, newest-first
  insights: PregnancyInsightCard[];   // unread insight cards
  weeklyHistory: WeeklyLogGroup[];    // full history grouped by gestation week
}
