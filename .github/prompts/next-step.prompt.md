# fractal-svg - Session Continuation

## Project Overview

A TypeScript CLI tool for generating fractal SVG images. Run `pnpm dev` for interactive mode or pass CLI args directly.

**Location:** `d:\CBN\PROJECTS\MEDIA\fractal-svg`

## What Was Done Last Session

### Bug Fixes
1. **Fixed decimal input validation** - Added `step: 'any'` to `@inquirer/prompts` number() for fractal dimensions
2. **Fixed carpet memory exhaustion** - Early termination in `generateRects()` when exceeding `maxRects`
3. **Fixed dragon curve algorithm** - Rewrote with correct turn-sequence method (was outputting a rectangle)
4. **Fixed open path gradient rendering** - Gradients now apply to **stroke** for open paths (dragon, hilbert, levy, etc.)

### New Features
1. **OS-specific CLI command output** - Backtick (`) on Windows, backslash (\) on Unix
2. **Type-specific iteration defaults/limits** - Prevents memory crashes:
   ```
   carpet:     default 4,  max 8
   koch:       default 4,  max 7
   dragon:     default 12, max 18
   levy:       default 14, max 18
   hilbert:    default 6,  max 9
   sierpinski: default 10, max 14
   peano:      default 4,  max 6
   gosper:     default 4,  max 6
   ```
3. **Auto-generated filenames** - Include all params (sides, iter, size, gradient info)
4. **Transparent background default** - Changed from `white` to `none`

## Current Fractal Types (All Working)

| Type | Strategy | Path Type |
|------|----------|-----------|
| carpet | Rectangles | N/A (rect elements) |
| koch | Path | Closed (filled) |
| mandelbrot | Contour path | Closed (filled) |
| dragon | Path | Open (stroked) |
| hilbert | Path | Open (stroked) |
| levy | Path | Open (stroked) |
| sierpinski | Path | Open (stroked) |
| peano | Path | Open (stroked) |
| gosper | Path | Open (stroked) |

## Key Code Locations

- **`FRACTAL_CONFIG`** (after type definitions, ~line 85) - Iteration defaults/limits per type
- **`renderPathSVG()`** (~line 1730) - Generic path renderer, handles open vs closed paths
- **`argsToCliCommand()`** (~line 165) - Generates CLI command for reproduction
- **`parseCLIArgs()`** (~line 520) - CLI parser with iteration clamping

## Usage Examples

```powershell
pnpm dev                    # Interactive mode
pnpm dev dragon --iter 12 --gradient "#22c55e,#06b6d4,#3b82f6"
pnpm dev levy --iter 14 --size 1024
pnpm dev koch --sides 6 --gradient "#ff6b6b,#4ecdc4"
pnpm dev --help             # Show all options with iteration limits
```

## Invariants (from AGENTS.md)

1. **Output must be square** - Width and height must be equal
2. **Fractal must be centered** - At middle of viewport
3. **Circular bounding space** - Fits within `(size/2, size/2)` radius `size/2 - margin`

## File Structure

```
src/index.ts          # Main CLI with all fractal generators (~2200 lines)
output/               # Default output directory for SVGs
docs/TASKS.md         # Task list for the project
AGENTS.md             # Invariants and implementation notes
```

## Task List Status

See `docs/TASKS.md` for full details:
- ✅ All 6 new line-based fractals implemented (dragon, hilbert, levy, sierpinski, peano, gosper)
- ✅ Path rendering unified (open paths use stroke, closed use fill)
- ✅ CLI and interactive menu updated with type-specific defaults
- ⬜ Optional: Generic L-system engine for custom user-defined fractals

## Potential Next Steps

1. Visual verification of all fractal outputs
2. Auto-scale `--strokeWidth` based on iteration count (higher iter = thinner strokes)
3. Add animation support (CSS or SMIL)
4. Generic L-system interpreter for user-defined fractals
5. Add Julia set support (similar to Mandelbrot with different formula)
