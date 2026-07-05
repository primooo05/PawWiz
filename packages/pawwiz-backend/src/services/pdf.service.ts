/**
 * Service Layer — PDF Export
 * Server-side PDF generation using pdfkit (pure Node.js, no Chromium required).
 *
 * Sections (in order):
 *   1. Cover page — cat photo (optional), name, breed, sex, life stage, age, date range
 *   2. Events by day — grouped by calendar day, ascending order
 *   3. Insights section — CorrelationInsight list
 *   4. Water summary — total ml + daily average
 *   5. Owner notes — sanitized, if provided
 *
 * All date rendering uses en-US locale (Requirement 10.5).
 * Singleton Pattern — exported as a single instance.
 */

import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma.js';
import { timelineService } from './timeline.service.js';
import { timelineRepository } from '../repositories/timeline.repository.js';
import { sanitizeInsightInput } from './insight.service.js';
import { AppError } from '../utils/errors.js';
import type { HealthEvent } from '../types/shared.js';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface PdfExportOptions {
  catId: string;
  supabaseUserId: string;
  startDate: Date;
  endDate: Date;
  /** max 500 chars, sanitized before inclusion */
  ownerNotes?: string;
}

// ─── Date formatting helpers ──────────────────────────────────────────────────

function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
}

function formatTimeShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date);
}

function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// ─── Source icon text helpers ─────────────────────────────────────────────────

function sourceIcon(source: HealthEvent['source']): string {
  switch (source) {
    case 'behavior':  return '[behavior]';
    case 'diet':      return '[diet]';
    case 'pregnancy': return '[pregnancy]';
    case 'heat':      return '[heat]';
    default:          return '[event]';
  }
}

// ─── Fetch image helper ───────────────────────────────────────────────────────

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    // Timeout or network error — skip gracefully
    return null;
  }
}

// ─── Service class ────────────────────────────────────────────────────────────

