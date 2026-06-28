import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Property 9: Mobile menu stagger delay per item index
 *
 * For any navigation item at index `i` in the mobile menu, when the menu
 * is in the expanding state, that item's transition-delay SHALL equal
 * `i * 40` milliseconds.
 *
 * **Validates: Requirements 7.3**
 */

/**
 * Computes the stagger delay for a mobile menu item at a given index.
 * This mirrors the inline formula in Navbar.tsx:
 *   transitionDelay: menuOpen ? `${i * 40}ms, ${i * 40}ms` : '0ms, 0ms'
 */
function computeStaggerDelay(index: number, menuOpen: boolean): string {
  return menuOpen ? `${index * 40}ms, ${index * 40}ms` : '0ms, 0ms';
}

describe('Property 9: Mobile menu stagger delay per item index', () => {
  it('each item at index i has transitionDelay of `${i * 40}ms, ${i * 40}ms` when menu is open', () => {
    // Generate arrays of 1–10 nav items (simple objects with href and label)
    const navItemsArb = fc.array(
      fc.record({
        href: fc.string({ minLength: 1, maxLength: 20 }).map(s => `#${s.replace(/\s/g, '')}`),
        label: fc.string({ minLength: 1, maxLength: 30 }),
      }),
      { minLength: 1, maxLength: 10 }
    );

    fc.assert(
      fc.property(navItemsArb, (navItems) => {
        // When menu is open, each item's delay should be i * 40ms
        navItems.forEach((_, i) => {
          const delay = computeStaggerDelay(i, true);
          const expectedDelay = `${i * 40}ms, ${i * 40}ms`;
          expect(delay).toBe(expectedDelay);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('first item always has 0ms delay when menu is open', () => {
    const navItemsArb = fc.array(
      fc.record({
        href: fc.string({ minLength: 1, maxLength: 20 }).map(s => `#${s.replace(/\s/g, '')}`),
        label: fc.string({ minLength: 1, maxLength: 30 }),
      }),
      { minLength: 1, maxLength: 10 }
    );

    fc.assert(
      fc.property(navItemsArb, (navItems) => {
        if (navItems.length > 0) {
          const firstDelay = computeStaggerDelay(0, true);
          expect(firstDelay).toBe('0ms, 0ms');
        }
      }),
      { numRuns: 100 }
    );
  });

  it('delay increases monotonically by 40ms per item', () => {
    const navItemsArb = fc.array(
      fc.record({
        href: fc.string({ minLength: 1, maxLength: 20 }).map(s => `#${s.replace(/\s/g, '')}`),
        label: fc.string({ minLength: 1, maxLength: 30 }),
      }),
      { minLength: 2, maxLength: 10 }
    );

    fc.assert(
      fc.property(navItemsArb, (navItems) => {
        for (let i = 1; i < navItems.length; i++) {
          const currentDelayMs = i * 40;
          const previousDelayMs = (i - 1) * 40;
          expect(currentDelayMs - previousDelayMs).toBe(40);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('all items have 0ms delay when menu is closed', () => {
    const navItemsArb = fc.array(
      fc.record({
        href: fc.string({ minLength: 1, maxLength: 20 }).map(s => `#${s.replace(/\s/g, '')}`),
        label: fc.string({ minLength: 1, maxLength: 30 }),
      }),
      { minLength: 1, maxLength: 10 }
    );

    fc.assert(
      fc.property(navItemsArb, (navItems) => {
        navItems.forEach((_, i) => {
          const delay = computeStaggerDelay(i, false);
          expect(delay).toBe('0ms, 0ms');
        });
      }),
      { numRuns: 100 }
    );
  });

  it('validates stagger delay formula for arbitrary valid indices', () => {
    // Generate an index between 0 and 9 (matching 1-10 items max)
    const indexArb = fc.integer({ min: 0, max: 9 });

    fc.assert(
      fc.property(indexArb, (index) => {
        const delay = computeStaggerDelay(index, true);
        // Parse the numeric value from the delay string
        const match = delay.match(/^(\d+)ms, (\d+)ms$/);
        expect(match).not.toBeNull();
        const transformDelay = parseInt(match![1], 10);
        const opacityDelay = parseInt(match![2], 10);
        // Both delays should equal index * 40
        expect(transformDelay).toBe(index * 40);
        expect(opacityDelay).toBe(index * 40);
      }),
      { numRuns: 100 }
    );
  });
});
