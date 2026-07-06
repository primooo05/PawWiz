/**
 * Service Layer — PDF Export (Health Fact Sheet style)
 * Server-side PDF generation using pdfkit.
 *
 * Layout mirrors the Health Fact Sheet design:
 *   - Teal left sidebar: cat photo, name, vital stats, owner notes
 *   - Main content: summary stats bar, bar charts, event table, insights
 *
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

// ─── Design tokens ─────────────────────────────────────────────────────────────

const TEAL       = '#2EC4B6';
const TEAL_DARK  = '#1A9E92';
const TEAL_LIGHT = '#E6F9F8';
const DARK       = '#1A1A2E';
const GRAY       = '#6B7280';
const GRAY_LIGHT = '#F3F4F6';
const WHITE      = '#FFFFFF';
const WARN       = '#F59E0B';
const CONCERN    = '#EF4444';
const INFO_CLR   = '#3B82F6';

const SIDEBAR_W  = 170;
const PAGE_W     = 595;   // A4 width in pt
const PAGE_H     = 842;   // A4 height in pt
const MARGIN     = 40;
const MAIN_X     = SIDEBAR_W + MARGIN;
const MAIN_W     = PAGE_W - MAIN_X - MARGIN;

// ─── Date/time helpers ────────────────────────────────────────────────────────

function fmtLong(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(date);
}
function fmtShort(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date);
}
function fmtDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
function fmtMonthDay(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
}

// ─── Image fetch helper ───────────────────────────────────────────────────────

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

// ─── Source label helper ──────────────────────────────────────────────────────

function sourceLabel(source: HealthEvent['source']): string {
  switch (source) {
    case 'behavior':  return 'Behavior';
    case 'diet':      return 'Diet';
    case 'pregnancy': return 'Pregnancy';
    case 'heat':      return 'Heat';
    default:          return 'Event';
  }
}

function sourceColor(source: HealthEvent['source']): string {
  switch (source) {
    case 'behavior':  return '#8B5CF6';
    case 'diet':      return TEAL;
    case 'pregnancy': return '#EC4899';
    case 'heat':      return '#F97316';
    default:          return GRAY;
  }
}

function severityColor(severity: string): string {
  if (severity === 'concern') return CONCERN;
  if (severity === 'warning') return WARN;
  return INFO_CLR;
}

// ─── Low-level drawing helpers ────────────────────────────────────────────────

type Doc = InstanceType<typeof PDFDocument>;

/** Filled rounded rectangle (pdfkit rect + roundedCorners) */
function fillRoundedRect(doc: Doc, x: number, y: number, w: number, h: number, r: number, color: string) {
  doc.save().roundedRect(x, y, w, h, r).fill(color).restore();
}

/** Stroked rounded rectangle */
function strokeRoundedRect(doc: Doc, x: number, y: number, w: number, h: number, r: number, color: string, lineWidth = 1) {
  doc.save().lineWidth(lineWidth).roundedRect(x, y, w, h, r).stroke(color).restore();
}

/** Horizontal rule */
function hRule(doc: Doc, x: number, y: number, w: number, color = TEAL, lw = 0.5) {
  doc.save().lineWidth(lw).moveTo(x, y).lineTo(x + w, y).stroke(color).restore();
}

/** Small colored dot */
function dot(doc: Doc, x: number, y: number, r: number, color: string) {
  doc.save().circle(x, y, r).fill(color).restore();
}

/** Stat card: colored top bar + number + label */
function statCard(doc: Doc, x: number, y: number, w: number, value: string, label: string, color: string) {
  const h = 52;
  strokeRoundedRect(doc, x, y, w, h, 4, '#E5E7EB');
  doc.save().rect(x, y, w, 4).fill(color).restore();
  doc.save()
    .fontSize(18).font('Helvetica-Bold').fillColor(DARK)
    .text(value, x, y + 10, { width: w, align: 'center' })
    .fontSize(7).font('Helvetica').fillColor(GRAY)
    .text(label.toUpperCase(), x, y + 32, { width: w, align: 'center' })
    .restore();
}

/** Horizontal bar chart.
 *  items: [{label, value, color}]  maxValue: scale ceiling
 *  Returns the Y position after the last bar.
 */
