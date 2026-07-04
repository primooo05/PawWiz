interface CircleWrapperProps {
  isTransitioning: boolean;
  isZIndexHigh?: boolean;
}

/**
 * Decorative background circles shared across Onboarding and Login pages.
 *
 * Z-index contract:
 *   - Idle:       circles at -z-10 (behind all content)
 *   - Animating:  circles at z-50  (above all content, covers the screen during transition)
 *
 * pointer-events-none is always enforced — circles never intercept input events.
 * Hidden on mobile (md:block) — decorative geometry is suppressed on small viewports.
 */
export function CircleWrapper({ isTransitioning, isZIndexHigh = false }: CircleWrapperProps) {
  const isElevated = isTransitioning || isZIndexHigh;

  return (
    <>
      {/* Top-left circle */}
      <div
        className={[
          'hidden md:block',
          'w-64 h-64 md:w-80 md:h-80',
          'bg-[#2ec4b6] rounded-full',
          'absolute -top-16 -left-16',
          'pointer-events-none',
          'transition-transform duration-[2000ms] ease-in-out origin-top-left',
          isElevated ? 'z-50' : '-z-10',
          isTransitioning ? 'scale-[8]' : 'scale-100',
        ].join(' ')}
      />

      {/* Top-right circle */}
      <div
        className={[
          'hidden md:block',
          'w-24 h-24 md:w-32 md:h-32',
          'bg-[#2ec4b6] rounded-full',
          'absolute -top-8 -right-8',
          'pointer-events-none',
          'transition-transform duration-[1000ms] ease-in-out origin-top-right',
          isElevated ? 'z-50' : '-z-10',
          isTransitioning ? 'scale-[12]' : 'scale-100',
        ].join(' ')}
      />

      {/* Bottom-right circle */}
      <div
        className={[
          'hidden md:block',
          'w-72 h-72 md:w-96 md:h-96',
          'bg-[#2ec4b6] rounded-full',
          'absolute -bottom-24 -right-24',
          'pointer-events-none',
          'transition-transform duration-[2000ms] ease-in-out origin-bottom-right',
          isElevated ? 'z-50' : '-z-10',
          isTransitioning ? 'scale-[8]' : 'scale-100',
        ].join(' ')}
      />
    </>
  );
}
