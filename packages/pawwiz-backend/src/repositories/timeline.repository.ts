import { prisma } from '../lib/prisma.js';
import type { InsightSeverity as PrismaInsightSeverity } from '@prisma/client';
import type { InsightSeverity } from '../types/shared.js';

export interface FindInsightsOptions {
  severity?: InsightSeverity;
  limit?: number; // 1–100, default 10
}

export interface UpsertInsightData {
  catId: string;
  type: string;
  summary: string;
  detail: string;
  severity: InsightSeverity;
  eventIds: string[];
  source: string;
  generatedAt: Date;
}

class TimelineRepository {
  async findInsightsByCatId(catId: string, opts?: FindInsightsOptions) {
    const { severity, limit = 10 } = opts ?? {};
    const clampedLimit = Math.min(100, Math.max(1, limit));

    return prisma.healthTimelineInsight.findMany({
      where: {
        catId,
        ...(severity ? { severity: severity as PrismaInsightSeverity } : {}),
      },
      orderBy: { generatedAt: 'desc' },
      take: clampedLimit,
    });
  }

  async upsertInsight(data: UpsertInsightData) {
    const dayStart = new Date(data.generatedAt);
    dayStart.setUTCHours(0, 0, 0, 0);

    return prisma.healthTimelineInsight.upsert({
      where: {
        catId_type_generatedAt: {
          catId: data.catId,
          type: data.type,
          generatedAt: dayStart,
        },
      },
      update: {
        summary: data.summary,
        detail: data.detail,
        severity: data.severity as PrismaInsightSeverity,
        eventIds: data.eventIds,
        source: data.source,
      },
      create: {
        catId: data.catId,
        type: data.type,
        summary: data.summary,
        detail: data.detail,
        severity: data.severity as PrismaInsightSeverity,
        eventIds: data.eventIds,
        source: data.source,
        generatedAt: dayStart,
      },
    });
  }
}

export const timelineRepository = new TimelineRepository();