function barChart(
  doc: Doc,
  x: number,
  y: number,
  chartW: number,
  items: Array<{ label: string; value: number; color: string }>,
  maxValue: number,
): number {
  const BAR_H = 12;
  const GAP   = 8;
  const LABEL_W = 76;
  const BAR_X  = x + LABEL_W + 4;
  const BAR_W  = chartW - LABEL_W - 34;

  let cy = y;
  const safeMax = maxValue > 0 ? maxValue : 1;

  for (const item of items) {
    const fillW = Math.max(2, (item.value / safeMax) * BAR_W);

    // Background track
    doc.save().rect(BAR_X, cy, BAR_W, BAR_H).fill('#E5E7EB').restore();
    // Filled bar
    doc.save().rect(BAR_X, cy, fillW, BAR_H).fill(item.color).restore();
    // Label left
    doc.save().fontSize(8).font('Helvetica').fillColor(DARK)
      .text(item.label, x, cy + 1, { width: LABEL_W, ellipsis: true })
      .restore();
    // Value right
    doc.save().fontSize(8).font('Helvetica-Bold').fillColor(DARK)
      .text(String(item.value), BAR_X + BAR_W + 4, cy + 1, { width: 26 })
      .restore();

    cy += BAR_H + GAP;
  }
  return cy;
}

/** Donut-style pie split into two segments (two values only, for gender/ratio).
 *  Returns bottom Y of the chart.
 */
function donutTwo(
  doc: Doc,
  cx: number,
  cy: number,
  r: number,
  valueA: number,
  valueB: number,
  colorA: string,
  colorB: string,
  labelA: string,
  labelB: string,
): number {
  const total = valueA + valueB;
  if (total === 0) return cy + r + 16;

  // pdfkit draws arcs in degrees; we use two wedge fills via path
  const angleA = (valueA / total) * 360;
  const inner  = r * 0.56; // inner radius for donut hole

  // Draw background circle first
  doc.save().circle(cx, cy, r).fill(colorB).restore();

  // Clip the A wedge using arc path
  const startRad = -Math.PI / 2;
  const endRad   = startRad + (angleA / 180) * Math.PI;
  doc.save()
    .moveTo(cx, cy)
    .arc(cx, cy, r, startRad, endRad)
    .lineTo(cx, cy)
    .fill(colorA)
    .restore();

  // Hole
  doc.save().circle(cx, cy, inner).fill(WHITE).restore();

  // Legend below
  const legendY = cy + r + 6;
  dot(doc, cx - 28, legendY + 4, 4, colorA);
  doc.save().fontSize(7).font('Helvetica').fillColor(DARK)
    .text(`${labelA} ${Math.round((valueA / total) * 100)}%`, cx - 20, legendY, { width: 44 })
    .restore();
  dot(doc, cx + 14, legendY + 4, 4, colorB);
  doc.save().fontSize(7).font('Helvetica').fillColor(DARK)
    .text(`${labelB} ${Math.round((valueB / total) * 100)}%`, cx + 22, legendY, { width: 44 })
    .restore();

  return legendY + 14;
}

/** Simple data table with alternating row shading.
 * columns: [{header, key, width}]
 * rows: array of string arrays matching column order
 * Returns bottom Y.
 */
function dataTable(
  doc: Doc,
  x: number,
  y: number,
  columns: Array<{ header: string; width: number }>,
  rows: string[][],
): number {
  const ROW_H = 16;
  const totalW = columns.reduce((s, c) => s + c.width, 0);

  // Header row background
  doc.save().rect(x, y, totalW, ROW_H).fill(TEAL).restore();

  let cx = x;
  for (const col of columns) {
    doc.save().fontSize(7).font('Helvetica-Bold').fillColor(WHITE)
      .text(col.header.toUpperCase(), cx + 4, y + 4, { width: col.width - 8 })
      .restore();
    cx += col.width;
  }

  let ry = y + ROW_H;
  for (let i = 0; i < rows.length; i++) {
    const bg = i % 2 === 0 ? WHITE : GRAY_LIGHT;
    doc.save().rect(x, ry, totalW, ROW_H).fill(bg).restore();

    let rcx = x;
    for (let j = 0; j < columns.length; j++) {
      doc.save().fontSize(7.5).font('Helvetica').fillColor(DARK)
        .text(rows[i][j] ?? '', rcx + 4, ry + 4, { width: columns[j].width - 8, ellipsis: true })
        .restore();
      rcx += columns[j].width;
    }
    ry += ROW_H;
  }

  // Bottom border
  doc.save().lineWidth(0.5).moveTo(x, ry).lineTo(x + totalW, ry).stroke(TEAL).restore();
  return ry + 4;
}

