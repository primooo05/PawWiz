import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { DietOptimizeRequest, DietPlan, BehaviorDecodeRequest, BehaviorDecodeResponse } from '../types/shared.js';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || '';

// Fallback logic check
const isApiKeyMissing = !API_KEY;
if (isApiKeyMissing) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. Using mock fallback responses.");
}

const ai = isApiKeyMissing ? null : new GoogleGenAI({ apiKey: API_KEY });

// Models specified in backend pipeline
const TEXT_MODEL = 'gemini-3.5-flash';
const VISION_MODEL = 'gemini-3.5-pro';

export async function scanPlantWithVision(imageBase64: string): Promise<{ plantName: string; confidence: number; details: string }> {
  if (isApiKeyMissing || !ai) {
    // Generate intelligent mock response based on whether they uploaded a file
    return {
      plantName: "Peace Lily",
      confidence: 0.94,
      details: "The image shows dark green ribbed leaves with characteristic white spathe flowers, matching a Peace Lily (Spathiphyllum)."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: VISION_MODEL,
      contents: [
        { text: "Identify the plant in this image. Return the common name, your confidence level as a fraction between 0.0 and 1.0, and details about physical features. You must respond strictly in JSON matching the schema." },
        {
          inlineData: {
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
            mimeType: "image/jpeg"
          }
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            plantName: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            details: { type: Type.STRING }
          },
          required: ['plantName', 'confidence', 'details']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini vision model.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Vision API error:", error);
    // Graceful fallback
    return {
      plantName: "Unknown Plant",
      confidence: 0.5,
      details: "Could not classify accurately via Gemini API. Error: " + (error as Error).message
    };
  }
}

export async function optimizeDiet(request: DietOptimizeRequest): Promise<DietPlan> {
  if (isApiKeyMissing || !ai) {
    // Calculate simple calories for mock
    // RER (Resting Energy Requirement) = 70 * (weight)^0.75
    const rer = 70 * Math.pow(request.weightKg, 0.75);
    let factor = 1.2; // active/sedentary factor
    if (request.activityLevel === "sedentary") factor = 1.0;
    if (request.activityLevel === "active") factor = 1.4;
    
    let calories = Math.round(rer * factor);
    let rationale = `Calculated RER for ${request.weightKg}kg cat is ${Math.round(rer)} kcal. Activity multiplier is ${factor}x.`;
    let avoid = ["Chocolate", "Onions/Garlic", "Grapes/Raisins", "Dairy (highly lactose sensitive)"];
    
    if (request.healthConditions.some(c => c.toLowerCase().includes("renal"))) {
      rationale += " Adjusted for renal health: restricted phosphorus, moderate high-quality protein, and increased hydration support.";
      avoid.push("High phosphorus foods", "Dry kibble without water");
    }
    
    return {
      dailyCalories: calories,
      macronutrientSplit: {
        proteinPercent: 45,
        fatPercent: 35,
        carbsPercent: 20
      },
      recommendedFoods: [
        "Premium wet canned food (high moisture, low phosphorus if renal)",
        "Fresh cooked boneless chicken breast (unseasoned, small treats)",
        "Water fountain hydration encouragement"
      ],
      avoidFoods: avoid,
      feedingSchedule: "Split daily allotment into 3 small meals (Morning, Mid-day, Evening) to prevent glucose spikes.",
      dietRationale: rationale
    };
  }

  try {
    const prompt = `Generate a high-precision feline diet optimization plan.
Cat weight: ${request.weightKg} kg
Cat age: ${request.ageYears} years
Activity level: ${request.activityLevel}
Health conditions: ${request.healthConditions.join(', ')}

Return a strict JSON output matching the required schema. Ensure dailyCalories is an integer.`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            dailyCalories: { type: Type.INTEGER },
            macronutrientSplit: {
              type: Type.OBJECT,
              properties: {
                proteinPercent: { type: Type.INTEGER },
                fatPercent: { type: Type.INTEGER },
                carbsPercent: { type: Type.INTEGER }
              },
              required: ['proteinPercent', 'fatPercent', 'carbsPercent']
            },
            recommendedFoods: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            avoidFoods: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            feedingSchedule: { type: Type.STRING },
            dietRationale: { type: Type.STRING }
          },
          required: ['dailyCalories', 'macronutrientSplit', 'recommendedFoods', 'avoidFoods', 'feedingSchedule', 'dietRationale']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini diet model.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Diet API error:", error);
    // Simple fallback
    return {
      dailyCalories: 250,
      macronutrientSplit: { proteinPercent: 40, fatPercent: 35, carbsPercent: 25 },
      recommendedFoods: ["Standard wet cat food"],
      avoidFoods: ["Toxins like onion, garlic"],
      feedingSchedule: "Twice daily",
      dietRationale: "Fallback calculation due to API issue: " + (error as Error).message
    };
  }
}

export async function decodeBehavior(request: BehaviorDecodeRequest): Promise<BehaviorDecodeResponse> {
  if (isApiKeyMissing || !ai) {
    return {
      vocalAnalysis: `The vocalization '${request.vocalDescription}' indicates attention-seeking or mild demand.`,
      bodyLanguageAnalysis: `Body language details: ${request.bodyLanguageSigns.join(', ')}.`,
      decodedMeaning: "The cat is signaling curiosity mixed with slightly overstimulated boundaries, likely seeking play or resource verification.",
      catState: request.bodyLanguageSigns.includes("ears back") ? "Overstimulated" : "Playful",
      confidenceScore: 0.85,
      actionPlan: [
        "Avoid forced touching of sensitive areas (like base of tail or belly).",
        "Introduce a wand toy to redirect energy.",
        "Observe if pupillary dilation decreases before resuming gentle chin scratches."
      ]
    };
  }

  try {
    const prompt = `Decode the following feline behavioral state.
Vocal Description: ${request.vocalDescription}
Body Language Signs: ${request.bodyLanguageSigns.join(', ')}
Context: ${request.context}

Analyze vocal signals, tail, eyes, and ear positions. Return a detailed behavior decode response matching the JSON schema.`;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            vocalAnalysis: { type: Type.STRING },
            bodyLanguageAnalysis: { type: Type.STRING },
            decodedMeaning: { type: Type.STRING },
            catState: { 
              type: Type.STRING,
              enum: ["Happy/Relaxed", "Anxious/Stressed", "Playful", "Aggressive/Defensive", "Overstimulated", "Sick/In Pain", "Unknown"]
            },
            confidenceScore: { type: Type.NUMBER },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['vocalAnalysis', 'bodyLanguageAnalysis', 'decodedMeaning', 'catState', 'confidenceScore', 'actionPlan']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini behavior model.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Behavior API error:", error);
    return {
      vocalAnalysis: "Failed to run analysis",
      bodyLanguageAnalysis: "Failed to run analysis",
      decodedMeaning: "Encountered API exception: " + (error as Error).message,
      catState: "Unknown",
      confidenceScore: 0.0,
      actionPlan: ["Observe cat in natural state, ensure safety."]
    };
  }
}
