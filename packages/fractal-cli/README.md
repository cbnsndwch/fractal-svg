# @cbnsndwch/fractal-cli

Command-line interface for generating fractal SVG patterns.

## Installation

```bash
# Install globally
npm install -g @cbnsndwch/fractal-cli

# Or use with npx (no installation required)
npx @cbnsndwch/fractal-cli
```

## Usage

### Interactive Mode

Launch the interactive prompt to be guided through fractal generation:

```bash
fractal-svg
```

The interactive mode will:
1. Prompt you to select a fractal type
2. Ask for customization parameters
3. Generate the SVG and save it to the output directory

### Command Line Mode

Generate fractals directly with command-line arguments:

```bash
fractal-svg <type> [type-specific-args] [options]
```

## Fractal Types

### Koch Curve

```bash
fractal-svg koch [options]
```

**Options:**
- `--sides <n>` - Number of sides (3 = snowflake, 4 = square, etc.) [default: 3]
- `--inward` - Make bumps point inward [default: false]

**Examples:**
```bash
# Classic Koch snowflake
fractal-svg koch --sides 3 --iter 4 --fill "#3b82f6"

# Hexagonal Koch with gradient
fractal-svg koch --sides 6 --iter 3 --gradient "#22c55e,#3b82f6"

# Square Koch with inward bumps
fractal-svg koch --sides 4 --inward --stroke black --strokeWidth 2
```

### Dragon Curve

```bash
fractal-svg dragon [options]
```

**Example:**
```bash
fractal-svg dragon --iter 12 --stroke "#ff6b6b" --strokeWidth 1.5
```

### Hilbert Curve

```bash
fractal-svg hilbert [options]
```

**Example:**
```bash
fractal-svg hilbert --iter 6 --stroke "#3b82f6" --strokeWidth 1
```

### Lévy C Curve

```bash
fractal-svg levy [options]
```

**Example:**
```bash
fractal-svg levy --iter 14 --stroke "#22c55e" --strokeWidth 0.5
```

### Sierpinski Arrowhead

```bash
fractal-svg sierpinski [options]
```

**Example:**
```bash
fractal-svg sierpinski --iter 10 --stroke "#f59e0b"
```

### Peano Curve

```bash
fractal-svg peano [options]
```

**Example:**
```bash
fractal-svg peano --iter 4 --stroke "#8b5cf6"
```

### Gosper Curve

```bash
fractal-svg gosper [options]
```

**Example:**
```bash
fractal-svg gosper --iter 4 --stroke "#ec4899"
```

### Carpet Fractal

```bash
fractal-svg carpet <dimension> [options]
```

**Arguments:**
- `<dimension>` - Fractal dimension (0, 2]. Classic Sierpinski is ~1.8928 (required)

**Options:**
- `--kMin <n>` - Minimum subdivision factor [default: 2]
- `--kMax <n>` - Maximum subdivision factor [default: 9]
- `--maxRects <n>` - Max rectangles before stopping [default: 40000]

**Examples:**
```bash
# Classic Sierpinski carpet
fractal-svg carpet 1.8928 --iter 4

# Low-dimension carpet with gradient
fractal-svg carpet 0.63 --gradient "#f59e0b,#ef4444" --size 256
```

### Mandelbrot Set

```bash
fractal-svg mandelbrot [options]
```

**Options:**
- `--resolution <n>` - Grid resolution for contour tracing [default: 256]
- `--centerX <n>` - Center X in complex plane [default: -0.5]
- `--centerY <n>` - Center Y in complex plane [default: 0]
- `--zoom <n>` - View width in complex plane [default: 3]
- `--maxIter <n>` - Max escape iterations [default: 100]
- `--threshold <n>` - Contour threshold level [default: 2]

**Examples:**
```bash
# Default Mandelbrot
fractal-svg mandelbrot --gradient "#22c55e,#06b6d4,#3b82f6"

# Zoomed into an interesting region
fractal-svg mandelbrot --centerX -0.75 --zoom 0.5 --resolution 512
```

### Julia Set

```bash
fractal-svg julia [options]
```

**Options:**
- `--juliaReal <n>` - Real part of c constant [default: -0.7]
- `--juliaImag <n>` - Imaginary part of c constant [default: 0.27015]
- `--resolution <n>` - Grid resolution [default: 256]
- `--centerX <n>` - Center X in complex plane [default: 0]
- `--centerY <n>` - Center Y in complex plane [default: 0]
- `--zoom <n>` - View width [default: 3.5]

**Famous Julia constants:**
```bash
# Dendrite pattern
fractal-svg julia --juliaReal -0.7 --juliaImag 0.27015

# Spiral arms
fractal-svg julia --juliaReal -0.8 --juliaImag 0.156

# Rabbit-like
fractal-svg julia --juliaReal -0.4 --juliaImag 0.6

# Sea horse valley
fractal-svg julia --juliaReal 0.285 --juliaImag 0.01
```

## Common Options

These options work with all fractal types:

| Option | Description | Default |
|--------|-------------|---------|
| `--out <file>` | Output SVG filename | `<type>.svg` |
| `--size <px>` | Canvas size in pixels (min: 64) | 512 |
| `--iter <n>` | Iteration depth | type-specific |
| `--bg <color>` | Background color | transparent |
| `--circleBg <color>` | Circular background behind fractal | none |
| `--fill <color>` | Fill color | type-specific |
| `--gradient <colors>` | Comma-separated gradient stops | none |
| `--gradientAngle <n>` | Gradient angle in degrees | 135 |
| `--stroke <color>` | Stroke color | type-specific |
| `--strokeWidth <n>` | Stroke width | type-specific |
| `--margin <px>` | Margin around the fractal | 10 |

## Advanced Examples

### Multi-color Gradient

```bash
fractal-svg koch --sides 5 --iter 4 \
  --gradient "#ff6b6b,#4ecdc4,#45b7d1" \
  --gradientAngle 90 \
  --size 1024
```

### Logo with Circular Background

```bash
fractal-svg dragon --iter 12 \
  --circleBg "#1e1e1e" \
  --stroke "#ffffff" \
  --strokeWidth 2 \
  --bg transparent \
  --out logo.svg
```

### Custom Output Location

```bash
fractal-svg koch --sides 6 --iter 4 --out logos/my-logo.svg
```

## Output

Generated SVG files are saved to the `output/` directory by default. You can specify a custom path with the `--out` option.

```
output/
├── koch.svg
├── dragon.svg
├── carpet.svg
└── logos/
    └── my-logo.svg
```

## Iteration Limits

Each fractal type has recommended iteration limits to prevent memory exhaustion:

| Fractal | Default | Maximum | Complexity |
|---------|---------|---------|------------|
| carpet | 4 | 8 | N^iter rectangles |
| koch | 4 | 7 | 4^iter segments |
| mandelbrot | 4 | 10 | resolution-based |
| julia | 4 | 10 | resolution-based |
| dragon | 12 | 18 | 2^iter segments |
| hilbert | 6 | 9 | 4^iter segments |
| levy | 14 | 18 | 2^iter segments |
| sierpinski | 10 | 14 | 3^iter segments |
| peano | 4 | 6 | 9^iter segments |
| gosper | 4 | 6 | 7^iter segments |

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Type check
pnpm types
```

## Related Packages

- [@cbnsndwch/fractal-generator](../fractal-generator) - Core generation library
- [@cbnsndwch/fractal-react](../fractal-react) - React components

## License

MIT © [cbnsndwch](https://cbnsndwch.io)