// ─── Sidebar renderer ─────────────────────────────────────────────────────────

async function renderSidebar(
  doc: Doc,
  cat: { name: string; breed?: string | null; sex?: string | null; lifeStage?: string | null; age?: number | null; photoUrl?: string | null } | null,
  startDate: Date,
  endDate: Date,
  ownerNotes: string,
  totalEvents: number,
) {
  // Full-height teal background
  doc.save().rect(0, 0, SIDEBAR_W, PAGE_H).fill(TEAL).restore();

  let sy = 28;

  // Cat photo — circular clip
  const PHOTO_R = 44;
  const PHOTO_CX = SIDEBAR_W / 2;
  const PHOTO_CY = sy + PHOTO_R;
  doc.save().circle(PHOTO_CX, PHOTO_CY, PHOTO_R).fill(TEAL_DARK).restore();

  let photoEmbedded = false;
  if (cat?.photoUrl) {
    const buf = await fetchImageBuffer(cat.photoUrl);
    if (buf) {
      try {
        doc.save()
          .circle(PHOTO_CX, PHOTO_CY, PHOTO_R)
          .clip()
          .image(buf, PHOTO_CX - PHOTO_R, PHOTO_CY - PHOTO_R, { width: PHOTO_R * 2, height: PHOTO_R * 2, cover: [PHOTO_R * 2, PHOTO_R * 2] as [number, number] })
          .restore();
        photoEmbedded = true;
      } catch {
        // skip
      }
    }
  }

  if (!photoEmbedded) {
    // Paw placeholder text
    doc.save().fontSize(28).fillColor(WHITE).text('🐾', PHOTO_CX - 16, PHOTO_CY - 16).restore();
  }

  sy = PHOTO_CY + PHOTO_R + 14;

  // Cat name
  doc.save().fontSize(14).font('Helvetica-Bold').fillColor(WHITE)
    .text(cat?.name ?? 'Unknown Cat', 10, sy, { width: SIDEBAR_W - 20, align: 'center' })
    .restore();
  sy += 20;

  // Divider
  hRule(doc, 16, sy, SIDEBAR_W - 32, 'rgba(255,255,255,0.4)');
  sy += 10;

  // Vital details
  const vitals: Array<[string, string | null | undefined]> = [
    ['Life Stage', cat?.lifeStage],
    ['Sex',        cat?.sex],
    ['Breed',      cat?.breed],
    ['Age',        cat?.age != null ? `${cat.age} yr${cat.age === 1 ? '' : 's'}` : null],
  ];

  for (const [label, value] of vitals) {
    if (!value) continue;
    doc.save().fontSize(6.5).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.65)')
      .text(label.toUpperCase(), 12, sy, { width: SIDEBAR_W - 24 })
      .restore();
    doc.save().fontSize(9).font('Helvetica-Bold').fillColor(WHITE)
      .text(value, 12, sy + 9, { width: SIDEBAR_W - 24 })
      .restore();
    sy += 26;
  }

  hRule(doc, 16, sy, SIDEBAR_W - 32, 'rgba(255,255,255,0.4)');
  sy += 10;

  // Date range label
  doc.save().fontSize(6.5).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.65)')
    .text('REPORT PERIOD', 12, sy, { width: SIDEBAR_W - 24 })
    .restore();
  sy += 10;
  doc.save().fontSize(8).font('Helvetica').fillColor(WHITE)
    .text(`${fmtLong(startDate)}`, 12, sy, { width: SIDEBAR_W - 24 })
    .restore();
  sy += 12;
  doc.save().fontSize(8).font('Helvetica').fillColor(WHITE)
    .text(`to ${fmtLong(endDate)}`, 12, sy, { width: SIDEBAR_W - 24 })
    .restore();
  sy += 20;

  hRule(doc, 16, sy, SIDEBAR_W - 32, 'rgba(255,255,255,0.4)');
  sy += 10;

  // Owner Notes section
  doc.save().fontSize(6.5).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.65)')
    .text('OWNER NOTES', 12, sy, { width: SIDEBAR_W - 24 })
    .restore();
  sy += 10;

  // Notes box
  const notesBoxH = Math.max(60, Math.min(140, PAGE_H - sy - 20));
  fillRoundedRect(doc, 10, sy, SIDEBAR_W - 20, notesBoxH, 6, 'rgba(255,255,255,0.15)');

  const notesText = ownerNotes.trim() || 'No notes provided.';
  doc.save().fontSize(8).font('Helvetica').fillColor(WHITE)
    .text(notesText, 16, sy + 8, { width: SIDEBAR_W - 32, height: notesBoxH - 16, lineGap: 2 })
    .restore();
}

