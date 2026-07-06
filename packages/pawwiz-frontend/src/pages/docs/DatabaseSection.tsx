import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/ui/useBodyScrollLock';
import { Code, SectionCard, TEAL } from './shared';
import dbSchemaData from './dbSchemaData.json';

// ---------------------------------------------------------------------------
// Database schema visualization (Section 6) — derived from prisma/schema.prisma
// ---------------------------------------------------------------------------

type FieldFlag = 'PK' | 'FK' | 'UNIQUE' | 'IDX';

interface DbField {
  name: string;
  type: string;
  flag?: FieldFlag;
}

interface DbRelation {
  to: string;
  cardinality: '1:1' | '1:N' | 'N:1';
  label: string;
}

interface DbModel {
  name: string;
  table: string;
  fields: DbField[];
  relations: DbRelation[];
}

interface DbGroup {
  group: string;
  color: string;
  models: DbModel[];
}

const FLAG_STYLE: Record<FieldFlag, { icon: string; bg: string; fg: string }> = {
  PK: { icon: '🔑', bg: '#e9c46a', fg: '#0f172a' },
  FK: { icon: '🔗', bg: '#2ec4b6', fg: '#ffffff' },
  UNIQUE: { icon: '◆', bg: '#0f172a', fg: '#ffffff' },
  IDX: { icon: '⚡', bg: '#e2e8f0', fg: '#0f172a' },
};

const DB_GROUPS = dbSchemaData as DbGroup[];

// ─── Relationship connector overlay ──────────────────────────────────────

interface SchemaEdge {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

function edgePath(e: SchemaEdge): string {
  const dx = e.x2 - e.x1;
  const dy = e.y2 - e.y1;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const controlOffset = dx / 2;
    return `M ${e.x1} ${e.y1} C ${e.x1 + controlOffset} ${e.y1}, ${e.x2 - controlOffset} ${e.y2}, ${e.x2} ${e.y2}`;
  } else {
    const controlOffset = dy / 2;
    return `M ${e.x1} ${e.y1} C ${e.x1} ${e.y1 + controlOffset}, ${e.x2} ${e.y2 - controlOffset}, ${e.x2} ${e.y2}`;
  }
}

function fkFieldNameFor(label: string): string {
  return `${label}Id`;
}

function useSchemaConnectors(
  containerRef: React.RefObject<HTMLDivElement | null>,
  cardRefs: React.RefObject<Map<string, HTMLDivElement>>,
  fieldRefs: React.RefObject<Map<string, HTMLDivElement>>,
  positions: Record<string, { x: number; y: number }>,
  sizes: Record<string, { w: number; h: number }>,
  zoom: number,
) {
  const [edges, setEdges] = useState<SchemaEdge[]>([]);

  useEffect(() => {
    function recompute() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      const colorByModel = new Map<string, string>();
      DB_GROUPS.forEach((g) => g.models.forEach((m) => colorByModel.set(m.name, g.color)));

      const next: SchemaEdge[] = [];
      DB_GROUPS.forEach((g) => {
        g.models.forEach((m) => {
          m.relations.forEach((r) => {
            if (r.cardinality !== 'N:1') return;
            const fromCardEl = cardRefs.current.get(m.name);
            const toCardEl = cardRefs.current.get(r.to);
            if (!fromCardEl || !toCardEl) return;

            const fromCardRect = fromCardEl.getBoundingClientRect();
            const toCardRect = toCardEl.getBoundingClientRect();
            const fromCx = (fromCardRect.left + fromCardRect.width / 2 - containerRect.left) / zoom;
            const fromCy = (fromCardRect.top + fromCardRect.height / 2 - containerRect.top) / zoom;
            const toCx = (toCardRect.left + toCardRect.width / 2 - containerRect.left) / zoom;
            const toCy = (toCardRect.top + toCardRect.height / 2 - containerRect.top) / zoom;

            const goRight = toCx > fromCx;
            const goDown = toCy > fromCy;
            const horizontal = Math.abs(toCx - fromCx) > Math.abs(toCy - fromCy);

            const fromFieldEl = fieldRefs.current.get(`${m.name}::${fkFieldNameFor(r.label)}`);
            const toFieldEl = fieldRefs.current.get(`${r.to}::id`);

            let x1: number, y1: number, x2: number, y2: number;
            const markerOffset = 7;

            if (horizontal) {
              x1 = ((goRight ? fromCardRect.right : fromCardRect.left) - containerRect.left) / zoom;
              y1 = fromFieldEl
                ? (fromFieldEl.getBoundingClientRect().top + fromFieldEl.getBoundingClientRect().height / 2 - containerRect.top) / zoom
                : fromCy;

              const targetXRaw = (goRight ? toCardRect.left : toCardRect.right) - containerRect.left;
              x2 = (targetXRaw / zoom) + (goRight ? -markerOffset : markerOffset);
              y2 = toFieldEl
                ? (toFieldEl.getBoundingClientRect().top + toFieldEl.getBoundingClientRect().height / 2 - containerRect.top) / zoom
                : toCy;
            } else {
              x1 = fromFieldEl
                ? (fromFieldEl.getBoundingClientRect().left + fromFieldEl.getBoundingClientRect().width / 2 - containerRect.left) / zoom
                : fromCx;
              y1 = ((goDown ? fromCardRect.bottom : fromCardRect.top) - containerRect.top) / zoom;

              x2 = toFieldEl
                ? (toFieldEl.getBoundingClientRect().left + toFieldEl.getBoundingClientRect().width / 2 - containerRect.left) / zoom
                : toCx;
              
              const targetYRaw = (goDown ? toCardRect.top : toCardRect.bottom) - containerRect.top;
              y2 = (targetYRaw / zoom) + (goDown ? -markerOffset : markerOffset);
            }

            next.push({ key: `${m.name}->${r.to}`, x1, y1, x2, y2, color: colorByModel.get(m.name) || TEAL });
          });
        });
      });

      setEdges(next);
    }

    recompute();
    const ro = new ResizeObserver(() => recompute());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, sizes, zoom]);

  return edges;
}

