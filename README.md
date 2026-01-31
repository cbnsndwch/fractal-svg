# @cbnsndwch/fractal-svg

A TypeScript library for generating beautiful, self-similar fractal patterns in SVG format.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)

## Features

- 🎨 **10 Fractal Types** - From classic Sierpinski carpets to space-filling curves
- 📐 **Vector Output** - Clean, scalable SVG files
- 🌈 **Gradient Support** - Multi-color linear gradients at any angle
- 🖼️ **Circular Backgrounds** - Optional circular backdrop behind fractals
- ⚡ **Efficient Rendering** - Line-based fractals use single `<path>` elements
- 🎮 **Interactive & CLI Modes** - User-friendly prompts or scriptable commands

## Installation

```bash
# Clone the repository
git clone https://github.com/cbnsndwch/fractal-svg.git
cd fractal-svg

# Install dependencies
pnpm install

# Run in interactive mode
pnpm dev
```

## Quick Start

### Interactive Mode

Simply run the development command to start an interactive session:

```bash
pnpm dev
```

You'll be guided through selecting a fractal type, customizing parameters, and generating your SVG.

### CLI Mode

Generate fractals directly from the command line:

```bash
# Koch snowflake
npx tsx src/index.ts koch --sides 3 --iter 4 --stroke black

# Sierpinski carpet with gradient
npx tsx src/index.ts carpet 1.8928 --gradient "#ff6b6b,#4ecdc4" --size 512

# Dragon curve
npx tsx src/index.ts dragon --iter 12 --stroke "#ff6b6b" --strokeWidth 1.5

# Mandelbrot set boundary
npx tsx src/index.ts mandelbrot --gradient "#22c55e,#06b6d4,#3b82f6" --resolution 512
```

## Supported Fractal Types

| Fractal | Description | Rendering |
|---------|-------------|-----------|
| `carpet` | Sierpinski-style grid carpet | Rectangles |
| `koch` | Koch curve snowflake/polygon | Path (filled) |
| `mandelbrot` | Mandelbrot set boundary | Contour path |
| `julia` | Julia set with customizable constant | Contour path |
| `dragon` | Dragon curve (L-system) | Path (stroked) |
| `hilbert` | Hilbert space-filling curve | Path (stroked) |
| `levy` | Lévy C curve (feathery pattern) | Path (stroked) |
| `sierpinski` | Sierpinski arrowhead curve | Path (stroked) |
| `peano` | Peano space-filling curve | Path (stroked) |
| `gosper` | Gosper flowsnake curve | Path (stroked) |

## Usage Guide

### Carpet Fractals

The carpet fractal creates Sierpinski-style patterns using recursive grid subdivision.

```bash
npx tsx src/index.ts carpet <dimension> [options]
```

**Parameters:**
- `<dimension>` - Fractal dimension (0, 2]. Classic Sierpinski carpet is ~1.8928

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--kMin <n>` | Minimum subdivision factor | 2 |
| `--kMax <n>` | Maximum subdivision factor | 9 |
| `--maxRects <n>` | Max rectangles before stopping | 40000 |

**Examples:**
```bash
# Classic Sierpinski carpet
npx tsx src/index.ts carpet 1.8928 --iter 4

