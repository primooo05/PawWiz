/*
 * PERENUAL API LICENSING REVIEW
 * License tier:       [TO BE FILLED BEFORE MERGE]
 * Terms clause:       [TO BE FILLED BEFORE MERGE]
 * Conclusion:         [permit | prohibit]
 * Date of review:     [YYYY-MM-DD]
 */

/**
 * Service Layer — Plant Toxicity Cache
 * Orchestrates multi-tier caching pipeline for plant toxicity lookups.
 * Delegates data access to toxicityRepository; calls Perenual and Gemini APIs on cache miss.
 * Implements stale-while-revalidate with deduplication guard.
 * Singleton Pattern — exported as a single instance.
 *
 * Requirements: 1.4, 3.1
 */

import { createHash } from 'node:crypto';
import { toxicityRepository } from '../repositories/toxicity.repository.js';
import { aspcaRepository } from '../repositories/aspca.repository.js';
import { plantnetService } from './plantnet.service.js';
import { searchPlantByName, type PerenualApiResult } from './perenual.js';
import { scanPlantWithVision } from './gemini.js';
import { groqClient } from '../repositories/groq.repository.js';
import { logger } from '../utils/winston.js';
import type { CacheRecord, ToxicityScanResult, PlantToxicityRecord } from '../types/shared.js';
import type { Plant } from '@prisma/client';

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Stale cache window for perenual_cache records: 30 days.
 * Subject to downward revision per Requirement 1.2 if Perenual's terms require a shorter window.
 */
export const STALE_CACHE_WINDOW_SECONDS = 2_592_000; // 30 days
const STALE_CACHE_WINDOW_MS = STALE_CACHE_WINDOW_SECONDS * 1000;

// ── Query context types (for fallback log structure) ──────────────────────────

type TextQueryContext = { type: 'text'; queryText: string };
type ImageQueryContext = { type: 'image'; imageHash: string; imageBytes: number };

// ── Minimal Multer.File interface (avoids @types/multer dependency) ───────────

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Map a Prisma Plant row to the CacheRecord interface.
 * Both use camelCase field names (Prisma @map directives handle the DB column names).
 */
function plantToCacheRecord(plant: Plant): CacheRecord {
  return {
    id: plant.id,
    commonName: plant.commonName,
    scientificName: plant.scientificName,
    toxicityStatus: plant.toxicityStatus as CacheRecord['toxicityStatus'],
    severity: (plant.severity ?? null) as CacheRecord['severity'],
    clinicalSigns: plant.clinicalSigns,
    source: plant.source as CacheRecord['source'],
    mediaUrl: plant.mediaUrl ?? null,
    perenualId: plant.perenualId ?? null,
    physicalDescription: plant.physicalDescription ?? null,
    cachedAt: plant.cachedAt ?? null,
    lastVerifiedAt: plant.lastVerifiedAt,
  };
}

/**
 * Map a CacheRecord to a ToxicityScanResult for DB hit paths.
 * identificationConfidence and lowConfidenceWarning are caller-set.
 */
function cacheRecordToScanResult(
  record: CacheRecord,
  identificationConfidence: number | null,
  lowConfidenceWarning: boolean,
  actionRequired?: string,
): ToxicityScanResult {
  const toxicityStatus = record.toxicityStatus === 'toxic'
    ? 'TOXIC'
    : record.toxicityStatus === 'safe'
    ? 'SAFE'
    : 'UNKNOWN';

  return {
    identifiedPlant: record.commonName,
    scientificName: record.scientificName,
    toxicityStatus,
    severity: record.severity,
    clinicalSigns: record.clinicalSigns,
    actionRequired: actionRequired ?? buildDefaultActionRequired(record),
    identificationConfidence,
    lowConfidenceWarning,
    dataSource: record.source,
    mediaUrl: record.mediaUrl,
    physicalDescription: record.physicalDescription,
  };
}