function SchemaConnectorOverlay({ edges }: { edges: SchemaEdge[] }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      <defs>
        {edges.map((e) => (
          <marker
            key={`arrow-${e.key}`}
            id={`arrow-${e.key}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth={8}
            markerHeight={8}
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 L 2 5 Z" fill="#0f172a" />
          </marker>
        ))}
      </defs>
      {edges.map((e) => (
        <g key={e.key}>
          <path d={edgePath(e)} fill="none" stroke="#0f172a" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
          <path
            d={edgePath(e)}
            fill="none"
            stroke={e.color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd={`url(#arrow-${e.key})`}
          />
          <circle cx={e.x1} cy={e.y1} r={6.5} fill={e.color} stroke="#0f172a" strokeWidth={2} />
        </g>
      ))}
    </svg>
  );
}

function DbTableCard({
  model,
  accent,
  onRef,
  onFieldRef,
  highlightFields,
  style,
  onHeaderMouseDown,
  onResizeMouseDown,
}: {
  model: DbModel;
  accent: string;
  onRef?: (el: HTMLDivElement | null) => void;
  onFieldRef?: (fieldName: string, el: HTMLDivElement | null) => void;
  highlightFields?: Set<string>;
  style?: React.CSSProperties;
  onHeaderMouseDown?: (e: React.MouseEvent) => void;
  onResizeMouseDown?: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      ref={onRef}
      style={style}
      className="absolute border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[5px_5px_0_0_rgba(15,23,42,1)] bg-white flex flex-col select-none"
    >
      <div
        onMouseDown={onHeaderMouseDown}
        className="px-4 py-2.5 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
        style={{ backgroundColor: '#0f172a' }}
      >
        <span className="font-mono font-black text-xs md:text-sm text-white truncate">{model.name}</span>
        <span
          className="flex-shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
          style={{ backgroundColor: accent, color: accent === '#0f172a' ? '#fff' : '#0f172a' }}
        >
          {model.table}
        </span>
      </div>

      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto min-h-0">
        {model.fields.map((f) => {
          const isConnectorEndpoint = highlightFields?.has(f.name);
          return (
            <div
              key={f.name}
              ref={(el) => onFieldRef?.(f.name, el)}
              className="flex items-center gap-2 px-4 py-1.5 transition-colors"
              style={isConnectorEndpoint ? { backgroundColor: '#EEF9F8' } : undefined}
            >
              {f.flag ? (
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] border border-slate-900"
                  style={{ backgroundColor: FLAG_STYLE[f.flag].bg, color: FLAG_STYLE[f.flag].fg }}
                  title={f.flag}
                >
                  {FLAG_STYLE[f.flag].icon}
                </span>
              ) : (
                <span className="flex-shrink-0 w-5 h-5" />
              )}
              <span className="font-mono text-[11px] font-bold text-slate-900 truncate">{f.name}</span>
              <span className="ml-auto font-mono text-[10px] text-slate-400 truncate">{f.type}</span>
            </div>
          );
        })}
      </div>

      {model.relations.length > 0 && (
        <div className="border-t-2 border-slate-900 px-4 py-2 flex flex-wrap gap-1.5 flex-shrink-0" style={{ backgroundColor: '#EEF9F8' }}>
          {model.relations.map((r) => (
            <span
              key={r.to + r.label}
              className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-slate-900 bg-white text-slate-700"
              title={r.label}
            >
              {r.cardinality === 'N:1' ? '→' : '⇉'} {r.to}
              <span className="text-slate-400 font-bold">{r.cardinality}</span>
            </span>
          ))}
        </div>
      )}

      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center z-20 select-none bg-slate-900 rounded-tl-md border-l border-t border-slate-900"
        title="Drag to resize"
      >
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="text-white opacity-70">
          <path d="M6 0L0 6M6 3L3 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function DbSchemaDiagram({ zoom = 1 }: { zoom?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const visibleModels = useMemo(() => {
    const models = new Set<string>();
    DB_GROUPS.forEach((g) => {
      if (activeGroup === 'all' || g.group === activeGroup) {
        g.models.forEach((m) => models.add(m.name));
      }
    });
    return models;
  }, [activeGroup]);

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({
    Profile: { x: 20, y: 20 },
    OnboardingSession: { x: 20, y: 320 },
    Cat: { x: 20, y: 620 },
    DietProfile: { x: 300, y: 20 },
    DietMealLog: { x: 300, y: 320 },
    BehaviorChat: { x: 300, y: 620 },
    BehaviorMessage: { x: 300, y: 920 },
    BehaviorLog: { x: 300, y: 1220 },
    HealthTimelineInsight: { x: 580, y: 20 },
    PregnancySession: { x: 580, y: 320 },
    PregnancyLog: { x: 580, y: 620 },
    PregnancyInsight: { x: 580, y: 920 },
    Plant: { x: 580, y: 1220 },
  });

  useEffect(() => {
    const cardWidth = 220;
    const xCenter = (containerWidth / zoom - cardWidth) / 2;

    if (activeGroup === 'all') {
      setPositions({
        Profile: { x: 20, y: 20 },
        OnboardingSession: { x: 20, y: 320 },
        Cat: { x: 20, y: 620 },
        DietProfile: { x: 300, y: 20 },
        DietMealLog: { x: 300, y: 320 },
        BehaviorChat: { x: 300, y: 620 },
        BehaviorMessage: { x: 300, y: 920 },
        BehaviorLog: { x: 300, y: 1220 },
        HealthTimelineInsight: { x: 580, y: 20 },
        PregnancySession: { x: 580, y: 320 },
        PregnancyLog: { x: 580, y: 620 },
        PregnancyInsight: { x: 580, y: 920 },
        Plant: { x: 580, y: 1220 },
      });
    } else {
      const group = DB_GROUPS.find((g) => g.group === activeGroup);
      if (group) {
        const nextPos: Record<string, { x: number; y: number }> = {};
        group.models.forEach((m, idx) => {
          nextPos[m.name] = {
            x: xCenter,
            y: idx * 300 + 20,
          };
        });
        setPositions(nextPos);
      }
    }
  }, [activeGroup, containerWidth, zoom]);

  const [sizes, setSizes] = useState<Record<string, { w: number; h: number }>>(() => {
    const sz: Record<string, { w: number; h: number }> = {};
    DB_GROUPS.forEach((g) => {
      g.models.forEach((m) => {
        sz[m.name] = { w: 220, h: 240 };
      });
    });
    return sz;
  });

  const edges = useSchemaConnectors(containerRef, cardRefs, fieldRefs, positions, sizes, zoom);

  const visibleEdges = useMemo(() => {
    return edges.filter((e) => {
      const [from, to] = e.key.split('->');
      return visibleModels.has(from) && visibleModels.has(to);
    });
  }, [edges, visibleModels]);

  const handleHeaderMouseDown = (modelName: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = positions[modelName] || { x: 0, y: 0 };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      setPositions((prev) => ({
        ...prev,
        [modelName]: {
          x: Math.max(0, startPos.x + dx),
          y: Math.max(0, startPos.y + dy),
        },
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (modelName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = sizes[modelName] || { w: 220, h: 240 };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;
      setSizes((prev) => ({
        ...prev,
        [modelName]: {
          w: Math.max(160, startSize.w + dx),
          h: Math.max(120, startSize.h + dy),
        },
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const highlightsByModel = new Map<string, Set<string>>();
  DB_GROUPS.forEach((g) =>
    g.models.forEach((m) => {
      m.relations.forEach((r) => {
        if (r.cardinality !== 'N:1') return;
        if (!highlightsByModel.has(m.name)) highlightsByModel.set(m.name, new Set());
        highlightsByModel.get(m.name)!.add(fkFieldNameFor(r.label));
        if (!highlightsByModel.has(r.to)) highlightsByModel.set(r.to, new Set());
        highlightsByModel.get(r.to)!.add('id');
      });
    }),
  );

  const visiblePositions = Object.entries(positions).filter(([name]) => visibleModels.has(name));
  const containerHeight = visiblePositions.length > 0
    ? Math.max(...visiblePositions.map(([_, p]) => p.y + 300), 500)
    : 500;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap gap-2 p-2 bg-slate-100 border-2 border-slate-900 rounded-2xl select-none z-20">
        <button
          type="button"
          onClick={() => setActiveGroup('all')}
          className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeGroup === 'all'
              ? 'bg-slate-900 text-white shadow-[2px_2px_0_0_rgba(46,196,182,1)]'
              : 'bg-white text-slate-800 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        {DB_GROUPS.map((g) => (
          <button
            key={g.group}
            type="button"
            onClick={() => setActiveGroup(g.group)}
            className={`px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeGroup === g.group
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-800 hover:bg-slate-50'
            }`}
            style={activeGroup === g.group ? { boxShadow: `2px 2px 0 0 ${g.color}` } : undefined}
          >
            {g.group}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative w-full border-2 border-dashed border-slate-300 rounded-[2rem] bg-slate-50/50 transition-[height] duration-300"
        style={{ height: containerHeight }}
      >
        <SchemaConnectorOverlay edges={visibleEdges} />
        {DB_GROUPS.map((g) => {
          if (activeGroup !== 'all' && g.group !== activeGroup) return null;
          return g.models.map((m) => {
            const pos = positions[m.name] || { x: 0, y: 0 };
            const size = sizes[m.name] || { w: 220, h: 240 };
            return (
              <DbTableCard
                key={m.name}
                model={m}
                accent={g.color}
                highlightFields={highlightsByModel.get(m.name)}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${size.w}px`,
                  height: `${size.h}px`,
                }}
                onRef={(el) => {
                  if (el) cardRefs.current.set(m.name, el);
                  else cardRefs.current.delete(m.name);
                }}
                onFieldRef={(fieldName, el) => {
                  const key = `${m.name}::${fieldName}`;
                  if (el) fieldRefs.current.set(key, el);
                  else fieldRefs.current.delete(key);
                }}
                onHeaderMouseDown={(e) => handleHeaderMouseDown(m.name, e)}
                onResizeMouseDown={(e) => handleResizeMouseDown(m.name, e)}
              />
            );
          });
        })}
      </div>
    </div>
  );
}

function SchemaThumbnail({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="relative border-2 border-slate-900 rounded-2xl overflow-hidden shadow-[5px_5px_0_0_rgba(15,23,42,1)] bg-white">
      <div className="h-[380px] md:h-[440px] overflow-hidden relative select-none" style={{ backgroundColor: '#EEF9F8' }}>
        <div
          className="pointer-events-none p-6 origin-top-left"
          style={{ transform: 'scale(0.4)' }}
          aria-hidden="true"
        >
          <DbSchemaDiagram zoom={0.4} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/85 to-transparent" />
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer"
      >
        <span
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-wider shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all group-hover:-translate-y-0.5 group-active:translate-y-0 group-active:shadow-none"
          style={{ backgroundColor: '#0f172a', color: '#fff' }}
        >
          <Search className="w-4 h-4" style={{ color: TEAL }} />
          Click to view full schema
        </span>
      </button>
    </div>
  );
}

function SchemaFullViewModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) setZoom(1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-3 md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ type: 'spring', duration: 0.35 }}
              role="dialog"
              aria-modal="true"
              aria-label="Full database schema diagram"
              className="bg-white border-2 border-slate-900 rounded-[1.5rem] md:rounded-[2rem] w-full max-w-6xl h-[92vh] md:h-[88vh] shadow-[8px_8px_0_0_rgba(15,23,42,1)] pointer-events-auto flex flex-col overflow-hidden"
            >
              <div
                className="flex items-center justify-between gap-3 px-5 py-4 border-b-2 border-slate-900 flex-shrink-0"
                style={{ backgroundColor: '#0f172a' }}
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: TEAL }}>
                    Full Schema
                  </span>
                  <h3 className="text-base md:text-xl font-black uppercase tracking-tight text-white truncate">
                    Database Schema Diagram
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}
                    className="w-9 h-9 flex items-center justify-center bg-white text-slate-900 border-2 border-slate-900 rounded-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-black text-white w-10 text-center tabular-nums">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)))}
                    className="w-9 h-9 flex items-center justify-center bg-white text-slate-900 border-2 border-slate-900 rounded-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center border-2 border-slate-900 rounded-xl transition-all cursor-pointer active:scale-95 ml-1"
                    style={{ backgroundColor: TEAL, color: '#fff' }}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#EEF9F8' }}>
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                  <DbSchemaDiagram zoom={zoom} />
                </div>
              </div>

              <div className="px-5 py-3 border-t-2 border-slate-900 bg-white flex-shrink-0 flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                  Scroll to explore · use +/− to zoom · Esc to close
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border-2 border-slate-900 rounded-full text-xs font-black text-slate-800 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer ml-auto"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function DatabaseSection() {
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);

  return (
    <SectionCard id="database" eyebrow="Section 06" title="Database Schema">
      <p className="text-sm text-slate-600 font-medium mb-6">
        13 Prisma models on PostgreSQL, grouped by feature domain. User credentials live in
        Supabase Auth — every table here only stores app-specific data, joined back to the
        account via <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">supabaseUserId</code>.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-8 p-3 border-2 border-slate-900 rounded-2xl bg-white">
        {(Object.entries(FLAG_STYLE) as [FieldFlag, typeof FLAG_STYLE[FieldFlag]][]).map(([flag, s]) => (
          <span key={flag} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-600">
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] border border-slate-900"
              style={{ backgroundColor: s.bg, color: s.fg }}
            >
              {s.icon}
            </span>
            {flag === 'PK' ? 'Primary Key' : flag === 'FK' ? 'Foreign Key' : flag === 'UNIQUE' ? 'Unique' : 'Indexed'}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-600 ml-auto">
          <span className="text-teal-600">→</span> N:1 <span className="text-teal-600 ml-2">⇉</span> 1:N
        </span>
      </div>

      <SchemaThumbnail onOpen={() => setSchemaModalOpen(true)} />
      <SchemaFullViewModal isOpen={schemaModalOpen} onClose={() => setSchemaModalOpen(false)} />

      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mt-10 mb-3">Prisma Commands</h3>
      <Code
        lang="bash"
        code={`# generate the client from schema.prisma\nnpx prisma generate -w packages/pawwiz-backend\n\n# create + apply a new migration (dev)\nnpx prisma migrate dev -w packages/pawwiz-backend\n\n# apply committed migrations (prod / CI)\nnpm run prisma:deploy -w packages/pawwiz-backend\n\n# open Prisma Studio to browse data\nnpx prisma studio -w packages/pawwiz-backend`}
      />
    </SectionCard>
  );
}
