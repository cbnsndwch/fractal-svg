# Agent Instructions for fractal-svg

## Invariants

These rules must ALWAYS be followed when generating SVG output:

1. **Output must be square** - Width and height must be equal
2. **Fractal must be centered** - The fractal shape should be centered at the middle of the viewport
3. **Circular bounding space** - The fractal should fit within a circle centered at `(size/2, size/2)` with radius `size/2 - margin`

## Implementation Notes

When adding new fractal types, ensure:
- All coordinates are calculated relative to center point `(size/2, size/2)`
- Maximum extent of the fractal should not exceed the inscribed circle
- Use `margin` parameter to provide padding from viewport edges