# Low-dimension carpet with gradient
npx tsx src/index.ts carpet 0.63 --gradient "#f59e0b,#ef4444" --size 256
```

### Koch Curves

Generate Koch curve fractals with customizable polygon bases.

```bash
npx tsx src/index.ts koch [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--sides <n>` | Number of sides (3 = snowflake, 4 = square) | 3 |
| `--inward` | Make bumps point inward | false |

**Examples:**
```bash
# Classic Koch snowflake
npx tsx src/index.ts koch --sides 3 --iter 4 --fill "#3b82f6"

# Hexagonal Koch with gradient
npx tsx src/index.ts koch --sides 6 --iter 3 --gradient "#22c55e,#3b82f6"

# Square Koch with inward bumps
npx tsx src/index.ts koch --sides 4 --inward --stroke black --strokeWidth 2
```

### Mandelbrot Set

Render the boundary of the famous Mandelbrot set using contour tracing.

```bash
npx tsx src/index.ts mandelbrot [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--resolution <n>` | Grid resolution for contour tracing | 256 |
| `--centerX <n>` | Center X in complex plane | -0.5 |
| `--centerY <n>` | Center Y in complex plane | 0 |
| `--zoom <n>` | View width in complex plane | 3 |
| `--maxIter <n>` | Max escape iterations | 100 |
| `--threshold <n>` | Contour threshold level | 2 |

**Examples:**
```bash
# Default Mandelbrot
npx tsx src/index.ts mandelbrot --gradient "#22c55e,#06b6d4,#3b82f6"

# Zoomed into an interesting region
npx tsx src/index.ts mandelbrot --centerX -0.75 --zoom 0.5 --resolution 512
```

### Julia Sets

Generate Julia set boundaries with customizable complex constant c.

```bash
npx tsx src/index.ts julia [options]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--juliaReal <n>` | Real part of c constant | -0.7 |
| `--juliaImag <n>` | Imaginary part of c constant | 0.27015 |
| `--resolution <n>` | Grid resolution | 256 |
| `--centerX <n>` | Center X in complex plane | 0 |
| `--centerY <n>` | Center Y in complex plane | 0 |
| `--zoom <n>` | View width | 3.5 |

**Famous Julia Set Constants:**
```bash
# Dendrite pattern (default)
npx tsx src/index.ts julia --juliaReal -0.7 --juliaImag 0.27015

# Spiral arms
npx tsx src/index.ts julia --juliaReal -0.8 --juliaImag 0.156

# Rabbit-like
npx tsx src/index.ts julia --juliaReal -0.4 --juliaImag 0.6

# Sea horse valley
npx tsx src/index.ts julia --juliaReal 0.285 --juliaImag 0.01

# Lightning bolts
npx tsx src/index.ts julia --juliaReal -0.70176 --juliaImag -0.3842
```

### L-System Fractals

These fractals use L-system (Lindenmayer system) rules and are rendered as single SVG paths.

#### Dragon Curve

```bash
npx tsx src/index.ts dragon --iter 12 --stroke "#ff6b6b" --strokeWidth 1.5
```

#### Hilbert Curve

A space-filling curve that visits every point in a grid.

```bash
npx tsx src/index.ts hilbert --iter 6 --stroke "#3b82f6" --strokeWidth 1
```

#### Lévy C Curve

A beautiful feathery symmetric pattern.

```bash
npx tsx src/index.ts levy --iter 14 --stroke "#22c55e" --strokeWidth 0.5
```

#### Sierpinski Arrowhead

Line-based version of the Sierpinski triangle.

```bash
npx tsx src/index.ts sierpinski --iter 10 --stroke "#f59e0b"
```

#### Peano Curve

The original space-filling curve with 3×3 subdivision.

```bash
npx tsx src/index.ts peano --iter 4 --stroke "#8b5cf6"
```

#### Gosper Curve (Flowsnake)

A hexagonal space-filling curve with an organic shape.

```bash
npx tsx src/index.ts gosper --iter 4 --stroke "#ec4899"
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

### Gradient Example

```bash
npx tsx src/index.ts koch --sides 5 --iter 4 \
  --gradient "#ff6b6b,#4ecdc4,#45b7d1" \
  --gradientAngle 90 \
  --size 1024
```

### Circular Background

Add a circular background behind your fractal (useful for logo designs):

```bash
npx tsx src/index.ts dragon --iter 12 \
  --circleBg "#1e1e1e" \
  --stroke "#ffffff" \
  --bg transparent
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

## Output

All fractals are generated as square SVG files with the fractal centered in the viewport. The fractal is designed to fit within a circle inscribed in the square, respecting the margin parameter.

Output files are saved to the `output/` directory by default:

```
output/
├── carpet.svg
├── koch.svg
├── dragon.svg
└── logos/
    └── my-logo.svg
```

## Development

### Building

```bash
# Type check
pnpm types

# Build for distribution
pnpm build
```

### Project Structure

```
src/
├── index.ts          # Main CLI and fractal generation logic
└── spiral-fractal.ts # Spiral Koch fractal variant

scripts/
└── ralph/            # AI-assisted development tooling

docs/
└── TASKS.md          # Development task tracking

output/               # Generated SVG files
```

## Design Principles

When this library generates fractals, it follows these invariants:

1. **Square Output** - Width and height are always equal
2. **Centered Fractals** - All fractals are centered at `(size/2, size/2)`
3. **Circular Bounding** - Fractals fit within an inscribed circle with radius `size/2 - margin`

## Contributing

Contributions are welcome! Some ideas for future enhancements:

- [ ] Generic L-system engine for custom user-defined fractals
- [ ] Auto-scale strokeWidth based on iteration count
- [ ] Animation support (CSS or SMIL)
- [ ] Additional fractal types (Barnsley fern, tree fractals, etc.)

## License

MIT © [cbnsndwch](https://cbnsndwch.io)

---

<p align="center">
  Made with 🔷 fractal mathematics
</p>