class PdfService {
  /**
   * Generate a health summary PDF for the given cat and date range.
   * Returns a Buffer containing the complete PDF binary.
   */
  async generateHealthSummary(opts: PdfExportOptions): Promise<Buffer> {
    const { catId, supabaseUserId, startDate, endDate, ownerNotes } = opts;

    // ── 1. Verify ownership (throws AppError.forbidden if not owner) ──────────
    await timelineService.verifyOwnership(catId, supabaseUserId);

    // ── 2. Aggregate events ───────────────────────────────────────────────────
    const aggregateResult = await timelineService.aggregateForCat(
      catId,
      supabaseUserId,
      { startDate, endDate, limit: 100 },
    );

    if (aggregateResult.events.length === 0) {
      throw AppError.badRequest('No health events found in the selected date range.');
    }

    // ── 3. Get insights ───────────────────────────────────────────────────────
    const insights = await timelineRepository.findInsightsByCatId(catId, { limit: 100 });

    // ── 4. Get cat info ───────────────────────────────────────────────────────
    const cat = await prisma.cat.findUnique({
      where: { id: catId },
      select: {
        name: true,
        breed: true,
        sex: true,
        lifeStage: true,
        age: true,
        photoUrl: true,
      },
    });

    // ── 5. Build PDF ──────────────────────────────────────────────────────────
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // ── Section 1: Cover page ─────────────────────────────────────────────────
    let photoEmbedded = false;

    if (cat?.photoUrl) {
      const imgBuffer = await fetchImageBuffer(cat.photoUrl);
      if (imgBuffer) {
        try {
          doc.image(imgBuffer, 40, 40, { width: 80, height: 80 });
          photoEmbedded = true;
        } catch {
          // If embedding fails (unsupported format etc.), skip gracefully
        }
      }
    }

    // Cat name — 24pt bold
    const nameX = photoEmbedded ? 140 : 40;
    const nameY = 40;
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(cat?.name ?? 'Unknown Cat', nameX, nameY);

    // Cat details — 10pt regular, each as key-value pair
    doc.fontSize(10).font('Helvetica');
    const details: Array<[string, string | number | null | undefined]> = [
      ['Breed',       cat?.breed],
      ['Sex',         cat?.sex],
      ['Life Stage',  cat?.lifeStage],
      ['Age',         cat?.age != null ? `${cat.age} year${cat.age === 1 ? '' : 's'}` : undefined],
    ];

    let detailY = nameY + 36;
    for (const [label, value] of details) {
      if (value == null || value === '') continue;
      doc.text(`${label}: ${String(value)}`, nameX, detailY);
      detailY += 14;
    }

    // Date range summary at the bottom of the cover
    const coverBottom = 780; // near page bottom (A4 height ~842pt, margin 40 → bottom ~802)
    doc
      .fontSize(12)
      .font('Helvetica')
      .text(
        `Health Summary: ${formatDateLong(startDate)} to ${formatDateLong(endDate)}`,
        40,
        coverBottom,
        { align: 'center' },
      );

    // ── Section 2: Events by day (new page) ───────────────────────────────────
    doc.addPage();

    // Sort events ascending (oldest first)
    const eventsAsc = [...aggregateResult.events].sort((a, b) =>
      a.occurredAt.localeCompare(b.occurredAt),
    );

    // Group by calendar day (YYYY-MM-DD in UTC)
    const eventsByDay = new Map<string, HealthEvent[]>();
    for (const event of eventsAsc) {
      const dayKey = event.occurredAt.slice(0, 10); // YYYY-MM-DD
      const bucket = eventsByDay.get(dayKey) ?? [];
      bucket.push(event);
      eventsByDay.set(dayKey, bucket);
    }

    doc.fontSize(18).font('Helvetica-Bold').text('Health Events', { underline: true });
    doc.moveDown(0.5);

    for (const [dayKey, dayEvents] of eventsByDay) {
      // Day heading — en-US long date
      const dayDate = new Date(`${dayKey}T12:00:00.000Z`); // noon UTC to avoid timezone flips
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(formatDateLong(dayDate));
      doc.moveDown(0.2);

      for (const event of dayEvents) {
        const icon = sourceIcon(event.source);
        const eventTime = formatTimeShort(new Date(event.occurredAt));

        // Bullet line: "[source] **Title** — description  (h:mm AM/PM)
        doc.fontSize(10);

        // Write icon in regular font
        doc.font('Helvetica').text(`• ${icon} `, { continued: true });
        // Title in bold
        doc.font('Helvetica-Bold').text(event.title, { continued: true });
        // Dash + description + time in regular
        doc
          .font('Helvetica')
          .text(` — ${event.description}  ${eventTime}`);

        doc.moveDown(0.1);
      }

      doc.moveDown(0.5);
    }

    // ── Section 3: Insights ───────────────────────────────────────────────────
    doc.moveDown(0.5);
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Health Insights', { underline: true });
    doc.moveDown(0.3);

    if (insights.length === 0) {
      doc.fontSize(10).font('Helvetica').text('No insights available for this period.');
    } else {
      for (const insight of insights) {
        // Type slug as sub-heading
        doc.fontSize(12).font('Helvetica-Bold').text(insight.type);
        doc.fontSize(10).font('Helvetica');
        doc.text(insight.summary);
        doc.text(insight.detail);
        doc.text(`(${insight.severity})`);
        doc.moveDown(0.5);
      }
    }

    // ── Section 4: Water summary ──────────────────────────────────────────────
    doc.moveDown(0.5);
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Water Intake Summary', { underline: true });
    doc.moveDown(0.3);

    const waterEvents = aggregateResult.events.filter(
      (e) => e.eventType === 'water_updated',
    );

    const totalWaterMl = waterEvents.reduce((sum, e) => {
      const ml = e.metadata?.waterMl;
      return sum + (typeof ml === 'number' ? ml : 0);
    }, 0);

    // Number of days in range (inclusive)
    const msPerDay = 24 * 60 * 60 * 1000;
    const dayCount = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay),
    );
    const dailyAvg = Math.round((totalWaterMl / dayCount) * 10) / 10;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Total: ${totalWaterMl} ml | Daily Average: ${dailyAvg} ml/day`);

    // ── Section 5: Owner notes ────────────────────────────────────────────────
    if (ownerNotes && ownerNotes.trim().length > 0) {
      const sanitized = sanitizeInsightInput(ownerNotes.slice(0, 500));
      doc.moveDown(0.5);
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Owner Notes', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica').text(sanitized);
    }

    doc.end();
    return bufferPromise;
  }

  /**
   * Derives the download filename for a health summary PDF.
   *
   * Format: `pawwiz-health-{catName}-{startDate}-to-{endDate}.pdf`
   * - catName: lowercase, spaces → hyphens, non-alphanumeric/hyphen chars stripped
   * - dates: YYYY-MM-DD (ISO date only)
   *
   * Example: `pawwiz-health-whiskers-2026-06-01-to-2026-06-30.pdf`
   */
  deriveFilename(catName: string, startDate: Date, endDate: Date): string {
    const slug = catName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const start = formatDateIso(startDate);
    const end = formatDateIso(endDate);

    return `pawwiz-health-${slug}-${start}-to-${end}.pdf`;
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const pdfService = new PdfService();
