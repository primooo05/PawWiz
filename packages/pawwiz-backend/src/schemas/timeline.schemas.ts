import { z } from 'zod';

const isoTimestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export const getTimelineQuerySchema = z.object({
  startDate: z.string().regex(isoTimestampRegex).optional(),
  endDate:   z.string().regex(isoTimestampRegex).optional(),
  sources:   z.string().optional(), // comma-separated EventSource values; parsed in service
  limit:     z.coerce.number().int().min(1).max(100).default(50),
  cursor:    z.string().regex(isoTimestampRegex).optional(),
});

export const getInsightsQuerySchema = z.object({
  severity: z.enum(['info', 'warning', 'concern']).optional(),
  limit:    z.coerce.number().int().min(1).max(100).default(10),
});

export const exportPdfBodySchema = z.object({
  startDate:  z.string().regex(isoTimestampRegex),
  endDate:    z.string().regex(isoTimestampRegex),
  ownerNotes: z.string().max(500).optional(),
});