function buildDefaultActionRequired(record: CacheRecord): string {
  if (record.toxicityStatus === 'toxic') {
    return `${record.commonName} is toxic to cats. If your cat has ingested it, contact a veterinarian or animal poison control immediately.`;
  }
  if (record.toxicityStatus === 'caution') {
    return `Exercise caution with ${record.commonName}. Contact a veterinarian if your cat has ingested any part of this plant.`;
  }
  return `${record.commonName} is generally considered safe for cats. Monitor for any unusual symptoms.`;
}

/**
 * Map a PerenualApiResult to a ToxicityScanResult for API-hit paths.
 */
function perenualResultToScanResult(
  result: PerenualApiResult,
  identificationConfidence: number | null,
  lowConfidenceWarning: boolean,
): ToxicityScanResult {
  const toxicityStatus = result.toxicity_status === 'toxic'
    ? 'TOXIC'
    : result.toxicity_status === 'safe'
    ? 'SAFE'
    : 'UNKNOWN';

  const actionRequired = result.toxicity_status === 'toxic'
    ? `${result.common_name} is toxic to cats. If your cat has ingested it, contact a veterinarian or animal poison control immediately.`
    : `${result.common_name} — verify before assuming safe. Consult a veterinarian if your cat has ingested this plant.`;

  return {
    identifiedPlant: result.common_name,
    scientificName: result.scientific_name,
    toxicityStatus,
    severity: (result.severity ?? null) as ToxicityScanResult['severity'],
    clinicalSigns: result.clinical_signs ?? [],
    actionRequired,
    identificationConfidence,
    lowConfidenceWarning,
    dataSource: 'perenual_cache',
    mediaUrl: result.media_url ?? null,
  };
}

/**
 * Map a PlantToxicityRecord (ASPCA in-memory shape) to a ToxicityScanResult.
 * Used as an authoritative fallback in the image pipeline when the Postgres DB misses.
 */
function aspcaRecordToScanResult(
  record: PlantToxicityRecord,
  identificationConfidence: number | null,
  lowConfidenceWarning: boolean,
  actionRequired?: string,
): ToxicityScanResult {
  return {
    identifiedPlant: record.plantName,
    scientificName: record.scientificName,
    toxicityStatus: record.isToxic ? 'TOXIC' : 'SAFE',
    severity: (record.severity?.toLowerCase() ?? null) as ToxicityScanResult['severity'],
    clinicalSigns: record.clinicalSigns,
    actionRequired: actionRequired ?? record.actionRequired,
    identificationConfidence,
    lowConfidenceWarning,
    dataSource: 'aspca',
    mediaUrl: null,
  };
}

// ── ToxicityCacheService ───────────────────────────────────────────────────────

class ToxicityCacheService {

  /**
   * Deduplication guard: maps scientificName → timestamp of last refresh trigger.
   * Prevents multiple background refreshes within a 1-second window for the same record.
   * Requirements: 3.5
   */
  private refreshInProgress = new Map<string, number>();

