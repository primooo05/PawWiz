export type { PlantToxicityRecord } from '../data/aspca.js';

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
  identifiedPlant: string;
  scientificName: string;
  isToxic: boolean;
  severity: "None" | "Mild" | "Moderate" | "Severe";
  clinicalSigns: string[];
  actionRequired: string;
  confidence: number;
  dataSource: "ASPCA Database (Deterministic)" | "Gemini Vision (AI Model Verified)";
  aiAnalysisText?: string;
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
}

export interface BehaviorDecodeResponse {
  vocalAnalysis: string;
  bodyLanguageAnalysis: string;
  decodedMeaning: string;
  catState: "Happy/Relaxed" | "Anxious/Stressed" | "Playful" | "Aggressive/Defensive" | "Overstimulated" | "Sick/In Pain" | "Unknown";
  confidenceScore: number;
  actionPlan: string[];
}
