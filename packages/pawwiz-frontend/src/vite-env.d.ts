/// <reference types="vite/client" />

declare module 'lucide-react';

// SVGs imported with the `?react` suffix are transformed by @svgr/rollup
// into React components. This tells TypeScript the shape of those imports.
declare module '*.svg?react' {
  import type { FunctionComponent, SVGProps } from 'react';
  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
