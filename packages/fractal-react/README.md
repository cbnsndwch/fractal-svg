# @cbnsndwch/fractal-react

React components for rendering fractal SVG patterns. Built on top of [@cbnsndwch/fractal-generator](../fractal-generator).

## Installation

```bash
npm install @cbnsndwch/fractal-react
```

This package has peer dependencies on React 18 or 19:

```bash
npm install react react-dom
```

## Usage

### Basic Example

```tsx
import { FractalGenerator } from "@cbnsndwch/fractal-react";

function App() {
  return (
    <div>
      <h1>My Fractal</h1>
      <FractalGenerator
        type="koch"
        options={{
          sides: 6,
          iterations: 4,
          size: 512,
          fill: "#3b82f6",
        }}
      />
    </div>
  );
}
```

### With Gradient

```tsx
<FractalGenerator
  type="mandelbrot"
  options={{
    resolution: 512,
    gradient: "#22c55e,#06b6d4,#3b82f6",
    gradientAngle: 135,
    size: 800,
  }}
/>
```

### Dynamic Parameters

```tsx
import { useState } from "react";
import { FractalGenerator } from "@cbnsndwch/fractal-react";

function InteractiveFractal() {
  const [iterations, setIterations] = useState(4);
  const [sides, setSides] = useState(6);

  return (
    <div>
      <div>
        <label>
          Iterations:
          <input
            type="range"
            min="1"
            max="7"
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
          />
          {iterations}
        </label>
      </div>

      <div>
        <label>
          Sides:
          <input
            type="range"
            min="3"
            max="12"
            value={sides}
            onChange={(e) => setSides(Number(e.target.value))}
          />
          {sides}
        </label>
      </div>

      <FractalGenerator
        type="koch"
        options={{
          sides,
          iterations,
          size: 512,
          gradient: "#ff6b6b,#4ecdc4",
        }}
      />
    </div>
  );
}
```

## Component API

### `FractalGenerator`

The main component for rendering fractals.

#### Props

```typescript
interface FractalGeneratorProps {
  type: FractalType;
  options: FractalOptions;
  className?: string;
  style?: React.CSSProperties;
}
```

**`type`** (required): The type of fractal to generate. Must be one of:

- `'koch'` - Koch curve
- `'dragon'` - Dragon curve
- `'hilbert'` - Hilbert curve
- `'levy'` - Lévy C curve
- `'sierpinski'` - Sierpinski arrowhead
- `'peano'` - Peano curve
- `'gosper'` - Gosper curve
- `'carpet'` - Sierpinski-style carpet
- `'mandelbrot'` - Mandelbrot set
- `'julia'` - Julia set

**`options`** (required): Configuration object for the fractal. Type varies by fractal type.

**`className`** (optional): CSS class name to apply to the container div.

**`style`** (optional): Inline styles for the container div.

## Fractal-Specific Options

### Koch Curve

```tsx
<FractalGenerator
  type="koch"
  options={{
    sides: 6, // Number of polygon sides
    inward: false, // Make bumps point inward
    iterations: 4,
    size: 512,
    fill: "#3b82f6",
  }}
/>
```

### Dragon Curve

```tsx
<FractalGenerator
  type="dragon"
  options={{
    iterations: 12,
    stroke: "#ff6b6b",
    strokeWidth: 1.5,
    size: 512,
  }}
/>
```

### Hilbert Curve

```tsx
<FractalGenerator
  type="hilbert"
  options={{
    iterations: 6,
    stroke: "#3b82f6",
    strokeWidth: 1,
    size: 512,
  }}
/>
```

### Carpet Fractal

```tsx
<FractalGenerator
  type="carpet"
  options={{
    dimension: 1.8928, // Required: fractal dimension
    kMin: 2,
    kMax: 9,
    maxRects: 40000,
    iterations: 4,
    gradient: "#ff6b6b,#4ecdc4",
    size: 512,
  }}
/>
```

### Mandelbrot Set

```tsx
<FractalGenerator
  type="mandelbrot"
  options={{
    resolution: 512,
    centerX: -0.5,
    centerY: 0,
    zoom: 3,
    maxIter: 100,
    threshold: 2,
    gradient: "#22c55e,#06b6d4,#3b82f6",
    size: 800,
  }}
/>
```

### Julia Set

