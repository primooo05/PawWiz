import React, { useEffect, useRef, useState } from 'react';

/**
 * Dependency-free, fully responsive SVG chart primitives for the PawWiz dashboard.
 * Each chart measures its container via ResizeObserver and re-renders crisply at any
 * width, so charts adapt to phones, tablets, and desktops without a charting library.
 */

const INK = '#1a1a1a';

/** Measures the width of a container element and keeps it in sync on resize. */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setWidth(el.getBoundingClientRect().width);

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

export interface ChartSeries {
  name: string;
  color: string;
  data: number[];
}

/** Stacked (or single-series) bar chart. */
export const StackedBarChart: React.FC<{
  labels: string[];
  series: ChartSeries[];
  height?: number;
  yAxisLabel?: string;
  xAxisLabel?: string;
}> = ({ labels, series, height = 240, yAxisLabel = 'Occurrences', xAxisLabel }) => {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const padL = 52;  // extra room for y-axis label
  const padR = 10;
  const padT = 12;
  const padB = xAxisLabel ? 44 : 26;  // extra room for x-axis label
  const plotW = Math.max(0, width - padL - padR);
  const plotH = height - padT - padB;

  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + (s.data[i] || 0), 0));
  const rawMax = Math.max(1, ...totals);
  const niceMax = Math.ceil(rawMax / 4) * 4 || 4;

  const groupW = labels.length ? plotW / labels.length : 0;
  const barW = groupW * 0.5;

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Bar chart">
          {/* Y-axis label — rotated vertically */}
          <text
            x={0}
            y={0}
            transform={`translate(12, ${padT + plotH / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize={10}
            fontWeight={800}
            fill="#888"
          >
            {yAxisLabel}
          </text>

          {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
            const gy = padT + plotH - t * plotH;
            return (
              <g key={idx}>
                <line x1={padL} y1={gy} x2={padL + plotW} y2={gy} stroke="#e5e5e0" strokeWidth={1} />
                <text x={padL - 6} y={gy + 4} textAnchor="end" fontSize={10} fontWeight={800} fill="#888">
                  {Math.round(niceMax * t)}
                </text>
              </g>
            );
          })}

          {labels.map((label, i) => {
            const x = padL + i * groupW + (groupW - barW) / 2;
            let yCursor = padT + plotH;
            return (
              <g key={label}>
                {series.map((s) => {
                  const v = s.data[i] || 0;
                  const h = (v / niceMax) * plotH;
                  yCursor -= h;
                  return (
                    <rect
                      key={s.name}
                      x={x}
                      y={yCursor}
                      width={barW}
                      height={h}
                      fill={s.color}
                      stroke={INK}
                      strokeWidth={2}
                      rx={2}
                    />
                  );
                })}
                <text
                  x={x + barW / 2}
                  y={padT + plotH + 16}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill={INK}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* X-axis label — centered below day labels */}
          {xAxisLabel && (
            <text
              x={padL + plotW / 2}
              y={height - 6}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill="#888"
            >
              {xAxisLabel}
            </text>
          )}
        </svg>
      )}
    </div>
  );
};

export interface DonutSlice {
  name: string;
  color: string;
  value: number;
}

/** Donut / composition chart with an accessible legend. */
export const DonutChart: React.FC<{ data: DonutSlice[]; size?: number }> = ({ data, size = 200 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const rO = size / 2 - 4;
  const rI = rO * 0.58;

  const polar = (r: number, angle: number) => {
    const a = ((angle - 90) * Math.PI) / 180;
    return `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
  };

  let angle = 0;
  const arcs = data.map((d) => {
    const start = angle;
    const sweep = Math.min(359.999, (d.value / total) * 360);
    const end = start + sweep;
    angle = end;
    const large = sweep > 180 ? 1 : 0;
    const path = `M ${polar(rO, start)} A ${rO} ${rO} 0 ${large} 1 ${polar(rO, end)} L ${polar(
      rI,
      end
    )} A ${rI} ${rI} 0 ${large} 0 ${polar(rI, start)} Z`;
    return { path, color: d.color, name: d.name, pct: Math.round((d.value / total) * 100) };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
      <svg width={size} height={size} role="img" aria-label="Composition donut chart" className="flex-shrink-0">
        {arcs.map((a) => (
          <path key={a.name} d={a.path} fill={a.color} stroke={INK} strokeWidth={2} />
        ))}
      </svg>
      <ul className="flex flex-col gap-2 w-full">
        {arcs.map((a) => (
          <li key={a.name} className="flex items-center justify-between text-xs font-black">
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 border-2 border-[#1a1a1a] rounded-sm"
                style={{ backgroundColor: a.color }}
              />
              {a.name}
            </span>
            <span className="text-[#555]">{a.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Donut chart variant that draws the percentage directly on each slice
 * (matching the "Top Behavior" KPI card design) instead of a separate legend
 * list. Slices below the `minLabelPercent` threshold skip their label to
 * avoid crowding tiny wedges.
 */
export const DonutChartLabeled: React.FC<{
  data: DonutSlice[];
  size?: number;
  minLabelPercent?: number;
}> = ({ data, size = 160, minLabelPercent = 8 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const rO = size / 2 - 4;
  const rI = rO * 0.55;

  const polar = (r: number, angle: number): [number, number] => {
    const a = ((angle - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  let angle = 0;
  const arcs = data.map((d) => {
    const start = angle;
    const pct = (d.value / total) * 100;
    const sweep = Math.min(359.999, (pct / 100) * 360);
    const end = start + sweep;
    angle = end;
    const large = sweep > 180 ? 1 : 0;
    const [sx, sy] = polar(rO, start);
    const [ex, ey] = polar(rO, end);
    const [isx, isy] = polar(rI, end);
    const [iex, iey] = polar(rI, start);
    const path = `M ${sx} ${sy} A ${rO} ${rO} 0 ${large} 1 ${ex} ${ey} L ${isx} ${isy} A ${rI} ${rI} 0 ${large} 0 ${iex} ${iey} Z`;
    const [lx, ly] = polar((rO + rI) / 2, start + sweep / 2);
    return { path, color: d.color, name: d.name, pct: Math.round(pct), lx, ly };
  });

  return (
    <svg width={size} height={size} role="img" aria-label="Behavior composition donut chart" className="flex-shrink-0">
      {arcs.map((a) => (
        <path key={a.name} d={a.path} fill={a.color} stroke={INK} strokeWidth={2} />
      ))}
      {arcs.map(
        (a) =>
          a.pct >= minLabelPercent && (
            <text
              key={`${a.name}-label`}
              x={a.lx}
              y={a.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size < 100 ? 8 : size < 150 ? 11 : 13}
              fontWeight={900}
              fill={INK}
            >
              {a.pct}%
            </text>
          )
      )}
    </svg>
  );
};

/** Line chart with an optional dashed target line and filled area. */
export const LineChart: React.FC<{
  labels: string[];
  values: number[];
  target?: number;
  color?: string;
  height?: number;
}> = ({ labels, values, target, color = '#FF6B35', height = 240 }) => {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const padL = 34;
  const padR = 12;
  const padT = 14;
  const padB = 26;
  const plotW = Math.max(0, width - padL - padR);
  const plotH = height - padT - padB;

  const allVals = [...values, ...(target !== undefined ? [target] : [])];
  const max = Math.max(1, ...allVals) * 1.15;
  const stepX = values.length > 1 ? plotW / (values.length - 1) : 0;

  const x = (i: number) => padL + i * stepX;
  const y = (v: number) => padT + plotH - (v / max) * plotH;

  const pts = values.map((v, i) => `${x(i)},${y(v)}`);
  const linePath = pts.length ? `M ${pts.join(' L ')}` : '';
  const areaPath = pts.length
    ? `M ${x(0)},${padT + plotH} L ${pts.join(' L ')} L ${x(values.length - 1)},${padT + plotH} Z`
    : '';

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Line chart">
          {[0, 0.5, 1].map((t, idx) => {
            const gy = padT + plotH - t * plotH;
            return (
              <g key={idx}>
                <line x1={padL} y1={gy} x2={padL + plotW} y2={gy} stroke="#e5e5e0" strokeWidth={1} />
                <text x={padL - 6} y={gy + 4} textAnchor="end" fontSize={10} fontWeight={800} fill="#888">
                  {Math.round(max * t)}
                </text>
              </g>
            );
          })}

          {areaPath && <path d={areaPath} fill={color} opacity={0.15} />}

          {target !== undefined && (
            <line
              x1={padL}
              y1={y(target)}
              x2={padL + plotW}
              y2={y(target)}
              stroke={INK}
              strokeWidth={2}
              strokeDasharray="8 6"
            />
          )}

          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={4}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {values.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={5} fill={color} stroke={INK} strokeWidth={2} />
          ))}

          {labels.map((label, i) => (
            <text
              key={label}
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize={11}
              fontWeight={800}
              fill={INK}
            >
              {label}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
};
