# @cbnsndwch/fractal-generator

Isomorphic TypeScript library for generating fractal SVG patterns. Works in Node.js and browser environments.

## Installation

```bash
npm install @cbnsndwch/fractal-generator
```

## Usage

```typescript
import {
  generateKochCurve,
  generateDragonCurve,
  generateHilbertCurve,
  generateMandelbrotSet,
  generateCarpetFractal,
  // ... and more
} from '@cbnsndwch/fractal-generator';

// Generate a Koch snowflake
const svg = generateKochCurve({
  sides: 6,
  iterations: 4,
  size: 512,
  fill: '#3b82f6',
  stroke: 'none',
  bg: 'transparent'
});

// Save to file (Node.js)
import { writeFileSync } from 'fs';
writeFileSync('koch-snowflake.svg', svg);

// Use in browser
document.getElementById('container').innerHTML = svg;
```

## Supported Fractals

### Line-based Fractals (Path rendering)

- `generateDragonCurve(options)` - Dragon curve
- `generateHilbertCurve(options)` - Hilbert space-filling curve
- `generateLevyCurve(options)` - Lévy C curve
- `generateSierpinskiArrowhead(options)` - Sierpinski triangle arrowhead
- `generatePeanoCurve(options)` - Peano space-filling curve
- `generateGosperCurve(options)` - Gosper flowsnake curve

### Shape-based Fractals

- `generateKochCurve(options)` - Koch curve (customizable polygon base)
- `generateCarpetFractal(options)` - Sierpinski-style carpet fractal
- `generateMandelbrotSet(options)` - Mandelbrot set boundary
- `generateJuliaSet(options)` - Julia set with custom constants

## Common Options

All generator functions accept an options object with these common properties:

```typescript
interface CommonOptions {
  size?: number;           // Canvas size in pixels (default: 512)
  iterations?: number;     // Iteration depth (varies by fractal)
  bg?: string;            // Background color (default: 'transparent')
  circleBg?: string;      // Optional circular background color
  fill?: string;          // Fill color (for filled fractals)
  stroke?: string;        // Stroke color (for stroked fractals)
  strokeWidth?: number;   // Stroke width (default varies by fractal)
  gradient?: string;      // Comma-separated gradient colors (e.g., "#ff0000,#00ff00,#0000ff")
  gradientAngle?: number; // Gradient angle in degrees (default: 135)
  margin?: number;        // Margin around fractal (default: 10)
  out?: string;          // Output filename (for CLI only)
}
```

## Fractal-Specific Options

### Koch Curve

```typescript
interface KochOptions extends CommonOptions {
  sides?: number;    // Number of sides (3 = snowflake, 4 = square, etc.)
  inward?: boolean;  // Make bumps point inward
}

generateKochCurve({
  sides: 6,
  iterations: 4,
  inward: false,
  fill: '#3b82f6'
});
```

### Carpet Fractal

```typescript
interface CarpetOptions extends CommonOptions {
  dimension: number;   // Fractal dimension (0, 2] (required)
  kMin?: number;      // Minimum subdivision factor (default: 2)
  kMax?: number;      // Maximum subdivision factor (default: 9)
  maxRects?: number;  // Max rectangles before stopping (default: 40000)
}

generateCarpetFractal({
  dimension: 1.8928,  // Classic Sierpinski carpet
  iterations: 4,
  gradient: '#ff6b6b,#4ecdc4'
});
```

### Mandelbrot Set

```typescript
interface MandelbrotOptions extends CommonOptions {
  resolution?: number;  // Grid resolution (default: 256)
  centerX?: number;     // Center X in complex plane (default: -0.5)
  centerY?: number;     // Center Y in complex plane (default: 0)
  zoom?: number;        // View width in complex plane (default: 3)
  maxIter?: number;     // Max escape iterations (default: 100)
  threshold?: number;   // Contour threshold level (default: 2)
}

generateMandelbrotSet({
  resolution: 512,
  centerX: -0.75,
  zoom: 0.5,
  gradient: '#22c55e,#06b6d4,#3b82f6'
});
```

### Julia Set

```typescript
interface JuliaOptions extends CommonOptions {
  juliaReal?: number;   // Real part of c constant (default: -0.7)
  juliaImag?: number;   // Imaginary part of c constant (default: 0.27015)
  resolution?: number;  // Grid resolution (default: 256)
  centerX?: number;     // Center X (default: 0)
  centerY?: number;     // Center Y (default: 0)
  zoom?: number;        // View width (default: 3.5)
}

generateJuliaSet({
  juliaReal: -0.8,
  juliaImag: 0.156,
  resolution: 512,
  gradient: '#ff6b6b,#4ecdc4,#45b7d1'
});
```

### L-System Curves

All L-system fractals (Dragon, Hilbert, Lévy, Sierpinski, Peano, Gosper) use the common options only:

```typescript
generateDragonCurve({
  iterations: 12,
  stroke: '#ff6b6b',
  strokeWidth: 1.5
});

generateHilbertCurve({
  iterations: 6,
  stroke: '#3b82f6',
  strokeWidth: 1
});
```

## Advanced Examples

### Multi-color Gradient

```typescript
const svg = generateKochCurve({
  sides: 5,
  iterations: 4,
  gradient: '#ff6b6b,#4ecdc4,#45b7d1',
  gradientAngle: 90,
  size: 1024
});
```

### Logo with Circular Background

```typescript
const logo = generateDragonCurve({
  iterations: 12,
  circleBg: '#1e1e1e',
  stroke: '#ffffff',
  strokeWidth: 2,
  bg: 'transparent',
  size: 512
});
```

### Browser Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Fractal Demo</title>
</head>
<body>
  <div id="fractal-container"></div>
  
  <script type="module">
    import { generateKochCurve } from '@cbnsndwch/fractal-generator';
    
    const svg = generateKochCurve({
      sides: 6,
      iterations: 4,
      gradient: '#ff6b6b,#4ecdc4'
    });
    
    document.getElementById('fractal-container').innerHTML = svg;
  </script>
</body>
</html>
```

## TypeScript Support

This library is written in TypeScript and provides full type definitions.

```typescript
import type { 
  KochOptions, 
  CarpetOptions, 
  MandelbrotOptions,
  CommonOptions 
} from '@cbnsndwch/fractal-generator';
```

## Design Principles

All generated fractals follow these invariants:

1. **Square Output** - Width and height are always equal
2. **Centered Fractals** - All fractals are centered at `(size/2, size/2)`
3. **Circular Bounding** - Fractals fit within an inscribed circle with radius `size/2 - margin`

## License

MIT © [cbnsndwch](https://cbnsndwch.io)
