# @cbnsndwch/fractal-react

React components and hooks for rendering fractal SVG patterns. Built on top of [@cbnsndwch/fractal-generator](../fractal-generator).

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
        options={{
          type: "koch",
          sides: 6,
          inward: false,
          iter: 4,
          size: 512,
          fill: "#3b82f6",
          stroke: "none",
          strokeWidth: 1,
          bg: "none",
          circleBg: "none",
          gradient: null,
          gradientAngle: 0,
          margin: 20,
        }}
      />
    </div>
  );
}
```

### With Gradient

```tsx
<FractalGenerator
  options={{
    type: "mandelbrot",
    resolution: 200,
    centerX: -0.5,
    centerY: 0,
    zoom: 1,
    maxIter: 200,
    iter: 4,
    size: 800,
    fill: "#000000",
    gradient: ["#22c55e", "#06b6d4", "#3b82f6"],
    gradientAngle: 135,
    stroke: "none",
    strokeWidth: 1,
    bg: "none",
    circleBg: "none",
    margin: 20,
  }}
/>
```

## Headless Playground Hook

For building custom fractal playground UIs, use the `useFractalPlayground` hook. It provides all the state management and actions without forcing any specific UI components.

```tsx
import {
  useFractalPlayground,
  FractalGenerator,
  GRADIENT_PRESETS,
  type FractalType,
} from "@cbnsndwch/fractal-react";

function MyPlayground() {
  const {
    effectiveOptions,
    options,
    fractalConfig,
    selectedGradient,
    updateOption,
    setFractalType,
    setGradient,
    downloadSVG,
  } = useFractalPlayground();

  return (
    <div>
      {/* Fractal Type Selector */}
      <select
        value={options.type}
        onChange={(e) => setFractalType(e.target.value as FractalType)}
      >
        <option value="koch">Koch Snowflake</option>
        <option value="dragon">Dragon Curve</option>
        <option value="hilbert">Hilbert Curve</option>
        <option value="mandelbrot">Mandelbrot Set</option>
        {/* ... more options */}
      </select>

      {/* Iterations Slider */}
      <label>
        Iterations: {options.iter}
        <input
          type="range"
          min={1}
          max={fractalConfig.maxIter}
          value={options.iter}
          onChange={(e) => updateOption("iter", Number(e.target.value))}
        />
      </label>

      {/* Size Slider */}
      <label>
        Size: {options.size}px
        <input
          type="range"
          min={200}
          max={1200}
          step={50}
          value={options.size}
          onChange={(e) => updateOption("size", Number(e.target.value))}
        />
      </label>

      {/* Gradient Selector */}
      <select value={selectedGradient} onChange={(e) => setGradient(e.target.value)}>
        {GRADIENT_PRESETS.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </select>

      {/* Preview */}
      <div className="fractal-preview">
        <FractalGenerator options={effectiveOptions} />
      </div>

      {/* Download Button */}
      <button onClick={() => downloadSVG(".fractal-preview")}>
        Download SVG
      </button>
    </div>
  );
}
```

### Hook API

```typescript
function useFractalPlayground(options?: UseFractalPlaygroundOptions): {
  // State
  options: GeneratorOptions;
  debouncedOptions: GeneratorOptions;
  effectiveOptions: GeneratorOptions;
  selectedGradient: string;
  showCircleBg: boolean;
  fractalConfig: FractalConfig;

  // Actions
  updateOption: (key, value) => void;
  updateOptions: (updates: Partial<GeneratorOptions>) => void;
  setFractalType: (type: FractalType) => void;
  setGradient: (gradientName: string) => void;
  setShowCircleBg: (show: boolean) => void;
  reset: () => void;
  downloadSVG: (containerSelector?: string) => void;
  getSVGString: (containerSelector?: string) => string | null;
};
```

#### Hook Options

```typescript
interface UseFractalPlaygroundOptions {
  initialOptions?: Partial<GeneratorOptions>;
  debounceDelay?: number; // Default: 150ms
  initialShowCircleBg?: boolean;
  initialGradient?: string; // Default: "Metapolis"
}
```

## Component API

### `FractalGenerator`

The main component for rendering fractals.

#### Props

```typescript
interface FractalGeneratorProps {
  options: GeneratorOptions;
  className?: string;
  style?: React.CSSProperties;
}
```

**`options`** (required): Configuration object for the fractal. The `type` field determines which fractal to render:

- `'koch'` - Koch curve snowflake
- `'dragon'` - Dragon curve
- `'hilbert'` - Hilbert space-filling curve
- `'levy'` - Lévy C curve
- `'sierpinski'` - Sierpinski arrowhead
- `'peano'` - Peano space-filling curve
- `'gosper'` - Gosper curve (flowsnake)
- `'carpet'` - Sierpinski-style carpet
- `'mandelbrot'` - Mandelbrot set
- `'julia'` - Julia set

## Exports

```typescript
// Components
export { FractalGenerator } from "./FractalGenerator";

// Hooks
export { useFractalPlayground } from "./useFractalPlayground";

// Constants
export { GRADIENT_PRESETS, DEFAULT_OPTIONS } from "./useFractalPlayground";
export { FRACTAL_CONFIG } from "@cbnsndwch/fractal-generator";

// Types
export type {
  FractalGeneratorProps,
  UseFractalPlaygroundOptions,
  UseFractalPlaygroundReturn,
  FractalPlaygroundState,
  FractalPlaygroundActions,
  GeneratorOptions,
  FractalType,
  Point,
};
```

## Gradient Presets

The `GRADIENT_PRESETS` array contains beautiful gradient presets from [uiGradients](https://github.com/Ghosh/uiGradients):

- Metapolis, Kyoo Pal, Stripe, Sunset, Mojito, Cherry, Pinky
- Sea Blue, Mango, Purple Love, Aqua Marine, Sunrise
- Sel, Bloody Mary, Moonlit Asteroid, Cool Blues, Timber
- Relay, Stellar

## License

MIT © [cbnsndwch](https://cbnsndwch.io)