  /**
   * Refresh backoff gate: maps scientificName → earliest time the next refresh is allowed.
   * Set to now + 60 minutes after a failed refresh attempt.
   * Requirements: 3.6
   */
  private refreshBlockedUntil = new Map<string, number>();

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * TextPipeline entry point.
   * Resolves via Local_DB first, then Perenual API on miss.
   * Always sets identificationConfidence: null, lowConfidenceWarning: false.
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.1
   */
  async resolveTextPipeline(query: string): Promise<ToxicityScanResult> {
    const queryContext: TextQueryContext = { type: 'text', queryText: query };

    // Step 1: common name lookup
    const byCommon = await this.resolveByCommonName(query);
    if (byCommon !== null) {
      if (byCommon.mediaUrl === null) {
        this.backgroundFetchMediaUrl(byCommon);
      }
      return cacheRecordToScanResult(byCommon, null, false);
    }

    // Step 2: scientific name lookup
    const byScientific = await this.resolveByScientificName(query);
    if (byScientific !== null) {
      if (byScientific.mediaUrl === null) {
        this.backgroundFetchMediaUrl(byScientific);
      }
      return cacheRecordToScanResult(byScientific, null, false);
    }

    // Step 3: DB miss — call Perenual API
    let perenualResult: PerenualApiResult | null;
    try {
      perenualResult = await searchPlantByName(query);
    } catch (err) {
      const error = err as Error;
      return this.buildFallbackResponse('perenual_api_error', error.message, queryContext, error.constructor.name);
    }

    if (!perenualResult || !perenualResult.scientific_name || !perenualResult.toxicity_status) {
      return this.buildFallbackResponse(
        'perenual_api_error',
        'Perenual API returned no result or incomplete response',
        queryContext,
      );
    }

    // Step 4: write to cache (non-fatal if write fails)
    try {
      await this.writeCache(perenualResult);
    } catch (err) {
      const error = err as Error;
      logger.warn('Toxicity cache write failed — returning API result to client', {
        pipeline: 'text',
        plantName: perenualResult.common_name,
        errorType: error.constructor.name,
        reason: error.message,
        timestamp: new Date().toISOString(),
      });
      // Continue — return Perenual result even if cache write failed
    }

    return perenualResultToScanResult(perenualResult, null, false);
  }

  /**
   * ImagePipeline entry point.
   * Calls Gemini Vision → resolves via Local_DB → Perenual API on miss.
   * Propagates identificationConfidence from Gemini; sets lowConfidenceWarning for confidence < 0.6.
   * Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.8, 6.1
   */
  async resolveImagePipeline(file: MulterFile): Promise<ToxicityScanResult> {
    const imageHash = createHash('sha256').update(file.buffer).digest('hex');
    const imageContext: ImageQueryContext = {
      type: 'image',
      imageHash,
      imageBytes: file.size,
    };

    logger.info('[ToxicityCacheService] resolveImagePipeline triggered:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      imageHash,
    });

    // Step 1: call PlantNet API (timeout enforced inside repository — 30 s)
    let plantNetResult: { scientificName: string | null; confidence: number } | null = null;
    let plantNetError: Error | null = null;
    try {
      plantNetResult = await plantnetService.identify(file.buffer, file.mimetype);
      logger.info('[ToxicityCacheService] PlantNet API identification result:', plantNetResult);
    } catch (err) {
      plantNetError = err as Error;
      logger.warn('PlantNet identification failed — attempting filename-based ASPCA fallback', {
        pipeline: 'image',
        imageHash: imageContext.imageHash,
        errorType: plantNetError.constructor.name,
        reason: plantNetError.message,
        timestamp: new Date().toISOString(),
      });
    }

