/**
 * Service Layer — Behavior Dashboard
 * Aggregates behavior logs into insights, patterns, and timeline views
 */

import {
  getBehaviorLogsForUser,
  getBehaviorTypeFrequency,
  getAverageIntensityByType,
  getUniqueBehaviorTypes,
} from '../repositories/behavior-log.repository.js';
import { logger } from '../utils/winston.js';

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
    const behaviorTypes = await getUniqueBehaviorTypes(supabaseUserId, days);
    const patterns: BehaviorPattern[] = [];

    for (const type of behaviorTypes) {
      const logs = await getBehaviorLogsForUser(supabaseUserId, catId, days);
      const typeLogs = logs.filter(log => log.behaviorType === type);

      if (typeLogs.length === 0) continue;

      const intensities = await getAverageIntensityByType(supabaseUserId, type, days);
      const contexts = new Set<string>();

      for (const log of typeLogs) {
        if (log.context) {
          log.context.split(', ').forEach(ctx => contexts.add(ctx));
        }
      }

      patterns.push({
        type,
        frequency: typeLogs.length,
        lastObserved: typeLogs[0]!.createdAt.toISOString(),
        avgIntensity: this.determineAverageIntensity(intensities),
        intensityBreakdown: intensities,
        commonContexts: Array.from(contexts),
      });
    }

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
    const logs = await getBehaviorLogsForUser(supabaseUserId, catId, 365);
    
    // Filter to the specific date
    const dateLogs = logs.filter(log => {
      const logDate = log.createdAt.toISOString().split('T')[0];
      return logDate === date;
    });

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
