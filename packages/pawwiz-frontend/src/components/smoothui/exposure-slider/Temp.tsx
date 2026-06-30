"use client";

import {
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useRef } from "react";

export interface ExposureSliderProps {
  accentColor?: string;
  className?: string;

  defaultValue?: number;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;

  showIndicator?: boolean;

  step?: number;

  formatValue?: (value: number) => string;
}

const NOTCH_WIDTH = 13;
const SPRING_CONFIG = { stiffness: 300, damping: 30, mass: 0.5 };

const DEFAULT_ACCENT = "var(--color-brand, oklch(0.65 0.25 12))";

const ExposureSlider = ({
  min = -20,
  max = 20,
  step = 1,
  defaultValue = 0,
  onChange,
  showIndicator = true,
  accentColor,
  className,
  formatValue,
}: ExposureSliderProps) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const count = Math.floor((max - min) / step) + 1;
  const centerIndex = Math.floor((defaultValue - min) / step);

  // Raw drag offset and spring-smoothed version
  const rawX = useMotionValue(0);
  const x = shouldReduceMotion ? rawX : useSpring(rawX, SPRING_CONFIG);

  // Current value derived from offset
  const currentValue = useTransform(x, (latest: number) => {
    const indexOffset = Math.round(-latest / NOTCH_WIDTH);
    const val = Math.max(
      min,
      Math.min(max, (centerIndex + indexOffset) * step + min)
    );
    return val;
  });

  // Track value for circle and display
  const displayValue = useTransform(currentValue, (v: number) => {
    const rounded = Math.round(v);
    return formatValue ? formatValue(rounded) : rounded.toString();
  });
  const normalizedValue = useTransform(currentValue, [min, max], [-1, 1]);

  const snapToNearest = useCallback(() => {
    const current = rawX.get();
    const snapped = Math.round(current / NOTCH_WIDTH) * NOTCH_WIDTH;
    rawX.set(snapped);
  }, [rawX]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      const startX = e.clientX;
      const startOffset = rawX.get();

      const handleMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
        const newOffset = startOffset + delta;
        // Clamp to bounds
        const maxOffset = (count - 1 - centerIndex) * NOTCH_WIDTH;
        const minOffset = -centerIndex * NOTCH_WIDTH;
        rawX.set(Math.max(-maxOffset, Math.min(-minOffset, newOffset)));

        // Fire onChange
        const indexOffset = Math.round(-rawX.get() / NOTCH_WIDTH);
        const val = Math.max(
          min,
          Math.min(max, (centerIndex + indexOffset) * step + min)
        );
        onChange?.(Math.round(val));
      };

      const handleUp = () => {
        isDragging.current = false;
        snapToNearest();
        // Fire final onChange
        const indexOffset = Math.round(-rawX.get() / NOTCH_WIDTH);
        const val = Math.max(
          min,
          Math.min(max, (centerIndex + indexOffset) * step + min)
        );
        onChange?.(Math.round(val));
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [rawX, centerIndex, count, min, max, step, onChange, snapToNearest]
  );

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className={`flex w-full max-w-[500px] flex-col items-center gap-6 text-foreground ${className || ""}`}
      style={
        { "--es-accent": accentColor ?? DEFAULT_ACCENT } as React.CSSProperties
      }
    >
      {/* Progress circle */}
      {showIndicator && (
        <ProgressCircle
          displayValue={displayValue}
          normalizedValue={normalizedValue}
        />
      )}

      {/* Ticker slider */}
      <div
        className="relative flex h-10 w-full items-center justify-center overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
        }}
      >
        <div
          className="relative h-full w-full cursor-grab select-none active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          ref={containerRef}
          style={{
            touchAction: "pan-y",
            padding: `0 calc(50% - ${NOTCH_WIDTH / 2}px)`,
          }}
        >
          <motion.ul
            className="relative m-0 flex h-full list-none items-center p-0"
            style={{ x, marginLeft: -centerIndex * NOTCH_WIDTH }}
          >
            {items.map((i) => (
              <Notch centerIndex={centerIndex} index={i} key={i} x={x} />
            ))}
          </motion.ul>
        </div>
      </div>
    </div>
  );
};

/** Individual notch mark in the ticker */
const Notch = ({
  index,
  centerIndex,
  x,
}: {
  index: number;
  centerIndex: number;
  x: MotionValue<number>;
}) => {
  // Distance from center in notch units
  const distance = useTransform(x, (latest: number) => {
    const currentCenter = centerIndex + -latest / NOTCH_WIDTH;
    return Math.abs(index - currentCenter);
  });

  const opacity = useTransform(distance, [0, 1, 3], [1, 0.6, 0.3]);
  const clipTop = useTransform(distance, [0, 1, 2], [0, 30, 50]);
  const clipPath = useTransform(clipTop, (v: number) => `inset(${v}% 0px 0px)`);

  const isCenter = useTransform(distance, (d: number) => d < 0.5);
  const bg = useTransform(isCenter, (center: boolean) =>
    center ? "var(--es-accent)" : "currentColor"
  );

  return (
    <li
      className="relative flex-shrink-0 flex-grow-0"
      style={{ height: "fit-content" }}
    >
      <div style={{ padding: "0 5px" }}>
        <motion.div
          className="rounded-sm"
          style={{
            width: 3,
            height: 40,
            backgroundColor: bg,
            clipPath,
            opacity,
            willChange: "clip-path, opacity",
          }}
        />
      </div>
    </li>
  );
};

/** SVG progress ring showing positive/negative value */
const ProgressCircle = ({
  normalizedValue,
  displayValue,
}: {
  normalizedValue: MotionValue<number>;
  displayValue: MotionValue<any>;
}) => {

  const positiveDash = useTransform(normalizedValue, (v: number) =>
    v > 0 ? `${v} ${1 - v}` : "0 1"
  );

  const negativeDash = useTransform(normalizedValue, (v: number) =>
    v < 0 ? `${-v} ${1 + v}` : "0 1"
  );

  // Color: accent when non-zero, foreground when zero
  const color = useTransform(normalizedValue, (v: number) =>
    Math.abs(v) > 0.01 ? "var(--es-accent)" : "currentColor"
  );

  return (
    <div className="relative flex h-[75px] w-[75px] items-center justify-center">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          fill="currentColor"
          fillOpacity={0.067}
          r="48"
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeWidth="3"
        />
        {/* Positive indicator */}
        <motion.circle
          cx="50"
          cy="50"
          fill="none"
          pathLength={1}
          r="48"
          stroke="var(--es-accent)"
          strokeDasharray={positiveDash}
          strokeDashoffset={0}
          strokeWidth="3"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transformBox: "fill-box",
          }}
        />
        {/* Negative indicator */}
        <motion.circle
          cx="50"
          cy="50"
          fill="none"
          pathLength={1}
          r="48"
          stroke="var(--es-accent)"
          strokeDasharray={negativeDash}
          strokeDashoffset={0}
          strokeWidth="3"
          style={{
            transform: "scaleX(-1) rotate(-90deg)",
            transformOrigin: "50% 50%",
            transformBox: "fill-box",
          }}
        />
      </svg>
      <motion.span className="absolute font-semibold text-lg" style={{ color }}>
        {displayValue}
      </motion.span>
    </div>
  );
};

export default ExposureSlider;