    // PlantNet failed (timeout, error) or returned no identifiable plant — try filename as ASPCA query
    if (plantNetResult === null || !plantNetResult.scientificName?.trim()) {
      const filenameHint = file.originalname
        .replace(/\.[^.]+$/, '')   // strip extension
        .replace(/[-_]/g, ' ')     // normalise separators
        .trim();

      logger.info('[ToxicityCacheService] PlantNet failed/empty. Trying filename-based fallback with hint:', { filenameHint });

      if (filenameHint.length >= 3) {
        const aspcaByFilename = await aspcaRepository.findByFuzzyMatch(filenameHint);
        if (aspcaByFilename !== null) {
          logger.info('Image pipeline: ASPCA hit via filename fallback', {
            filenameHint,
            toxicity: aspcaByFilename.isToxic,
          });
          return aspcaRecordToScanResult(aspcaByFilename, null, false);
        }
        logger.info('[ToxicityCacheService] ASPCA filename fallback miss for:', filenameHint);
      } else {
        logger.info('[ToxicityCacheService] Filename hint too short for ASPCA lookup:', filenameHint);
      }

      // Try Groq Vision Model (primary AI vision fallback)
      logger.info('[ToxicityCacheService] Filename fallback missed. Trying Groq Vision Model (primary AI fallback).');
      try {
        const groqResult = await groqClient.identifyPlantFromImage(
          file.buffer.toString('base64'),
          file.mimetype,
        );
        if (groqResult && groqResult.scientificName?.trim()) {
          const rawGroqName = groqResult.scientificName;
          const groqCleanedName = rawGroqName.trim().split(/\s+/).slice(0, 2).join(' ');

          logger.info('[ToxicityCacheService] Groq Vision Model identified plant:', {
            rawGroqName,
            groqCleanedName,
            confidence: groqResult.confidence,
          });

          // Query ASPCA (local db)
          const aspcaRecord = await aspcaRepository.findByFuzzyMatch(groqCleanedName);
          if (aspcaRecord !== null) {
            const lowConfidenceWarning = groqResult.confidence < 0.6;
            const actionRequired = lowConfidenceWarning
              ? this.buildLowConfidenceActionRequired(rawGroqName)
              : undefined;
            logger.info('Image pipeline: ASPCA hit via Groq Vision Model fallback', {
              groqCleanedName,
              toxicity: aspcaRecord.isToxic,
            });
            return aspcaRecordToScanResult(aspcaRecord, groqResult.confidence, lowConfidenceWarning, actionRequired);
          }
          logger.info('[ToxicityCacheService] ASPCA fallback miss for Groq identified plant:', groqCleanedName);
        }
      } catch (groqErr) {
        const gErr = groqErr as Error;
        logger.warn('[ToxicityCacheService] Groq Vision Model fallback failed:', {
          errorType: gErr.constructor.name,
          reason: gErr.message,
        });
      }

      // Try Gemini Vision Model (secondary AI vision fallback)
      logger.info('[ToxicityCacheService] Groq fallback missed. Trying Gemini Vision Model (secondary AI fallback).');
      try {
        const geminiResult = await scanPlantWithVision(file.buffer);
        if (geminiResult && geminiResult.scientificName?.trim()) {
          const rawGeminiName = geminiResult.scientificName;
          const geminiCleanedName = rawGeminiName.trim().split(/\s+/).slice(0, 2).join(' ');
          
          logger.info('[ToxicityCacheService] Gemini Vision Model identified plant:', {
            rawGeminiName,
            geminiCleanedName,
            confidence: geminiResult.confidence,
          });

          // Query ASPCA (local db)
          const aspcaRecord = await aspcaRepository.findByFuzzyMatch(geminiCleanedName);
          if (aspcaRecord !== null) {
            const lowConfidenceWarning = geminiResult.confidence < 0.6;
            const actionRequired = lowConfidenceWarning
              ? this.buildLowConfidenceActionRequired(rawGeminiName)
              : undefined;
            logger.info('Image pipeline: ASPCA hit via Gemini Vision Model fallback', {
              geminiCleanedName,
              toxicity: aspcaRecord.isToxic,
            });
            return aspcaRecordToScanResult(aspcaRecord, geminiResult.confidence, lowConfidenceWarning, actionRequired);
          }
          logger.info('[ToxicityCacheService] ASPCA fallback miss for Gemini identified plant:', geminiCleanedName);
        }
      } catch (geminiErr) {
        const gErr = geminiErr as Error;
        logger.warn('[ToxicityCacheService] Gemini Vision Model fallback failed:', {
          errorType: gErr.constructor.name,
          reason: gErr.message,
        });
      }

      // Nothing found — emit the original PlantNet error as fallback
      const reason = plantNetError?.message ?? 'PlantNet API could not identify a plant in the image';
      const errorType = plantNetError?.constructor.name ?? 'unknown';
      logger.warn('[ToxicityCacheService] Fallback response triggered due to no identification / no filename match:', { reason, errorType });
      return this.buildFallbackResponse('plantnet_vision', reason, imageContext, errorType);
    }

