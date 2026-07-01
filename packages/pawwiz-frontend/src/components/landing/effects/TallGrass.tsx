import React from 'react';
import styles from '../styles/TallGrass.module.css';

interface BladeData {
  id: number;
  d: string;
  fill: string;
  style: React.CSSProperties;
  bladeStyle: React.CSSProperties;
}

const BLADE_COUNT = 150; // High density for a lush look

// Deterministic pseudo-random number generator to keep renders consistent
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const BLADES: BladeData[] = Array.from({ length: BLADE_COUNT }, (_, i) => {
  // Distribute base X from 0% to 100% across the viewBox width of 1000
  const viewWidth = 1000;
  const xPercent = i / (BLADE_COUNT - 1);
  const xNoise = (seededRandom(i + 1) - 0.5) * 8; // Noise range: -4 to 4
  const x = xPercent * viewWidth + xNoise;

  // Blade dimensions (viewBox height is 165)
  const height = 30 + seededRandom(i + 2) * 60; // Height range: 50 to 140
  const w = 5 + seededRandom(i + 3) * 5; // Width range: 5 to 10
  const curve = (seededRandom(i + 4) - 0.5) * 22; // Curve deflection: -11 to 11

  // Determine plant type: 65% grass blade, 12% broad leaf, 12% clover, 7% fern, 4% lily (toxic accent)
  const typeVal = seededRandom(i + 15);
  const type =
    typeVal < 0.65 ? 'blade' :
    typeVal < 0.77 ? 'broad' :
    typeVal < 0.89 ? 'clover' :
    typeVal < 0.96 ? 'fern' :
    'lily';

  const yBase = 165;
  const yTip = yBase - height;
  const xTip = x + w / 2 + curve;
  const yControl = (yBase + yTip) / 2;
  const xControl1 = x - curve * 0.5;
  const xControl2 = x + w - curve * 0.5;

  let d = '';

  if (type === 'blade') {
    // Standard pointed grass blade
    d = `M ${x} ${yBase} Q ${xControl1} ${yControl} ${xTip} ${yTip} Q ${xControl2} ${yControl} ${x + w} ${yBase} Z`;
  } else if (type === 'broad') {
    // Broad, elegant leaf with stem
    const stemHeight = height * 0.3;
    const yStemTop = yBase - stemHeight;
    const xStemLeft = x + w * 0.3;
    const xStemRight = x + w * 0.7;
    const yLeafMid = (yStemTop + yTip) / 2;
    const leafWidth = w * 2.2;

    d = `M ${x} ${yBase} 
         L ${xStemLeft} ${yStemTop} 
         Q ${xStemLeft - leafWidth} ${yLeafMid} ${xTip} ${yTip} 
         Q ${xStemRight + leafWidth} ${yLeafMid} ${xStemRight} ${yStemTop} 
         L ${x + w} ${yBase} Z`;
  } else if (type === 'clover') {
    // Stem + 3 distinct clover leaves
    const stem = `M ${x} ${yBase} Q ${xControl1} ${yControl} ${xTip} ${yTip} Q ${xControl2} ${yControl} ${x + w} ${yBase} Z`;

    const size = 10 + seededRandom(i + 16) * 4;
    const leftLeaf = `M ${xTip} ${yTip} C ${xTip - size * 1.2} ${yTip - size * 0.2} ${xTip - size * 1.6} ${yTip - size * 1.4} ${xTip - size * 0.8} ${yTip - size * 1.6} C ${xTip - size * 0.2} ${yTip - size * 1.8} ${xTip} ${yTip} ${xTip} ${yTip} Z`;
    const rightLeaf = `M ${xTip} ${yTip} C ${xTip + size * 1.2} ${yTip - size * 0.2} ${xTip + size * 1.6} ${yTip - size * 1.4} ${xTip + size * 0.8} ${yTip - size * 1.6} C ${xTip + size * 0.2} ${yTip - size * 1.8} ${xTip} ${yTip} ${xTip} ${yTip} Z`;
    const centerLeaf = `M ${xTip} ${yTip} C ${xTip - size * 0.8} ${yTip - size * 1.2} ${xTip - size * 0.4} ${yTip - size * 2.2} ${xTip} ${yTip - size * 2.0} C ${xTip + size * 0.4} ${yTip - size * 2.2} ${xTip + size * 0.8} ${yTip - size * 1.2} ${xTip} ${yTip} Z`;

    d = `${stem} ${leftLeaf} ${rightLeaf} ${centerLeaf}`;
  } else if (type === 'fern') {
    // Fern pinnate frond
    let fernPath = `M ${x} ${yBase} Q ${xControl1} ${yControl} ${xTip} ${yTip} Q ${xControl2} ${yControl} ${x + w} ${yBase} Z`;

    const leafletCount = 5;
    for (let k = 0; k < leafletCount; k++) {
      const f = 0.35 + (k / (leafletCount - 1)) * 0.5; // 0.35 to 0.85
      const yLeaf = yBase - height * f;
      const xLeaf = x + w / 2 + curve * f;
      const size = 11 * (1 - f * 0.4);

      const leftLeaflet = `M ${xLeaf} ${yLeaf} C ${xLeaf - size * 1.2} ${yLeaf - size * 0.5} ${xLeaf - size * 1.5} ${yLeaf - size} ${xLeaf - size * 1.4} ${yLeaf - size * 1.2} C ${xLeaf - size * 0.8} ${yLeaf - size * 1.3} ${xLeaf - size * 0.2} ${yLeaf - size * 0.4} ${xLeaf} ${yLeaf} Z`;
      const rightLeaflet = `M ${xLeaf} ${yLeaf} C ${xLeaf + size * 1.2} ${yLeaf - size * 0.5} ${xLeaf + size * 1.5} ${yLeaf - size} ${xLeaf + size * 1.4} ${yLeaf - size * 1.2} C ${xLeaf + size * 0.8} ${yLeaf - size * 1.3} ${xLeaf + size * 0.2} ${yLeaf - size * 0.4} ${xLeaf} ${yLeaf} Z`;

      fernPath += ` ${leftLeaflet} ${rightLeaflet}`;
    }

    d = fernPath;
  } else {
    // Lily silhouette: minimalist stylized bloom — a slender stem topped by
    // 3 long, elegantly curved petals fanning open, plus a single thin
    // pistil for a bit of botanical detail. Fewer, longer petals read as
    // "lily" more clearly than a symmetric flower-icon burst would.
    // A rare accent (~4% of blades) rendered in a muted rose/red gradient —
    // a quiet nod to the fact that lilies are highly toxic to cats.
    const stemHeight = height * 0.62;
    const yStemTop = yBase - stemHeight;
    const stemTipX = x + w / 2 + curve * 0.4;
    const stemWidth = w * 0.35;
    const stem = `M ${x + w / 2 - stemWidth / 2} ${yBase} Q ${xControl1} ${yControl} ${stemTipX} ${yStemTop} Q ${xControl2} ${yControl} ${x + w / 2 + stemWidth / 2} ${yBase} Z`;

    const cx = stemTipX;
    const cy = yStemTop;
    const petalLen = 20 + seededRandom(i + 18) * 7;
    const petalWidth = petalLen * 0.3;
    const petalCount = 3;
    const baseAngle = -Math.PI / 2; // petals fan upward/outward from the stem tip
    const spread = 1.1; // radians between outer petals
    let petals = '';

    for (let p = 0; p < petalCount; p++) {
      const t = (petalCount as number) === 1 ? 0.5 : p / (petalCount - 1);
      const angle = baseAngle - spread / 2 + spread * t + (seededRandom(i + 19 + p) - 0.5) * 0.15;
      const tipX = cx + Math.cos(angle) * petalLen;
      const tipY = cy + Math.sin(angle) * petalLen * 0.95;
      const perpX = -Math.sin(angle) * petalWidth;
      const perpY = Math.cos(angle) * petalWidth;
      const ctrl1X = cx + Math.cos(angle) * petalLen * 0.55 + perpX;
      const ctrl1Y = cy + Math.sin(angle) * petalLen * 0.55 + perpY;
      const ctrl2X = cx + Math.cos(angle) * petalLen * 0.55 - perpX;
      const ctrl2Y = cy + Math.sin(angle) * petalLen * 0.55 - perpY;

      petals += ` M ${cx} ${cy} Q ${ctrl1X} ${ctrl1Y} ${tipX} ${tipY} Q ${ctrl2X} ${ctrl2Y} ${cx} ${cy} Z`;
    }

    // A single slender pistil rising just past the petals' midpoint for a
    // minimal botanical accent (a thin filled sliver rather than a stroke,
    // to keep the whole silhouette a single fill path).
    const pistilLen = petalLen * 0.75;
    const pistilTipX = cx + Math.cos(baseAngle) * pistilLen;
    const pistilTipY = cy + Math.sin(baseAngle) * pistilLen;
    const pistilW = 0.6;
    const pistil = `M ${cx - pistilW} ${cy} L ${cx + pistilW} ${cy} L ${pistilTipX + pistilW * 0.3} ${pistilTipY} L ${pistilTipX - pistilW * 0.3} ${pistilTipY} Z`;

    d = `${stem} ${petals} ${pistil}`;
  }

  // Opacity variations to create depth
  const opacity = 0.75 + seededRandom(i + 5) * 0.25;

  // Animations configuration
  const duration = 2.0 + seededRandom(i + 6) * 2.0; // 2s to 4s
  const delay = seededRandom(i + 7) * 1.5; // 0s to 1.5s
  const swayMin = (seededRandom(i + 8) - 0.5) * 1.5; // -0.75deg to +0.75deg (near center at rest)
  const swayMax = 4.0 + seededRandom(i + 9) * 5.0;   // 4deg to 9deg (wind push direction)

  // Hover deflection settings
  // Alternate tilt direction to make deflection look dynamic and physical
  const dir = seededRandom(i + 10) > 0.5 ? 1 : -1;
  const hoverDeg = dir * (20 + seededRandom(i + 11) * 5); // 20deg to 25deg
  const adjRightDeg = dir * (10 + seededRandom(i + 12) * 5); // 10deg to 15deg
  const adjLeftDeg = -dir * (10 + seededRandom(i + 13) * 5); // 10deg to 15deg

  const timings = [
    'ease-in-out',
    'cubic-bezier(0.4, 0, 0.2, 1)',
    'cubic-bezier(0.25, 0.8, 0.25, 1)',
    'cubic-bezier(0.37, 0, 0.63, 1)'
  ];
  const timing = timings[Math.floor(seededRandom(i + 14) * timings.length)];

  // Choose fill color/gradient:
  // - lily type always uses the rose/red "toxic" gradient
  // - 30% of the other non-blade plants are golden-yellow (#fcba03)
  // - everything else uses the standard teal grass gradient
  const isYellow = type !== 'blade' && type !== 'lily' && seededRandom(i + 17) < 0.3;
  const fill =
    type === 'lily' ? 'url(#rose-gradient)' :
    isYellow ? 'url(#yellow-gradient)' :
    'url(#grass-gradient)';

  return {
    id: i,
    d,
    fill,
    style: {
      '--hover-deg': `${hoverDeg}deg`,
      '--adj-right-deg': `${adjRightDeg}deg`,
      '--adj-left-deg': `${adjLeftDeg}deg`,
    } as React.CSSProperties,
    bladeStyle: {
      '--sway-duration': `${duration}s`,
      '--sway-delay': `${delay}s`,
      '--sway-min': `${swayMin}deg`,
      '--sway-max': `${swayMax}deg`,
      '--sway-timing': timing,
      opacity,
      fill,
    } as React.CSSProperties,
  };
});

export default function TallGrass() {
  return (
    <div className={styles.container}>
      <svg
        className={styles.svg}
        viewBox="0 0 1000 165"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grass-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1a7a72" />
            <stop offset="100%" stopColor="#2ec4b6" />
          </linearGradient>
          <linearGradient id="yellow-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8c6703" />
            <stop offset="100%" stopColor="#fcba03" />
          </linearGradient>
          {/* Muted rose/red gradient reserved for the rare "lily" silhouette —
              a subtle, non-alarming visual cue tied to the toxicity-checker concept. */}
          <linearGradient id="rose-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8a2f3a" />
            <stop offset="100%" stopColor="#e0697a" />
          </linearGradient>
        </defs>
        {BLADES.map((blade) => (
          <g key={blade.id} className={styles.bladeGroup} style={blade.style}>
            <path className={styles.hitTarget} d={blade.d} />
            <g className={styles.bladeVisual}>
              <path className={styles.blade} d={blade.d} style={blade.bladeStyle} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}