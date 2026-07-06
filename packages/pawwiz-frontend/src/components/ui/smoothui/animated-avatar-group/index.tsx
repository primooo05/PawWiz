"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Cat } from "lucide-react";

export type AvatarData = {
  id: string;
  name: string;
  src?: string | null;
  alt: string;
  isActive?: boolean;
  isNew?: boolean;
  /** Optional status dot (e.g. "logged today" indicator on pregnancy tracker). */
  statusDot?: 'green' | 'amber' | null;
};

export type AnimatedAvatarGroupProps = {
  avatars: AvatarData[];
  maxVisible?: number;
  size?: number;
  overlap?: number;
  className?: string;
  expandOnHover?: boolean;
  onAvatarClick?: (id: string) => void;
  onAddClick?: () => void;
};

// Simple utility to join classnames
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

const AnimatedAvatarGroup = ({
  avatars,
  maxVisible = 6,
  size = 48,
  overlap = 0.3,
  className,
  expandOnHover = true,
  onAvatarClick,
  onAddClick,
}: AnimatedAvatarGroupProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isHoverDevice, setIsHoverDevice] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredAdd, setHoveredAdd] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsHoverDevice(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHoverDevice(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const visibleAvatars = avatars.slice(0, maxVisible);
  const hiddenCount = avatars.length - maxVisible;
  const hasHiddenAvatars = hiddenCount > 0;

  const overlapPx = size * overlap;
  const expanded = expandOnHover && (isHoverDevice ? isHovered : true);

  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, duration: 0.25, bounce: 0.1 };

  return (
    <motion.div
      aria-label="Avatar group"
      className={cn("flex items-center", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredIndex(null);
        setHoveredAdd(false);
      }}
      role="group"
    >
      <AnimatePresence>
        {visibleAvatars.map((avatar, index) => {
          const marginLeft = index === 0 ? 0 : expanded ? 8 : -overlapPx;

          const content = avatar.src ? (
            <motion.img
              alt={avatar.alt}
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: hoveredIndex === index ? 1.15 : expanded ? 1.05 : 1,
                    }
              }
              className={cn(
                "rounded-full object-cover border-2 transition-all duration-200",
                avatar.isActive
                  ? "border-[#30c290] ring-4 ring-[#30c290]/25 shadow-md scale-105"
                  : "border-slate-900"
              )}
              height={size}
              initial={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
              }
              src={avatar.src}
              style={{
                width: size,
                height: size,
              }}
              transition={{
                ...springTransition,
                delay: shouldReduceMotion ? 0 : index * 0.03,
              }}
              width={size}
            />
          ) : (
            <motion.div
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: hoveredIndex === index ? 1.15 : expanded ? 1.05 : 1,
                    }
              }
              className={cn(
                "rounded-full border-2 transition-all duration-200 bg-teal-50 flex items-center justify-center text-[#30c290]",
                avatar.isActive
                  ? "border-[#30c290] ring-4 ring-[#30c290]/25 shadow-md scale-105"
                  : "border-slate-900"
              )}
              style={{
                width: size,
                height: size,
              }}
              initial={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
              }
              transition={{
                ...springTransition,
                delay: shouldReduceMotion ? 0 : index * 0.03,
              }}
            >
              <Cat style={{ width: size * 0.45, height: size * 0.45 }} strokeWidth={1.5} />
            </motion.div>
          );

          return (
            <motion.div
              animate={
                shouldReduceMotion
                  ? { marginLeft, opacity: 1 }
                  : { marginLeft, opacity: 1 }
              }
              whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
              onTouchStart={() => {
                setHoveredIndex(index);
                setTimeout(() => setHoveredIndex(null), 1500);
              }}
              className="relative cursor-pointer"
              key={avatar.id}
              onClick={() => onAvatarClick?.(avatar.id)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                zIndex: hoveredIndex === index ? 100 : visibleAvatars.length - index,
                width: size,
                height: size,
              }}
              transition={{
                ...springTransition,
                delay: shouldReduceMotion ? 0 : index * 0.03,
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: size,
                  height: size,
                }}
              >
                {content}
              </div>

              {avatar.isNew && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md z-[101] pointer-events-none select-none">
                  !
                </div>
              )}

              {/* Status dot (e.g. "logged today" or active profile indicator) */}
              {(avatar.statusDot || avatar.isActive) && (
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-[101] pointer-events-none",
                    avatar.statusDot === 'green' ? 'bg-emerald-400' :
                    avatar.statusDot === 'amber' ? 'bg-amber-400' : 'bg-[#FFB870]'
                  )}
                  aria-label={avatar.statusDot ? (avatar.statusDot === 'green' ? 'Logged today' : 'Not logged yet') : 'Active profile'}
                />
              )}

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900 border border-slate-800 text-white font-black text-[10px] tracking-wider uppercase rounded-xl shadow-xl whitespace-nowrap z-[1000] pointer-events-none"
                  >
                    {avatar.name}
                    {avatar.isActive && <span className="text-[#30c290] ml-1.5 font-bold">✓</span>}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {hasHiddenAvatars ? (
        <motion.div
          animate={
            shouldReduceMotion
              ? {
                  marginLeft: expanded ? 8 : -overlapPx,
                  opacity: 1,
                }
              : {
                  marginLeft: expanded ? 8 : -overlapPx,
                  opacity: 1,
                }
          }
          className="relative flex items-center justify-center rounded-full border-2 border-slate-900 bg-slate-100"
          style={{
            width: size,
            height: size,
            zIndex: 0,
          }}
          transition={{
            ...springTransition,
            delay: shouldReduceMotion ? 0 : visibleAvatars.length * 0.03,
          }}
        >
          <span
            className="font-black text-slate-700"
            style={{ fontSize: size * 0.3 }}
          >
            {`+${hiddenCount}`}
          </span>
        </motion.div>
      ) : null}

      {/* Add New Cat Button Avatar */}
      {onAddClick && (
        <motion.div
          animate={{
            marginLeft: expanded ? 12 : 8,
          }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
          onTouchStart={() => {
            setHoveredAdd(true);
            setTimeout(() => setHoveredAdd(false), 1500);
          }}
          className="relative cursor-pointer"
          onClick={onAddClick}
          onMouseEnter={() => setHoveredAdd(true)}
          onMouseLeave={() => setHoveredAdd(false)}
          style={{
            width: size,
            height: size,
            zIndex: 10,
          }}
          transition={springTransition}
        >
          <button
            type="button"
            className={cn(
              "rounded-full border-2 border-dashed border-slate-400 bg-white hover:bg-slate-50 hover:border-slate-900 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm text-slate-500 hover:text-slate-900",
              hoveredAdd ? "scale-110" : ""
            )}
            style={{
              width: size,
              height: size,
            }}
          >
            <span className="text-xl font-black leading-none pb-0.5">+</span>
          </button>

          {/* Tooltip for Add Button */}
          <AnimatePresence>
            {hoveredAdd && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900 border border-slate-800 text-white font-black text-[10px] tracking-wider uppercase rounded-xl shadow-xl whitespace-nowrap z-[1000] pointer-events-none"
              >
                Add New Cat
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedAvatarGroup;