    // Use raw (untrimmed) name for human-readable messages; trimmed binomial name (first two words) for DB/API lookups to strip author suffixes
    const rawScientificName = plantNetResult.scientificName;
    const plantName = rawScientificName.trim().split(/\s+/).slice(0, 2).join(' ');
    const displayPlantName = rawScientificName;
    const confidence = plantNetResult.confidence;

    logger.info('PlantNet identification result', {
      pipeline: 'image',
      identifiedName: plantName,
      confidence,
      imageHash: imageContext.imageHash,
    });

    // Step 2: resolve via scientific name from Postgres plant table (seeded + cached records)
    let record: CacheRecord | null = await this.resolveByScientificName(plantName);
    if (record === null) {
      record = await this.resolveByCommonName(plantName);
    }

    if (record !== null) {
      // DB hit — apply confidence logic and return
      return this.applyConfidenceAndReturn(record, displayPlantName, confidence, imageContext);
    }

    // Step 3: Postgres miss — consult ASPCA in-memory database (authoritative, zero-cost)
    const aspcaRecord = await aspcaRepository.findByFuzzyMatch(plantName);
    if (aspcaRecord !== null) {
      const lowConfidenceWarning = confidence < 0.6;
      const actionRequired = lowConfidenceWarning
        ? this.buildLowConfidenceActionRequired(displayPlantName)
        : undefined;
      logger.debug('Image pipeline: ASPCA in-memory hit', {
        plantName,
        confidence,
        toxicity: aspcaRecord.isToxic,
      });
      return aspcaRecordToScanResult(aspcaRecord, confidence, lowConfidenceWarning, actionRequired);
    }

    // Step 4: DB + ASPCA miss — call Perenual API
    let perenualResult: PerenualApiResult | null;
    try {
      perenualResult = await searchPlantByName(plantName);
    } catch (err) {
      const error = err as Error;
      return this.buildFallbackResponse('perenual_api_error', error.message, imageContext, error.constructor.name);
    }

    if (!perenualResult || !perenualResult.scientific_name || !perenualResult.toxicity_status) {
      return this.buildFallbackResponse(
        'perenual_api_error',
        'Perenual API returned no result or incomplete response',
        imageContext,
      );
    }