// ─── Analytics helpers ────────────────────────────────────────────────────────

/** Count events by source */
function countBySource(events: HealthEvent[]): Record<string, number> {
  return events.reduce<Record<string, number>>((acc, e) => {
    acc[e.source] = (acc[e.source] ?? 0) + 1;
    return acc;
  }, {});
}

/** Count events by calendar day (YYYY-MM-DD UTC) */
function countByDay(events: HealthEvent[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of events) {
    const day = e.occurredAt.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  return map;
}

/** Behavior intensity breakdown */
function behaviorIntensityCounts(events: HealthEvent[]): { mild: number; moderate: number; severe: number } {
  let mild = 0, moderate = 0, severe = 0;
  for (const e of events) {
    if (e.source !== 'behavior') continue;
    const i = (e.metadata?.intensity as string | undefined) ?? '';
    if (i === 'mild') mild++;
    else if (i === 'moderate') moderate++;
    else if (i === 'severe') severe++;
  }
  return { mild, moderate, severe };
}

/** Top behavior types */
function topBehaviorTypes(events: HealthEvent[], topN = 5): Array<{ label: string; value: number }> {
  const counts: Record<string, number> = {};
  for (const e of events) {
    if (e.source !== 'behavior') continue;
    const t = (e.metadata?.behaviorType as string | undefined) ?? 'unknown';
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value }));
}

