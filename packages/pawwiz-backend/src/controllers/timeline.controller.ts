/**
 * Controller Layer — Unified Health Timeline
 * Handles HTTP endpoints for the timeline, insights, on-demand refresh, and PDF export.
 */

import type { Request, Response } from 'express';
import { withErrorHandling } from './base.controller.js';
import { timelineService } from '../services/timeline.service.js';
import { insightService } from '../services/insight.service.js';
import { pdfService } from '../services/pdf.service.js';
import { prisma } from '../lib/prisma.js';
import type { EventSource } from '../types/shared.js';

export const timelineController = {
  /** GET /api/timeline/:catId */
  getTimeline: withErrorHandling(async (req: Request, res: Response) => {
    const supabaseUserId = (req as any).user?.sub as string;
    const catId = req.params.catId as string;

    const q = (req as any).validatedQuery ?? req.query;

    const startDate = q.startDate
      ? new Date(q.startDate as string)
      : undefined;

    const endDate = q.endDate
      ? new Date(q.endDate as string)
      : undefined;

    const sources = (q.sources as string | undefined)
      ?.split(',')
      .filter(Boolean) as EventSource[] | undefined;

    const limit = q.limit as unknown as number | undefined;

    const cursor = q.cursor
      ? new Date(q.cursor as string)
      : undefined;

    const result = await timelineService.aggregateForCat(catId, supabaseUserId, {
      startDate,
      endDate,
      sources,
      limit,
      cursor,
    });

    res.json({
      data: result.events,
      pagination: result.pagination,
      errors: result.errors,
    });
  }),

  /** GET /api/timeline/:catId/insights */
  getInsights: withErrorHandling(async (req: Request, res: Response) => {
    const supabaseUserId = (req as any).user?.sub as string;
    const catId = req.params.catId as string;

    const q = (req as any).validatedQuery ?? req.query;
    const severity = q.severity as string | undefined;

    // Verify ownership before returning insights — the catId comes from the
    // URL and must belong to the authenticated caller.
    await timelineService.verifyOwnership(catId, supabaseUserId);

    const insights = await insightService.getInsightsForCat(catId, { severity });

    res.json({ data: insights });
  }),

  /** POST /api/timeline/:catId/insights/refresh */
  refreshInsights: withErrorHandling(async (req: Request, res: Response) => {
    const supabaseUserId = (req as any).user?.sub as string;
    const catId = req.params.catId as string;

    await insightService.triggerOnDemandRefresh(catId, supabaseUserId);

    res.status(202).json({ message: 'Refresh job started' });
  }),

  /** POST /api/timeline/:catId/export/pdf */
  exportPdf: withErrorHandling(async (req: Request, res: Response) => {
    const supabaseUserId = (req as any).user?.sub as string;
    const catId = req.params.catId as string;

    const { startDate: startDateRaw, endDate: endDateRaw, ownerNotes } = req.body as {
      startDate: string;
      endDate: string;
      ownerNotes?: string;
    };

    const startDate = new Date(startDateRaw);
    const endDate = new Date(endDateRaw);

    const pdfBuffer = await pdfService.generateHealthSummary({
      catId,
      supabaseUserId,
      startDate,
      endDate,
      ownerNotes,
    });

    const cat = await prisma.cat.findUnique({
      where: { id: catId },
      select: { name: true },
    });

    const filename = pdfService.deriveFilename(cat?.name ?? 'cat', startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.end(pdfBuffer);
  }),
};
