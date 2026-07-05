// Feature: behavior-dashboard — analytics aggregation
//
// Covers: empty-state handling, concern-flag thresholds, insight generation
// (trend routing, positive/negative indicator classification), and intensity
// breakdown helper logic. All repo calls are mocked so we test the pure
// aggregation / decision code in isolation.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { behaviorDashboardService } from '../behavior-dashboard.service.js';

vi.mock('../../repositories/behavior-log.repository.js', () => ({
  getBehaviorLogsForUser: vi.fn(),
  getBehaviorTypeFrequency: vi.fn(),
  getBehaviorLogsForDateRange: vi.fn(),
}));
vi.mock('../../utils/winston.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import {
  getBehaviorLogsForUser,
  getBehaviorTypeFrequency,
  getBehaviorLogsForDateRange,
} from '../../repositories/behavior-log.repository.js';

const mockLogs = getBehaviorLogsForUser as ReturnType<typeof vi.fn>;
const mockFreq = getBehaviorTypeFrequency as ReturnType<typeof vi.fn>;
const mockRange = getBehaviorLogsForDateRange as ReturnType<typeof vi.fn>;

beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// getWeeklySummary
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorDashboardService — getWeeklySummary', () => {
  it('returns empty days/topBehaviors/concernFlags when no logs exist', async () => {
    mockLogs.mockResolvedValueOnce([]);
    const r = await behaviorDashboardService.getWeeklySummary('u1');
    expect(r.days).toEqual([]);
    expect(r.topBehaviors).toEqual([]);
    expect(r.concernFlags).toEqual([]);
    expect(r.week).toMatch(/Week of/);
  });

  it('raises concern flags at documented thresholds', async () => {
    mockLogs.mockResolvedValueOnce([
      { behaviorType: 'aggressive', intensity: 'severe', createdAt: new Date() },
      { behaviorType: 'aggressive', intensity: 'severe', createdAt: new Date() },
      { behaviorType: 'aggressive', intensity: 'severe', createdAt: new Date() },
      { behaviorType: 'anxious', intensity: 'moderate', createdAt: new Date() },
      { behaviorType: 'anxious', intensity: 'moderate', createdAt: new Date() },
      { behaviorType: 'anxious', intensity: 'moderate', createdAt: new Date() },
      { behaviorType: 'anxious', intensity: 'moderate', createdAt: new Date() },
    ]);
    mockFreq.mockResolvedValueOnce([
      { type: 'aggressive', count: 3 },
      { type: 'anxious', count: 4 },
    ]);

    const r = await behaviorDashboardService.getWeeklySummary('u1');
    expect(r.concernFlags).toContain('Elevated aggressive behavior detected');
    expect(r.concernFlags).toContain('Frequent anxiety observed');
  });

  it('does NOT flag when counts are at or below thresholds', async () => {
    mockLogs.mockResolvedValueOnce([
      { behaviorType: 'aggressive', intensity: 'mild', createdAt: new Date() },
      { behaviorType: 'aggressive', intensity: 'mild', createdAt: new Date() },
    ]);
    mockFreq.mockResolvedValueOnce([{ type: 'aggressive', count: 2 }]);

    const r = await behaviorDashboardService.getWeeklySummary('u1');
    expect(r.concernFlags).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getBehaviorPatterns
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorDashboardService — getBehaviorPatterns', () => {
  it('returns empty when no logs exist', async () => {
    mockLogs.mockResolvedValueOnce([]);
    const r = await behaviorDashboardService.getBehaviorPatterns('u1');
    expect(r).toEqual([]);
  });

  it('aggregates frequency and deduplicates contexts per type', async () => {
    mockLogs.mockResolvedValueOnce([
      { behaviorType: 'playful', intensity: 'mild', context: 'morning', createdAt: new Date() },
      { behaviorType: 'playful', intensity: 'moderate', context: 'morning, feeding', createdAt: new Date() },
      { behaviorType: 'anxious', intensity: 'severe', context: null, createdAt: new Date() },
    ]);
    const r = await behaviorDashboardService.getBehaviorPatterns('u1');
    expect(r[0].type).toBe('playful');
    expect(r[0].frequency).toBe(2);
    // Contexts deduplicated
    expect(r[0].commonContexts.sort()).toEqual(['feeding', 'morning']);
  });

  it('determines avgIntensity as severe when >30% of logs are severe', async () => {
    mockLogs.mockResolvedValueOnce([
      { behaviorType: 'aggressive', intensity: 'severe', context: null, createdAt: new Date() },
      { behaviorType: 'aggressive', intensity: 'severe', context: null, createdAt: new Date() },
      { behaviorType: 'aggressive', intensity: 'mild', context: null, createdAt: new Date() },
    ]);
    const r = await behaviorDashboardService.getBehaviorPatterns('u1');
    // 2/3 = 66% severe → avg should be 'severe'
    expect(r[0].avgIntensity).toBe('severe');
  });

  it('determines avgIntensity as moderate when >30% moderate (but <30% severe)', async () => {
    mockLogs.mockResolvedValueOnce([
      { behaviorType: 'playful', intensity: 'moderate', context: null, createdAt: new Date() },
      { behaviorType: 'playful', intensity: 'mild', context: null, createdAt: new Date() },
    ]);
    const r = await behaviorDashboardService.getBehaviorPatterns('u1');
    // 1/2 = 50% moderate → avg should be 'moderate'
    expect(r[0].avgIntensity).toBe('moderate');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getDailyTimeline
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorDashboardService — getDailyTimeline', () => {
  it('returns empty for an invalid date string (NaN guard)', async () => {
    const r = await behaviorDashboardService.getDailyTimeline('u1', 'not-a-date');
    expect(r).toEqual([]);
    expect(mockRange).not.toHaveBeenCalled();
  });

  it('maps repository results to TimelineEvent shape', async () => {
    const ts = new Date('2026-06-30T14:30:00.000Z');
    mockRange.mockResolvedValueOnce([
      { behaviorType: 'vocalization', intensity: 'moderate', description: 'meowing', context: 'night', createdAt: ts },
    ]);
    const r = await behaviorDashboardService.getDailyTimeline('u1', '2026-06-30');
    expect(r).toHaveLength(1);
    expect(r[0]).toEqual({
      timestamp: ts.toISOString(),
      behaviorType: 'vocalization',
      intensity: 'moderate',
      description: 'meowing',
      context: 'night',
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateInsights
// ─────────────────────────────────────────────────────────────────────────────
describe('BehaviorDashboardService — generateInsights', () => {
  it('returns insufficient-data message when no logs exist', async () => {
    mockLogs.mockResolvedValueOnce([]);
    const r = await behaviorDashboardService.generateInsights('u1');
    expect(r.overallTrend).toMatch(/insufficient/i);
    expect(r.recommendations).toContain('Begin documenting your cat\'s daily behaviors');
  });

  it('marks trend as "Needs attention" when aggression >2 or anxiety >3', async () => {
    mockLogs.mockResolvedValueOnce([{ behaviorType: 'aggressive', intensity: 'severe', createdAt: new Date() }]);
    mockFreq.mockResolvedValueOnce([
      { type: 'aggressive', count: 3 },
      { type: 'playful', count: 1 },
    ]);
    const r = await behaviorDashboardService.generateInsights('u1');
    expect(r.overallTrend).toBe('Needs attention');
    expect(r.primaryConcerns.some((c: string) => c.includes('Aggressive'))).toBe(true);
  });

  it('marks trend as "Healthy & engaged" with high play and low aggression', async () => {
    mockLogs.mockResolvedValueOnce([{ behaviorType: 'playful', intensity: 'mild', createdAt: new Date() }]);
    mockFreq.mockResolvedValueOnce([
      { type: 'playful', count: 5 },
      { type: 'affectionate', count: 3 },
      { type: 'aggressive', count: 0 },
    ]);
    const r = await behaviorDashboardService.generateInsights('u1');
    expect(r.overallTrend).toBe('Healthy & engaged');
    expect(r.positiveIndicators.some((p: string) => p.includes('play'))).toBe(true);
  });

  it('defaults trend to "Stable" when no threshold is crossed', async () => {
    mockLogs.mockResolvedValueOnce([{ behaviorType: 'vocalization', intensity: 'mild', createdAt: new Date() }]);
    mockFreq.mockResolvedValueOnce([{ type: 'vocalization', count: 2 }]);
    const r = await behaviorDashboardService.generateInsights('u1');
    expect(r.overallTrend).toBe('Stable');
  });
});
