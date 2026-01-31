---
"@cbnsndwch/fractal-generator": minor
"@cbnsndwch/fractal-react": minor
"@cbnsndwch/fractal-cli": minor
"@cbnsndwch/fractal-demo": minor
---

### New Features

- **Monorepo Architecture**: Restructured project as a pnpm/Turborepo monorepo with separate packages
- **@cbnsndwch/fractal-generator**: Core isomorphic TypeScript library for generating fractal SVGs (Koch snowflake, Sierpinski triangle, Dragon curve, Hilbert curve, Mandelbrot, Julia sets)
- **@cbnsndwch/fractal-react**: React components including `FractalGenerator` component and `useFractalPlayground` headless hook for building custom UIs
- **@cbnsndwch/fractal-cli**: Command-line tool for generating fractal SVGs
- **@cbnsndwch/fractal-demo**: Next.js demo app with interactive playground using shadcn/ui components

### Improvements

- Added discriminated union types for fractal options
- Migrated demo app to shadcn/ui with accordion-organized controls
- Added repository metadata and keywords to all packages