/** Top meal types logged */
function topMealTypes(events: HealthEvent[]): Array<{ label: string; value: number }> {
  const counts: Record<string, number> = {};
  for (const e of events) {
    if (e.eventType !== 'meal_logged') continue;
    const t = (e.metadata?.mealType as string | undefined) ?? 'Other';
    counts[t] = (counts[t] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
}

/** Total water ml across all water_updated events */
function totalWaterMl(events: HealthEvent[]): number {
  return events.reduce((sum, e) => {
    if (e.eventType !== 'water_updated') return sum;
    const ml = e.metadata?.waterMl;
    return sum + (typeof ml === 'number' ? ml : 0);
  }, 0);
}

// ─── Main content renderer ────────────────────────────────────────────────────

async function renderMainContent(
  doc: Doc,
  events: HealthEvent[],
  insights: Awaited<ReturnType<typeof timelineRepository.findInsightsByCatId>>,
  startDate: Date,
  endDate: Date,
) {
  const mx = MAIN_X;
  let my = MARGIN;

  // ── Header ──────────────────────────────────────────────────────────────────

  // Large version number / accent top-right (Health Fact Sheet style "3.0" watermark)
  doc.save().fontSize(64).font('Helvetica-Bold').fillColor(TEAL_LIGHT)
    .text('PW', PAGE_W - 100, 8, { width: 90, align: 'right' })
    .restore();

  doc.save().fontSize(18).font('Helvetica-Bold').fillColor(DARK)
    .text('Health Fact Sheet', mx, my)
    .restore();
  doc.save().fontSize(9).font('Helvetica').fillColor(GRAY)
    .text('Generated by PawWiz · AI-powered cat health assistant', mx, my + 22)
    .restore();
  my += 40;

  hRule(doc, mx, my, MAIN_W, TEAL, 1.5);
  my += 8;

  // ── Summary stats bar (4 cards) ──────────────────────────────────────────────

  const byCat = countBySource(events);
  const msPerDay = 24 * 60 * 60 * 1000;
  const dayCount = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay));
  const waterTotal = totalWaterMl(events);
  const dailyAvgWater = Math.round((waterTotal / dayCount) * 10) / 10;

  const cardW = Math.floor(MAIN_W / 4) - 4;
  const cards: Array<{ value: string; label: string; color: string }> = [
    { value: String(events.length),             label: 'Total Events',     color: TEAL },
    { value: String(byCat['behavior'] ?? 0),    label: 'Behavior Logs',    color: '#8B5CF6' },
    { value: String(byCat['diet'] ?? 0),        label: 'Diet Events',      color: TEAL_DARK },
    { value: dailyAvgWater > 0 ? `${dailyAvgWater}ml` : '—', label: 'Avg Daily Water', color: INFO_CLR },
  ];

  for (let i = 0; i < cards.length; i++) {
    statCard(doc, mx + i * (cardW + 4) + (i > 0 ? 2 : 0), my, cardW, cards[i].value, cards[i].label, cards[i].color);
  }
  my += 62;

  // ── Opening summary quote block (Health Fact Sheet style) ────────────────────

  fillRoundedRect(doc, mx, my, MAIN_W, 46, 4, TEAL_LIGHT);
  doc.save().fontSize(20).font('Helvetica-Bold').fillColor(TEAL)
    .text('\u201C', mx + 8, my + 4)
    .restore();
  const summaryText = `This report covers ${events.length} health event${events.length !== 1 ? 's' : ''} for your cat ` +
    `over ${dayCount} day${dayCount !== 1 ? 's' : ''} (${fmtLong(startDate)} – ${fmtLong(endDate)}). ` +
    `${insights.length > 0 ? `${insights.length} AI insight${insights.length !== 1 ? 's' : ''} were generated.` : 'No AI insights available for this period.'}`;
  doc.save().fontSize(8.5).font('Helvetica').fillColor(DARK)
    .text(summaryText, mx + 24, my + 10, { width: MAIN_W - 32, lineGap: 2 })
    .restore();
  doc.save().fontSize(20).font('Helvetica-Bold').fillColor(TEAL)
    .text('\u201D', mx + MAIN_W - 20, my + 20)
    .restore();
  my += 56;

  // ── Section: Behavioral Analysis ─────────────────────────────────────────────

  doc.save().fontSize(12).font('Helvetica-Bold').fillColor(DARK)
    .text('Behavioral Analysis', mx, my)
    .restore();
  hRule(doc, mx, my + 16, MAIN_W, TEAL, 0.5);
  my += 24;

  const behaviorEvts = events.filter(e => e.source === 'behavior');
  if (behaviorEvts.length === 0) {
    doc.save().fontSize(8.5).font('Helvetica').fillColor(GRAY)
      .text('No behavior events in this period.', mx, my)
      .restore();
    my += 18;
  } else {
    // Two-column: intensity donut (left) + top behavior types bar chart (right)
    const COL_W = Math.floor(MAIN_W / 2) - 6;
    const chartStartY = my;

    // Left: intensity breakdown donut
    const intens = behaviorIntensityCounts(events);
    const totalBeh = intens.mild + intens.moderate + intens.severe || 1;
    doc.save().fontSize(8).font('Helvetica-Bold').fillColor(DARK)
      .text('Intensity Distribution', mx, my)
      .restore();
    my += 14;
    const donutCX = mx + COL_W / 2;
    const donutCY = my + 44;
    // Three-way donut: render as stacked wedges
    const mild_pct    = intens.mild / totalBeh;
    const mod_pct     = intens.moderate / totalBeh;
    // Draw full circle in severe color first, then overlay other segments
    doc.save().circle(donutCX, donutCY, 38).fill('#EF4444').restore(); // severe (red)
    const modEnd = -Math.PI / 2 + (mild_pct + mod_pct) * 2 * Math.PI;
    doc.save().moveTo(donutCX, donutCY)
      .arc(donutCX, donutCY, 38, -Math.PI / 2, modEnd)
      .lineTo(donutCX, donutCY).fill(WARN).restore(); // moderate
    const mildEnd = -Math.PI / 2 + mild_pct * 2 * Math.PI;
    doc.save().moveTo(donutCX, donutCY)
      .arc(donutCX, donutCY, 38, -Math.PI / 2, mildEnd)
      .lineTo(donutCX, donutCY).fill('#10B981').restore(); // mild
    // Hole
    doc.save().circle(donutCX, donutCY, 22).fill(WHITE).restore();
    // Center label
    doc.save().fontSize(9).font('Helvetica-Bold').fillColor(DARK)
      .text(String(behaviorEvts.length), donutCX - 12, donutCY - 8, { width: 24, align: 'center' })
      .restore();
    doc.save().fontSize(6).font('Helvetica').fillColor(GRAY)
      .text('events', donutCX - 12, donutCY + 4, { width: 24, align: 'center' })
      .restore();
    // Legend
    const legY = donutCY + 44;
    const legItems = [
      { color: '#10B981', label: `Mild (${intens.mild})` },
      { color: WARN,      label: `Moderate (${intens.moderate})` },
      { color: '#EF4444', label: `Severe (${intens.severe})` },
    ];
    for (let li = 0; li < legItems.length; li++) {
      const lx = mx + li * (COL_W / 3);
      dot(doc, lx + 5, legY + 4, 4, legItems[li].color);
      doc.save().fontSize(6.5).font('Helvetica').fillColor(DARK)
        .text(legItems[li].label, lx + 12, legY, { width: COL_W / 3 - 14 })
        .restore();
    }
    const donutBottomY = legY + 14;

    // Right: top behavior types bar chart
    const topBeh = topBehaviorTypes(events);
    const rightX = mx + COL_W + 12;
    doc.save().fontSize(8).font('Helvetica-Bold').fillColor(DARK)
      .text('Top Behavior Types', rightX, chartStartY)
      .restore();
    const maxBehVal = topBeh.length > 0 ? topBeh[0].value : 1;
    const barBottomY = barChart(doc, rightX, chartStartY + 14, COL_W,
      topBeh.map(b => ({ label: b.label, value: b.value, color: '#8B5CF6' })),
      maxBehVal,
    );

    my = Math.max(donutBottomY, barBottomY) + 12;
  }

  // ── Section: Diet & Nutrition ─────────────────────────────────────────────────

  doc.save().fontSize(12).font('Helvetica-Bold').fillColor(DARK)
    .text('Diet & Nutrition', mx, my)
    .restore();
  hRule(doc, mx, my + 16, MAIN_W, TEAL, 0.5);
  my += 24;

  const mealTypes = topMealTypes(events);
  const dietProfileUpdates = events.filter(e => e.eventType === 'diet_profile_updated').length;
  const waterEvts = events.filter(e => e.eventType === 'water_updated');

  if (mealTypes.length === 0 && dietProfileUpdates === 0 && waterEvts.length === 0) {
    doc.save().fontSize(8.5).font('Helvetica').fillColor(GRAY)
      .text('No diet events in this period.', mx, my)
      .restore();
    my += 18;
  } else {
    // Meal logs bar chart
    if (mealTypes.length > 0) {
      doc.save().fontSize(8).font('Helvetica-Bold').fillColor(DARK)
        .text('Meals Logged by Type', mx, my)
        .restore();
      my += 14;
      my = barChart(doc, mx, my, MAIN_W,
        mealTypes.map(m => ({ label: m.label, value: m.value, color: TEAL })),
        mealTypes[0].value,
      ) + 8;
    }

    // Water stats inline
    if (waterTotal > 0) {
      fillRoundedRect(doc, mx, my, MAIN_W, 28, 4, TEAL_LIGHT);
      doc.save().fontSize(8).font('Helvetica-Bold').fillColor(TEAL_DARK)
        .text(`💧  Total water logged: ${waterTotal} ml  ·  Daily average: ${dailyAvgWater} ml/day`, mx + 10, my + 8, { width: MAIN_W - 20 })
        .restore();
      my += 36;
    }

    // Diet profile updates note
    if (dietProfileUpdates > 0) {
      doc.save().fontSize(8).font('Helvetica').fillColor(GRAY)
        .text(`Diet profile was updated ${dietProfileUpdates} time${dietProfileUpdates !== 1 ? 's' : ''} during this period.`, mx, my)
        .restore();
      my += 14;
    }
  }

  // ── Section: Activity by Day (mini heatmap table) ────────────────────────────

  // Only render if there's a meaningful span of days
  if (dayCount > 1 && dayCount <= 31) {
    my += 4;
    doc.save().fontSize(12).font('Helvetica-Bold').fillColor(DARK)
      .text('Activity by Day', mx, my)
      .restore();
    hRule(doc, mx, my + 16, MAIN_W, TEAL, 0.5);
    my += 24;

    const byDay = countByDay(events);
    const maxDayCount = Math.max(...Array.from(byDay.values()), 1);
    const allDays = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b));

    // Grid: up to 7 cells per row, each 26×24pt
    const CELL_W = 26, CELL_H = 22, CELLS_PER_ROW = Math.min(7, allDays.length);
    const gridStartY = my;
    let cellIdx = 0;
    for (const [day, count] of allDays) {
      const col = cellIdx % CELLS_PER_ROW;
      const row = Math.floor(cellIdx / CELLS_PER_ROW);
      const cx2 = mx + col * (CELL_W + 2);
      const cy2 = gridStartY + row * (CELL_H + 2);
      const alpha = Math.round(40 + (count / maxDayCount) * 200);
      const alphaHex = alpha.toString(16).padStart(2, '0');
      fillRoundedRect(doc, cx2, cy2, CELL_W, CELL_H, 3, `${TEAL}${alphaHex}`);
      doc.save().fontSize(5.5).font('Helvetica-Bold').fillColor(WHITE)
        .text(fmtMonthDay(day), cx2, cy2 + 2, { width: CELL_W, align: 'center' })
        .restore();
      doc.save().fontSize(8).font('Helvetica-Bold').fillColor(WHITE)
        .text(String(count), cx2, cy2 + 10, { width: CELL_W, align: 'center' })
        .restore();
      cellIdx++;
    }
    const rowsUsed = Math.ceil(allDays.length / CELLS_PER_ROW);
    my = gridStartY + rowsUsed * (CELL_H + 2) + 10;
  }

  // Check if we need a new page for the events table + insights
  const spaceNeeded = 60 + Math.min(events.length, 20) * 16 + 80;
  if (my + spaceNeeded > PAGE_H - 30) {
    doc.addPage();
    // Redraw sidebar on new page
    doc.save().rect(0, 0, SIDEBAR_W, PAGE_H).fill(TEAL).restore();
    my = MARGIN;
  }

  // ── Section: Health Events Table ──────────────────────────────────────────────

  doc.save().fontSize(12).font('Helvetica-Bold').fillColor(DARK)
    .text('Health Events', mx, my)
    .restore();
  hRule(doc, mx, my + 16, MAIN_W, TEAL, 0.5);
  my += 24;

  const eventsAsc = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const tableEvents = eventsAsc.slice(0, 30); // cap at 30 rows to avoid overflow

  const tableCols = [
    { header: 'Date', width: 70 },
    { header: 'Time', width: 46 },
    { header: 'Source', width: 52 },
    { header: 'Event', width: MAIN_W - 70 - 46 - 52 },
  ];

  const tableRows = tableEvents.map(e => [
    fmtMonthDay(e.occurredAt.slice(0, 10)),
    fmtShort(new Date(e.occurredAt)),
    sourceLabel(e.source),
    e.title.length > 50 ? e.title.slice(0, 47) + '…' : e.title,
  ]);

  my = dataTable(doc, mx, my, tableCols, tableRows) + 6;

  if (events.length > 30) {
    doc.save().fontSize(7.5).font('Helvetica').fillColor(GRAY)
      .text(`(${events.length - 30} additional event${events.length - 30 !== 1 ? 's' : ''} not shown — export a narrower date range to see all.)`, mx, my)
      .restore();
    my += 12;
  }

  // ── Section: Health Insights ──────────────────────────────────────────────────

  if (insights.length > 0) {
    my += 8;
    if (my + 80 > PAGE_H - 20) {
      doc.addPage();
      doc.save().rect(0, 0, SIDEBAR_W, PAGE_H).fill(TEAL).restore();
      my = MARGIN;
    }

    doc.save().fontSize(12).font('Helvetica-Bold').fillColor(DARK)
      .text('Health Insights', mx, my)
      .restore();
    hRule(doc, mx, my + 16, MAIN_W, TEAL, 0.5);
    my += 24;

    for (const insight of insights) {
      // Check page space
      if (my + 52 > PAGE_H - 20) {
        doc.addPage();
        doc.save().rect(0, 0, SIDEBAR_W, PAGE_H).fill(TEAL).restore();
        my = MARGIN;
      }

      const sevColor = severityColor(insight.severity);
      // Insight card with left accent stripe
      doc.save().rect(mx, my, 3, 46).fill(sevColor).restore();
      fillRoundedRect(doc, mx + 3, my, MAIN_W - 3, 46, 3, GRAY_LIGHT);

      // Severity badge
      fillRoundedRect(doc, mx + MAIN_W - 54, my + 6, 48, 12, 6, sevColor);
      doc.save().fontSize(6.5).font('Helvetica-Bold').fillColor(WHITE)
        .text(insight.severity.toUpperCase(), mx + MAIN_W - 52, my + 8, { width: 44, align: 'center' })
        .restore();

      doc.save().fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
        .text(insight.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), mx + 10, my + 6, { width: MAIN_W - 70 })
        .restore();
      doc.save().fontSize(7.5).font('Helvetica').fillColor(GRAY)
        .text(insight.summary, mx + 10, my + 18, { width: MAIN_W - 70, lineGap: 1 })
        .restore();
      doc.save().fontSize(7).font('Helvetica').fillColor(GRAY)
        .text(insight.detail, mx + 10, my + 30, { width: MAIN_W - 70, lineGap: 1 })
        .restore();

      my += 52;
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────────────

  if (my + 20 > PAGE_H - 20) {
    // skip footer if no room
    return;
  }

  const footerY = PAGE_H - 26;
  hRule(doc, mx, footerY, MAIN_W, '#E5E7EB');
  doc.save().fontSize(6.5).font('Helvetica').fillColor(GRAY)
    .text(`PawWiz Health Report  ·  Generated ${fmtLong(new Date())}  ·  For informational purposes only. Consult a veterinarian for medical advice.`,
      mx, footerY + 6, { width: MAIN_W })
    .restore();
}