```tsx
<FractalGenerator
  type="julia"
  options={{
    juliaReal: -0.7,
    juliaImag: 0.27015,
    resolution: 512,
    centerX: 0,
    centerY: 0,
    zoom: 3.5,
    gradient: "#ff6b6b,#4ecdc4,#45b7d1",
    size: 800,
  }}
/>
```

## Common Options

All fractal types support these common options:

```typescript
interface CommonOptions {
  size?: number; // Canvas size in pixels (default: 512)
  iterations?: number; // Iteration depth (varies by fractal)
  bg?: string; // Background color (default: 'transparent')
  circleBg?: string; // Optional circular background color
  fill?: string; // Fill color (for filled fractals)
  stroke?: string; // Stroke color (for stroked fractals)
  strokeWidth?: number; // Stroke width
  gradient?: string; // Comma-separated gradient colors
  gradientAngle?: number; // Gradient angle in degrees (default: 135)
  margin?: number; // Margin around fractal (default: 10)
}
```

## Advanced Examples

### Styled Container

```tsx
<FractalGenerator
  type="koch"
  options={{
    sides: 5,
    iterations: 4,
    gradient: "#ff6b6b,#4ecdc4",
    size: 600,
  }}
  className="fractal-container"
  style={{
    border: "2px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f5f5f5",
  }}
/>
```

### Responsive Fractal

```tsx
import { useState, useEffect } from "react";

function ResponsiveFractal() {
  const [size, setSize] = useState(512);

  useEffect(() => {
    const handleResize = () => {
      const containerWidth =
        document.getElementById("fractal")?.clientWidth || 512;
      setSize(Math.min(containerWidth, 800));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div id="fractal">
      <FractalGenerator
        type="koch"
        options={{
          sides: 6,
          iterations: 4,
          size,
          gradient: "#ff6b6b,#4ecdc4",
        }}
      />
    </div>
  );
}
```

### Download SVG

```tsx
import { FractalGenerator } from "@cbnsndwch/fractal-react";
import { generateKochCurve } from "@cbnsndwch/fractal-generator";

function DownloadableFractal() {
  const handleDownload = () => {
    const svg = generateKochCurve({
      sides: 6,
      iterations: 4,
      size: 1024,
      gradient: "#ff6b6b,#4ecdc4",
    });

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fractal.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <FractalGenerator
        type="koch"
        options={{
          sides: 6,
          iterations: 4,
          size: 512,
          gradient: "#ff6b6b,#4ecdc4",
        }}
      />
      <button onClick={handleDownload}>Download SVG</button>
    </div>
  );
}
```

## Use in Next.js

This component is a client component. Make sure to use the `'use client'` directive:

```tsx
"use client";

import { FractalGenerator } from "@cbnsndwch/fractal-react";

export default function Page() {
  return (
    <FractalGenerator
      type="dragon"
      options={{
        iterations: 12,
        stroke: "#ff6b6b",
        size: 512,
      }}
    />
  );
}
```

## Use in MDX

Perfect for including fractals in your documentation:

```mdx
import { FractalGenerator } from "@cbnsndwch/fractal-react";

# My Fractal Documentation

Here's a beautiful Koch snowflake:

<FractalGenerator
  type="koch"
  options={{
    sides: 6,
    iterations: 4,
    size: 512,
    gradient: "#22c55e,#3b82f6",
  }}
/>
```

## TypeScript Support

This library is fully typed with TypeScript:

```typescript
import type {
  FractalType,
  FractalOptions,
  KochOptions,
  DragonOptions,
} from "@cbnsndwch/fractal-react";
```

## Performance

The component memoizes the generated SVG and only regenerates when options change. For optimal performance:

1. **Memoize options objects** to prevent unnecessary re-renders:

   ```tsx
   const options = useMemo(
     () => ({
       sides: 6,
       iterations: 4,
       size: 512,
     }),
     [
       /* dependencies */
     ],
   );
   ```

2. **Use reasonable iteration limits** - higher iterations exponentially increase complexity.

3. **Consider debouncing** when allowing user input to control parameters.

## Related Packages

- [@cbnsndwch/fractal-generator](../fractal-generator) - Core generation library (used internally)
- [@cbnsndwch/fractal-cli](../fractal-cli) - CLI tool for generating fractals

## License

MIT © [cbnsndwch](https://cbnsndwch.io)
