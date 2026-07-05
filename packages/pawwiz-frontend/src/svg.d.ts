// Type declarations for SVGs imported with the `?react` query suffix.
// @svgr/rollup transforms these into React components at build time.
// Without this file, TypeScript resolves `*.svg` to `string` (from vite/client)
// and can't find the `?react` variant at all.
declare module '*svg?react' {
  import type { FunctionComponent, SVGProps } from 'react';
  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
