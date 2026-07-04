/**
 * Service Layer — Behavior Dashboard
 * Aggregates behavior logs into insights, patterns, and timeline views
 */

import {
  getBehaviorLogsForUser,
  getBehaviorTypeFrequency,
  getBehaviorLogsForDateRange,
} from '../repositories/behavior-log.repository.js';
import { logger } from '../utils/winston.js';

type IntensityBreakdown = { mild: number; moderate: number; severe: number };

interface DailyBehaviorSummary {
  date: string;
  totalEvents: number;
  topBehaviors: Array<{ type: string; count: number }>;
  avgIntensity: 'mild' | 'moderate' | 'severe';
}

interface WeeklySummary {
  week: string;
  days: DailyBehaviorSummary[];
  topBehaviors: Array<{ type: string; count: number }>;
  concernFlags: string[];
}

interface BehaviorPattern {
  type: string;
  frequency: number;
  lastObserved: string;
  avgIntensity: 'mild' | 'moderate' | 'severe';
  intensityBreakdown: { mild: number; moderate: number; severe: number };
  commonContexts: string[];
}

interface TimelineEvent {
  timestamp: string;
  behaviorType: string;
  intensity: 'mild' | 'moderate' | 'severe';
  description: string;
  context?: string;
}

interface InsightSummary {
  overallTrend: string;
  primaryConcerns: string[];
  positiveIndicators: string[];
  recommendations: string[];
}

class BehaviorDashboardService {
  /**
   * Get weekly behavior summary with daily breakdowns
   */
  async getWeeklySummary(supabaseUserId: string, catId?: string): Promise<WeeklySummary> {
    const logs = await getBehaviorLogsForUser(supabaseUserId, catId, 7);

    if (logs.length === 0) {
      return {
        week: this.getWeekLabel(),
        days: [],
        topBehaviors: [],
        concernFlags: [],
      };
    }

    // Group logs by day
    const dayMap = new Map<string, typeof logs>();
    for (const log of logs) {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!dayMap.has(date)) {
        dayMap.set(date, []);
      }
      dayMap.get(date)!.push(log);
    }

