import React from 'react';
import styles from '../styles/WindFlow.module.css';

export default function WindFlow() {
  return (
    <div className={styles.container}>
      <svg
        className={styles.svg}
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wind-gradient-hero" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2ec4b6" stopOpacity="0" />
            <stop offset="30%" stopColor="#2ec4b6" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#2ec4b6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2ec4b6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="leaf-gradient-hero" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2ec4b6" />
            <stop offset="100%" stopColor="#e9c46a" />
          </linearGradient>
        </defs>

        {/* Dynamic Wind Lines */}
        <g className={styles.windLayer}>
          <path className={`${styles.windLine} ${styles.windLine1}`} d="M 0 80 Q 250 40 500 100 T 1000 60" />
          <path className={`${styles.windLine} ${styles.windLine2}`} d="M 0 180 Q 300 240 600 130 T 1000 200" />
          <path className={`${styles.windLine} ${styles.windLine3}`} d="M 0 280 Q 200 160 550 220 T 1000 300" />
        </g>

        {/* Floating Leaves */}
        <g className={styles.leavesLayer}>
          {/* Leaf 1 */}
          <path className={`${styles.leaf} ${styles.leaf1}`} d="M 15 0 C 25 -10, 35 -5, 40 10 C 30 15, 20 10, 15 0 Z" />
          {/* Leaf 2 */}
          <path className={`${styles.leaf} ${styles.leaf2}`} d="M 10 5 C 20 -3, 30 -3, 35 12 C 25 15, 15 12, 10 5 Z" />
          {/* Leaf 3 */}
          <path className={`${styles.leaf} ${styles.leaf3}`} d="M 5 10 C 15 2, 25 5, 30 20 C 20 22, 10 18, 5 10 Z" />
          {/* Leaf 4 */}
          <path className={`${styles.leaf} ${styles.leaf4}`} d="M 15 -5 C 22 -12, 32 -7, 37 8 C 29 12, 19 8, 15 -5 Z" />
          {/* Leaf 5 */}
          <path className={`${styles.leaf} ${styles.leaf5}`} d="M 8 8 C 18 0, 28 3, 33 16 C 23 18, 13 14, 8 8 Z" />
        </g>
      </svg>
    </div>
  );
}