    // Write to cache (non-fatal)
    let writtenRecord: CacheRecord | null = null;
    try {
      writtenRecord = await this.writeCache(perenualResult);
    } catch (err) {
      const error = err as Error;
      logger.warn('Toxicity cache write failed — returning API result to client', {
        pipeline: 'image',
        plantName: perenualResult.common_name,
        errorType: error.constructor.name,
        reason: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Step 5: background media URL fetch if needed
    if (writtenRecord !== null) {
      if (writtenRecord.mediaUrl === null && writtenRecord.perenualId !== null) {
        this.backgroundFetchMediaUrl(writtenRecord);
      }
      return this.applyConfidenceAndReturn(writtenRecord, displayPlantName, confidence, imageContext);
    }

    // Cache write failed — return Perenual result directly
    const lowConfidenceWarning = confidence < 0.6;
    const result = perenualResultToScanResult(perenualResult, confidence, lowConfidenceWarning);
    if (lowConfidenceWarning) {
      result.actionRequired = this.buildLowConfidenceActionRequired(displayPlantName);
    }
    return result;
  }

  // ── Cache resolution ────────────────────────────────────────────────────────

  /**
   * Resolve a plant by scientific name (case-insensitive exact match).
   * Returns null for null/undefined/empty input without querying the DB.
   * Requirements: 2.4, 3.2
   */
  async resolveByScientificName(name: string | null | undefined): Promise<CacheRecord | null> {
    if (name == null || name.trim() === '') {
      return null;
    }
    const trimmed = name.trim();
    const plant = await toxicityRepository.findByScientificName(trimmed);
    if (plant === null) return null;

    const record = plantToCacheRecord(plant);
    if (this.isStale(record)) {
      this.staleWhileRevalidate(record);
    }
    return record;
  }

  /**
   * Resolve a plant by common name (case-insensitive substring match).
   * Returns null for null/undefined/empty input without querying the DB.
   * Requirements: 2.5, 3.2
   */
  async resolveByCommonName(name: string | null | undefined): Promise<CacheRecord | null> {
    if (name == null || name.trim() === '') {
      return null;
    }
    const trimmed = name.trim();
    const plant = await toxicityRepository.findByCommonName(trimmed);
    if (plant === null) return null;

    const record = plantToCacheRecord(plant);
    if (this.isStale(record)) {
      this.staleWhileRevalidate(record);
    }
    return record;
  }

  // ── Cache write ─────────────────────────────────────────────────────────────

  /**
   * Write a new perenual_cache record to the database.
   * Throws on failure — caller is responsible for non-fatal handling.
   * Requirements: 2.2, 4.3
   */
  async writeCache(data: PerenualApiResult): Promise<CacheRecord> {
    const now = new Date();
    const plant = await toxicityRepository.create({
      commonName: data.common_name,
      scientificName: data.scientific_name,
      toxicityStatus: data.toxicity_status,
      severity: data.severity ?? null,
      clinicalSigns: data.clinical_signs ?? [],
      source: 'perenual_cache',
      mediaUrl: data.media_url ?? null,
      perenualId: data.perenual_id ?? null,
      cachedAt: now,
      lastVerifiedAt: now,
    });
    return plantToCacheRecord(plant);
  }

  // ── Fallback ────────────────────────────────────────────────────────────────

  /**
   * Build a safe Fallback_Response and emit a WARN log.
   * Requirements: 7.1, 7.2, 7.3
   */
  private buildFallbackResponse(
    stage: string,
    reason: string,
    queryContext: TextQueryContext | ImageQueryContext,
    errorType?: string,
  ): ToxicityScanResult {
    const actionRequired =
      'Unable to verify plant safety. Treat this plant as potentially toxic and contact a veterinarian or animal poison control if your cat has ingested it.';

    // WARN log — never include raw base64 or binary content
    const logMeta: Record<string, unknown> = {
      pipeline: queryContext.type,
      stage,
      reason,
      errorType: errorType ?? 'unknown',
      timestamp: new Date().toISOString(),
    };

    if (queryContext.type === 'text') {
      logMeta['queryText'] = queryContext.queryText;
    } else {
      logMeta['imageHash'] = queryContext.imageHash;
      logMeta['imageBytes'] = queryContext.imageBytes;
    }

    logger.warn('Toxicity pipeline fallback triggered', logMeta);

    return {
      identifiedPlant: null,
      scientificName: null,
      toxicityStatus: 'UNKNOWN',
      severity: null,
      clinicalSigns: [],
      actionRequired,
      identificationConfidence: null,
      lowConfidenceWarning: false,
      dataSource: 'fallback',
      mediaUrl: null,
    };
  }

  // ── Staleness ───────────────────────────────────────────────────────────────

  /**
   * Returns true if the record is stale and eligible for background refresh.
   * ASPCA records are never stale (cachedAt is null and source is 'aspca').
   * Requirements: 3.1, 3.4
   */
  private isStale(record: CacheRecord): boolean {
    if (record.source === 'aspca') return false;
    if (record.cachedAt === null) return false;
    return Date.now() - record.cachedAt.getTime() > STALE_CACHE_WINDOW_MS;
  }

  /**
   * Fire a background refresh for the given stale record.
   * Enforces a 1-second deduplication window per scientific name.
   * Enforces a 60-minute backoff after a failed refresh attempt.
   * Requirements: 3.2, 3.5, 3.6
   */
  private staleWhileRevalidate(record: CacheRecord): void {
    const key = record.scientificName;

    // Check backoff gate
    const blockedUntil = this.refreshBlockedUntil.get(key);
    if (blockedUntil !== undefined && Date.now() < blockedUntil) {
      return;
    }

    // Check deduplication guard (1-second window)
    const lastTrigger = this.refreshInProgress.get(key);
    if (lastTrigger !== undefined && Date.now() - lastTrigger < 1000) {
      return;
    }

    // All checks passed — set in-progress entry and fire background refresh
    this.refreshInProgress.set(key, Date.now());
    setImmediate(() => {
      this.backgroundRefresh(record).catch((err: unknown) => {
        const error = err as Error;
        logger.warn('Toxicity background refresh failed', {
          scientificName: key,
          errorType: error.constructor.name,
          reason: error.message,
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  /**
   * Perform the actual background refresh against Perenual API.
   * On success: update the DB record with fresh Perenual data.
   * On failure: set the backoff gate and log a warning.
   * Requirements: 3.3, 3.6
   */
  private async backgroundRefresh(record: CacheRecord): Promise<void> {
    try {
      const freshData = await searchPlantByName(record.scientificName);

      if (!freshData) {
        throw new Error('Perenual API returned no result for background refresh');
      }

      const now = new Date();
      await toxicityRepository.updatePerenualFields(record.id, {
        toxicityStatus: freshData.toxicity_status,
        severity: freshData.severity ?? null,
        clinicalSigns: freshData.clinical_signs ?? [],
        mediaUrl: freshData.media_url ?? null,
        perenualId: freshData.perenual_id ?? null,
        cachedAt: now,
        lastVerifiedAt: now,
      });
    } catch (err) {
      // Set 60-minute backoff gate
      this.refreshBlockedUntil.set(record.scientificName, Date.now() + 60 * 60 * 1000);
      throw err; // re-throw so the setImmediate catch handler can log it
    }
  }

  // ── Image pipeline helpers ──────────────────────────────────────────────────

  /**
   * Apply confidence logic to a resolved CacheRecord and build ToxicityScanResult.
   * Sets lowConfidenceWarning: true and populates actionRequired with plant name when confidence < 0.6.
   */
  private applyConfidenceAndReturn(
    record: CacheRecord,
    plantName: string,
    confidence: number,
    imageContext: ImageQueryContext,
  ): ToxicityScanResult {
    const lowConfidenceWarning = confidence < 0.6;
    let actionRequired: string | undefined;

    if (lowConfidenceWarning) {
      actionRequired = this.buildLowConfidenceActionRequired(plantName);
    }

    // Background media URL fetch if needed
    if (record.mediaUrl === null) {
      this.backgroundFetchMediaUrl(record);
    }

    return cacheRecordToScanResult(record, confidence, lowConfidenceWarning, actionRequired);
  }

  /**
   * Build the low-confidence action required message.
   * Must include the plant name and be at least 20 characters.
   */
  private buildLowConfidenceActionRequired(plantName: string): string {
    return `Low confidence identification: "${plantName}" may not be correct. Verify the plant identity before acting on the toxicity result, and contact a veterinarian if your cat has ingested it.`;
  }

  /**
   * Fire a background Perenual fetch for a media URL.
   * On success: update the record's media_url in the DB.
   * On failure: silently log — does not affect the overall response.
   * Requirements: 5.4
   */
  private backgroundFetchMediaUrl(record: CacheRecord): void {
    setImmediate(async () => {
      try {
        const freshData = await searchPlantByName(record.scientificName);
        if (freshData?.media_url) {
          await toxicityRepository.updateMediaUrl(record.id, freshData.media_url);
        }
      } catch (err) {
        const error = err as Error;
        logger.warn('Background media URL fetch failed', {
          scientificName: record.scientificName,
          errorType: error.constructor.name,
          reason: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }
}

/** Singleton instance */
export const toxicityCacheService = new ToxicityCacheService();
