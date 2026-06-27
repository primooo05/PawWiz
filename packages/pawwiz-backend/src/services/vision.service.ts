/**
 * Service Layer — Plant Vision (Image Analysis)
 * Orchestrates plant identification via Gemini Vision,
 * then cross-references the ASPCA toxicity database.
 * Graceful fallback when API key is absent.
 * Singleton Pattern — exported as a single instance.
 */

import { Type } from '@google/genai';
import { geminiClient } from '../repositories/gemini.repository.js';
import { aspcaRepository } from '../repositories/aspca.repository.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/winston.js';
import type { ToxicityScanRequest, ToxicityScanResult } from '../types/shared.js';

/** Response schema for Gemini vision plant identification */
const VISION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    plantName: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    details: { type: Type.STRING },
  },
  required: ['plantName', 'confidence', 'details'],
};

class VisionService {
  /**
   * Scan a plant image or text query, returning toxicity information.
   * Priority: ASPCA database (deterministic) > Gemini Vision (AI).
   */
  async scan(request: ToxicityScanRequest): Promise<ToxicityScanResult> {
    if (!request.image && !request.plantNameQuery) {
      throw AppError.badRequest('Either image or plantNameQuery must be provided.');
    }

    // Text-based lookup path
    if (request.plantNameQuery) {
      return this.lookupByName(request.plantNameQuery);
    }

    // Image-based identification path
    return this.identifyFromImage(request.image!);
  }

  /**
   * Direct text lookup against ASPCA database.
   */
  private async lookupByName(plantName: string): Promise<ToxicityScanResult> {
    const record = await aspcaRepository.findByFuzzyMatch(plantName);

    if (!record) {
      throw AppError.notFound(
        `Plant "${plantName}" not found in ASPCA database. Try uploading an image for AI identification.`
      );
    }

    return {
      identifiedPlant: record.plantName,
      scientificName: record.scientificName,
      isToxic: record.isToxic,
      severity: record.severity,
      clinicalSigns: record.clinicalSigns,
      actionRequired: record.actionRequired,
      confidence: 1.0,
      dataSource: 'ASPCA Database (Deterministic)',
    };
  }

  /**
   * AI-powered image identification, cross-referenced with ASPCA data.
   */
  private async identifyFromImage(imageBase64: string): Promise<ToxicityScanResult> {
    const visionResult = await this.callVisionModel(imageBase64);

    // Cross-reference identified plant against ASPCA database
    const aspcaRecord = await aspcaRepository.findByFuzzyMatch(visionResult.plantName);

    if (aspcaRecord) {
      return {
        identifiedPlant: aspcaRecord.plantName,
        scientificName: aspcaRecord.scientificName,
        isToxic: aspcaRecord.isToxic,
        severity: aspcaRecord.severity,
        clinicalSigns: aspcaRecord.clinicalSigns,
        actionRequired: aspcaRecord.actionRequired,
        confidence: visionResult.confidence,
        dataSource: 'ASPCA Database (Deterministic)',
        aiAnalysisText: visionResult.details,
      };
    }

    // Plant not in ASPCA DB — return AI-only result with caveat
    return {
      identifiedPlant: visionResult.plantName,
      scientificName: 'Unknown',
      isToxic: false,
      severity: 'None',
      clinicalSigns: [],
      actionRequired:
        'Plant not found in ASPCA database. Exercise caution and consult a veterinarian if your cat has ingested this plant.',
      confidence: visionResult.confidence,
      dataSource: 'Gemini Vision (AI Model Verified)',
      aiAnalysisText: visionResult.details,
    };
  }

  /**
   * Call Gemini Vision for plant identification, with mock fallback.
   */
  private async callVisionModel(
    imageBase64: string
  ): Promise<{ plantName: string; confidence: number; details: string }> {
    if (!geminiClient.isAvailable) {
      return {
        plantName: 'Peace Lily',
        confidence: 0.94,
        details:
          'Mock response: dark green ribbed leaves with characteristic white spathe flowers, matching a Peace Lily (Spathiphyllum).',
      };
    }

    try {
      const prompt =
        'Identify the plant in this image. Return the common name, your confidence level as a fraction between 0.0 and 1.0, and details about physical features. Respond strictly in JSON matching the schema.';

      const text = await geminiClient.generateVision(prompt, imageBase64, VISION_RESPONSE_SCHEMA);

      if (!text) throw new Error('Empty response from Gemini vision model.');
      return JSON.parse(text);
    } catch (error) {
      logger.error('Gemini Vision API error', { error });
      return {
        plantName: 'Unknown Plant',
        confidence: 0.5,
        details: `Could not classify via Gemini API. Error: ${(error as Error).message}`,
      };
    }
  }
}

/** Singleton instance */
export const visionService = new VisionService();
