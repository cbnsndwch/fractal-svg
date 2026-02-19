---
"@cbnsndwch/fractal-demo": minor
"@cbnsndwch/fractal-cli": minor
"@cbnsndwch/fractal-generator": minor
"@cbnsndwch/fractal-react": minor
---

This release introduces support for escape-time fractals and significant rendering improvements across the toolkit:

### Fractal Engine
- Added **Mandelbrot** and **Julia** set generators.
- Implemented **multi-band contour rendering** for escape-time fractals, producing clean, vector-based SVG paths.
- Improved coordinate transformation and centering logic for all fractal types.

### Demo Playground
- New interactive controls for Mandelbrot/Julia parameters (center, zoom, iterations, and bands).
- Added PWA support with manifest and optimized assets.
- Integrated new gradient presets and improved UI responsiveness.

### Tooling & CLI
- Updated CLI to support new generator parameters.
- Consolidated CI/CD workflows and improved Turborepo configuration for faster builds and better type safety.