// ─── Service class ────────────────────────────────────────────────────────────

class PdfService {
  /**
   * Generate a Health Fact Sheet PDF for the given cat and date range.
   * Returns a Buffer containing the complete PDF binary.
   */
  async generateHealthSummary(opts: PdfExportOptions): Promise<Buffer> {
    const { catId, supabaseUserId, startDate, endDate, ownerNotes } = opts;

    // 1. Verify ownership
    await timelineService.verifyOwnership(catId, supabaseUserId);

    // 2. Aggregate events
    const aggregateResult = await timelineService.aggregateForCat(
      catId,
      supabaseUserId,
      { startDate, endDate, limit: 100 },
    );

    if (aggregateResult.events.length === 0) {
      throw AppError.badRequest('No health events found in the selected date range.');
    }

    // 3. Get insights
    const insights = await timelineRepository.findInsightsByCatId(catId, { limit: 100 });

    // 4. Get cat info
    const cat = await prisma.cat.findUnique({
      where: { id: catId },
      select: { name: true, breed: true, sex: true, lifeStage: true, age: true, photoUrl: true },
    });

    // 5. Build PDF
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // Sanitize notes
    const sanitizedNotes = ownerNotes
      ? sanitizeInsightInput(ownerNotes.slice(0, 500))
      : '';

    // Render sidebar (blocking — needs to await photo fetch)
    await renderSidebar(doc, cat, startDate, endDate, sanitizedNotes, aggregateResult.events.length);

    // Render main content
    await renderMainContent(doc, aggregateResult.events, insights, startDate, endDate);

    doc.end();
    return bufferPromise;
  }

  /**
   * Derives the download filename for a health summary PDF.
   * Format: `pawwiz-health-{catName}-{startDate}-to-{endDate}.pdf`
   */
  deriveFilename(catName: string, startDate: Date, endDate: Date): string {
    const slug = catName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const start = fmtDateIso(startDate);
    const end   = fmtDateIso(endDate);
    return `pawwiz-health-${slug}-${start}-to-${end}.pdf`;
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const pdfService = new PdfService();
