# Fractal SVG Playground

Interactive demo application for the fractal-svg library.

## Features

- Real-time fractal generation and preview
- Support for all fractal types (Koch, Dragon, Hilbert, Lévy, Sierpinski, Peano, Gosper, Carpet, Mandelbrot, Julia)
- Interactive controls for customization:
  - Iteration depth
  - Canvas size
  - Colors (background, fill, stroke)
  - Stroke width
  - Type-specific parameters
- Download generated SVGs

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the playground.

## Build

```bash
pnpm build
pnpm start
```

## Technology Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- @cbnsndwch/fractal-generator
- @cbnsndwch/fractal-react
