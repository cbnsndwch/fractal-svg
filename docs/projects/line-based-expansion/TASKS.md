# Fractal SVG - Line-Based Fractal Expansion

## Goal

Add efficient line-based (path) fractal types that generate a single `<path>` SVG element instead of thousands of rectangles.

---

## Task List

### New Line-Based Fractals

- [X] **1. Dragon Curve**
    - Classic L-system fractal
    - Simple rules: fold a strip of paper in half repeatedly
    - Iterations: each doubles the number of segments
    - Good for: 10-15 iterations

- [X] **2. Hilbert Curve**
    - Space-filling curve (visits every point in a grid)
    - Recursive subdivision pattern
    - Creates a continuous path that fills the square
    - Good for: 4-7 iterations

- [X] **3. Lévy C Curve**
    - Also called "C curve" or "Lévy dragon"
    - Each segment replaced by two at 45° angles
    - Creates beautiful feathery patterns
    - Good for: 10-14 iterations

- [X] **4. Sierpinski Triangle (Line Version)**
    - Arrowhead curve variant - draws outline as single path
    - Alternative to filled-triangle approach
    - Good for: 6-10 iterations

- [X] **5. Peano Curve**
    - Original space-filling curve
    - 3x3 subdivision pattern
    - Denser than Hilbert
    - Good for: 3-5 iterations

- [X] **6. Gosper Curve (Flowsnake)**
    - Hexagonal space-filling curve
    - Beautiful organic shape
    - Good for: 4-6 iterations

---

### Refactoring Tasks

- [X] **7. Unify path rendering**
    - Extract common SVG path rendering logic
    - Share gradient/stroke handling across all line fractals
    - Consistent centering and scaling

- [X] **8. Add stroke-only mode for Koch**
    - Option to render as stroke instead of filled shape
    - Useful for intricate patterns

- [X] **9. Update CLI and interactive menu**
    - Add new fractal types to selection
    - Sensible defaults for each type

---

### Optional Enhancements

- [X] **10. L-System engine**
    - Generic L-system interpreter
    - Would allow custom user-defined fractals
    - Config: axiom, rules, angle, iterations

---

## Current Status

| Fractal          | Strategy     | Status                       |
| ---------------- | ------------ | ---------------------------- |
| Carpet           | Rectangles   | ✅ Exists (memory intensive) |
| Koch             | Path         | ✅ Exists                    |
| Mandelbrot       | Contour path | ✅ Exists                    |
| Julia            | Contour path | ✅ Added                     |
| Dragon           | Path         | ✅ Added                     |
| Hilbert          | Path         | ✅ Added                     |
| Lévy C           | Path         | ✅ Added                     |
| Sierpinski Arrow | Path         | ✅ Added                     |
| Peano            | Path         | ✅ Added                     |
| Gosper           | Path         | ✅ Added                     |

---

## Completed Tasks

- ✅ All 6 line-based fractals implemented (dragon, hilbert, levy, sierpinski, peano, gosper)
- ✅ Path rendering unified (open paths use stroke, closed use fill)
- ✅ CLI and interactive menu updated with type-specific defaults
- ✅ Julia set support with customizable c constant

## Remaining Optional Tasks

- ⬜ Generic L-system engine for custom user-defined fractals
- ⬜ Auto-scale strokeWidth based on iteration count
- ⬜ Animation support (CSS or SMIL)
