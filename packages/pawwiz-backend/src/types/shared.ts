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