    // Create daily summaries
    const days: DailyBehaviorSummary[] = [];
    for (const [date, dayLogs] of dayMap.entries()) {
      const behaviorCounts = new Map<string, number>();
      let severityCount = 0;

      for (const log of dayLogs) {
        behaviorCounts.set(log.behaviorType, (behaviorCounts.get(log.behaviorType) || 0) + 1);
        if (log.intensity === 'severe') severityCount++;
      }

      const topBehaviors = Array.from(behaviorCounts.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      days.push({
        date,
        totalEvents: dayLogs.length,
        topBehaviors,
        avgIntensity: severityCount > dayLogs.length / 2 ? 'severe' : 'moderate',
      });
    }

    // Get overall top behaviors
    const behaviorFreq = await getBehaviorTypeFrequency(supabaseUserId, 7);
    const topBehaviors = behaviorFreq
      .map(item => ({ type: item.type, count: item.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Generate concern flags
    const concernFlags: string[] = [];
    
    // Check for aggressive behavior
    const aggressiveCount = behaviorFreq.find(b => b.type === 'aggressive')?.count || 0;
    if (aggressiveCount > 2) {
      concernFlags.push('Elevated aggressive behavior detected');
    }

    // Check for anxiety patterns
    const anxiousCount = behaviorFreq.find(b => b.type === 'anxious')?.count || 0;
    if (anxiousCount > 3) {
      concernFlags.push('Frequent anxiety observed');
    }

    // Check for lethargy
    const lethargyCount = behaviorFreq.find(b => b.type === 'lethargic')?.count || 0;
    if (lethargyCount > 4) {
      concernFlags.push('Low energy patterns noticed');
    }

    return {
      week: this.getWeekLabel(),
      days: days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      topBehaviors,
      concernFlags,
    };
  }

  /**
   * Get detailed behavior patterns over a period
   */
  async getBehaviorPatterns(
    supabaseUserId: string,
    catId?: string,
    days: number = 7
  ): Promise<BehaviorPattern[]> {
    // Single fetch — logs are ordered newest-first by the repository. All
    // per-type aggregation (frequency, intensity breakdown, contexts) is derived
    // in memory, eliminating the previous N+1 (one query per behavior type plus
    // a redundant re-fetch inside the loop).
    const logs = await getBehaviorLogsForUser(supabaseUserId, catId, days);

    const grouped = new Map<string, {
      frequency: number;
      lastObserved: string;
      intensity: IntensityBreakdown;
      contexts: Set<string>;
    }>();

    for (const log of logs) {
      let entry = grouped.get(log.behaviorType);
      if (!entry) {
        entry = {
          frequency: 0,
          lastObserved: log.createdAt.toISOString(), // first seen = newest (desc order)
          intensity: { mild: 0, moderate: 0, severe: 0 },
          contexts: new Set<string>(),
        };
        grouped.set(log.behaviorType, entry);
      }
      entry.frequency += 1;
      if (log.intensity in entry.intensity) {
        entry.intensity[log.intensity as keyof IntensityBreakdown] += 1;
      }
      if (log.context) {
        log.context.split(', ').forEach(ctx => entry!.contexts.add(ctx));
      }
    }

    const patterns: BehaviorPattern[] = Array.from(grouped.entries()).map(([type, entry]) => ({
      type,
      frequency: entry.frequency,
      lastObserved: entry.lastObserved,
      avgIntensity: this.determineAverageIntensity(entry.intensity),
      intensityBreakdown: entry.intensity,
      commonContexts: Array.from(entry.contexts),
    }));

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get daily timeline of behaviors for a specific date
   */
  async getDailyTimeline(
    supabaseUserId: string,
    date: string,
    catId?: string
  ): Promise<TimelineEvent[]> {
    // Bound the query to the requested UTC day instead of pulling 365 days into
    // memory and filtering client-side.
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    if (Number.isNaN(dayStart.getTime()) || Number.isNaN(dayEnd.getTime())) {
      return [];
    }

    const dateLogs = await getBehaviorLogsForDateRange(supabaseUserId, dayStart, dayEnd, catId);

    return dateLogs.map(log => ({
      timestamp: log.createdAt.toISOString(),
      behaviorType: log.behaviorType,
      intensity: log.intensity as 'mild' | 'moderate' | 'severe',
      description: log.description,
      context: log.context ?? undefined,
    }));
  }

  /**
   * Generate AI insights summary
   */
  async generateInsights(supabaseUserId: string, catId?: string): Promise<InsightSummary> {
    const logs = await getBehaviorLogsForUser(supabaseUserId, catId, 7);

    if (logs.length === 0) {
      return {
        overallTrend: 'Insufficient data. Start logging behaviors to see trends.',
        primaryConcerns: [],
        positiveIndicators: [],
        recommendations: ['Begin documenting your cat\'s daily behaviors'],
      };
    }

    const behaviorFreq = await getBehaviorTypeFrequency(supabaseUserId, 7);
    const primaryConcerns: string[] = [];
    const positiveIndicators: string[] = [];
    const recommendations: string[] = [];

    // Analyze behaviors
    for (const item of behaviorFreq) {
      if (item.type === 'aggressive' && item.count >= 2) {
        primaryConcerns.push(`Aggressive episodes: ${item.count} incidents`);
        recommendations.push('Consider scheduling a vet behavioral consultation');
      }
      if (item.type === 'anxious' && item.count >= 3) {
        primaryConcerns.push(`Anxiety patterns: ${item.count} events`);
        recommendations.push('Create safe spaces and maintain consistent routines');
      }
      if (item.type === 'lethargic' && item.count >= 4) {
        primaryConcerns.push(`Low activity levels: ${item.count} observations`);
        recommendations.push('Encourage interactive play and monitor for health issues');
      }
      if (item.type === 'affectionate' && item.count >= 3) {
        positiveIndicators.push(`Strong bonding signals: ${item.count} affectionate moments`);
      }
      if (item.type === 'playful' && item.count >= 3) {
        positiveIndicators.push(`Active play observed: ${item.count} play sessions`);
      }
    }

    // Determine overall trend
    const aggressionRatio = behaviorFreq.find(b => b.type === 'aggressive')?.count || 0;
    const playRatio = behaviorFreq.find(b => b.type === 'playful')?.count || 0;
    const anxietyRatio = behaviorFreq.find(b => b.type === 'anxious')?.count || 0;

    let overallTrend = 'Stable';
    if (aggressionRatio > 2 || anxietyRatio > 3) {
      overallTrend = 'Needs attention';
    } else if (playRatio >= 3 && aggressionRatio <= 1) {
      overallTrend = 'Healthy & engaged';
    }

    return {
      overallTrend,
      primaryConcerns: primaryConcerns.length > 0 ? primaryConcerns : ['None observed'],
      positiveIndicators: positiveIndicators.length > 0 ? positiveIndicators : ['Monitor for patterns'],
      recommendations: recommendations.length > 0 ? recommendations : ['Keep tracking for better insights'],
    };
  }

  /**
   * Helper: Determine average intensity from breakdown
   */
  private determineAverageIntensity(breakdown: {
    mild: number;
    moderate: number;
    severe: number;
  }): 'mild' | 'moderate' | 'severe' {
    const total = breakdown.mild + breakdown.moderate + breakdown.severe;
    if (total === 0) return 'mild';

    const severeRatio = breakdown.severe / total;
    const moderateRatio = breakdown.moderate / total;

    if (severeRatio > 0.3) return 'severe';
    if (moderateRatio > 0.3) return 'moderate';
    return 'mild';
  }

  /**
   * Helper: Get week label (e.g., "Week of Nov 25 - Dec 1")
   */
  private getWeekLabel(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const mondayDate = new Date(now.setDate(diff));
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);

    const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Week of ${format(mondayDate)} - ${format(sundayDate)}`;
  }
}

export const behaviorDashboardService = new BehaviorDashboardService();
