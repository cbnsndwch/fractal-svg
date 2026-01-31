# Documentation Index

Welcome to the fractal-svg documentation!

## Main Documentation

- **[Main README](../README.md)** - Project overview, installation, and usage guide
- **[Architecture](../ARCHITECTURE.md)** - Monorepo structure and design decisions
- **[Contributing](../CONTRIBUTING.md)** - Guidelines for contributors

## Package Documentation

### Core Packages

- **[@cbnsndwch/fractal-generator](../packages/fractal-generator/README.md)** - Isomorphic SVG generation library
  - API reference for all generator functions
  - Detailed options documentation
  - Browser and Node.js usage examples

- **[@cbnsndwch/fractal-cli](../packages/fractal-cli/README.md)** - Command-line interface
  - Interactive mode guide
  - Command-line arguments reference
  - Examples for all fractal types

- **[@cbnsndwch/fractal-react](../packages/fractal-react/README.md)** - React components
  - Component API reference
  - React hooks usage
  - Next.js and MDX integration

### Applications

- **[Demo App](../apps/demo/README.md)** - Interactive playground
  - Setup and development guide
  - Technology stack overview

## Quick Links

### Getting Started

1. **For Library Users:**
   - Install: `npm install @cbnsndwch/fractal-generator`
   - Read: [Generator README](../packages/fractal-generator/README.md)

2. **For CLI Users:**
   - Install: `npm install -g @cbnsndwch/fractal-cli`
   - Read: [CLI README](../packages/fractal-cli/README.md)

3. **For React Developers:**
   - Install: `npm install @cbnsndwch/fractal-react`
   - Read: [React README](../packages/fractal-react/README.md)

4. **For Contributors:**
   - Read: [Contributing Guide](../CONTRIBUTING.md)
   - Read: [Architecture](../ARCHITECTURE.md)

### Development

- **Setup:** See [Contributing Guide](../CONTRIBUTING.md#development-setup)
- **Architecture:** See [Architecture Document](../ARCHITECTURE.md)
- **Monorepo Management:** Uses Turborepo and pnpm workspaces

## Fractal Types Reference

Quick reference for supported fractal types:

| Fractal | Generator | CLI | React | Category |
|---------|-----------|-----|-------|----------|
| Koch Curve | `generateKochCurve` | `koch` | `type="koch"` | Polygon-based |
| Dragon Curve | `generateDragonCurve` | `dragon` | `type="dragon"` | L-system |
| Hilbert Curve | `generateHilbertCurve` | `hilbert` | `type="hilbert"` | L-system |
| Lévy C Curve | `generateLevyCurve` | `levy` | `type="levy"` | L-system |
| Sierpinski | `generateSierpinskiArrowhead` | `sierpinski` | `type="sierpinski"` | L-system |
| Peano Curve | `generatePeanoCurve` | `peano` | `type="peano"` | L-system |
| Gosper Curve | `generateGosperCurve` | `gosper` | `type="gosper"` | L-system |
| Carpet | `generateCarpetFractal` | `carpet` | `type="carpet"` | Grid-based |
| Mandelbrot | `generateMandelbrotSet` | `mandelbrot` | `type="mandelbrot"` | Complex |
| Julia Set | `generateJuliaSet` | `julia` | `type="julia"` | Complex |

## Project Structure

```
fractal-svg/
├── packages/
│   ├── fractal-generator/    # Core generation library
│   ├── fractal-cli/           # CLI tool
│   └── fractal-react/         # React components
├── apps/
│   └── demo/                  # Demo/playground app
├── docs/                      # Documentation (you are here)
├── scripts/                   # Development scripts
├── README.md                  # Main documentation
├── ARCHITECTURE.md            # Architecture guide
├── CONTRIBUTING.md            # Contribution guidelines
└── turbo.json                 # Turborepo configuration
```

## Additional Resources

### External Links

- [npm - fractal-generator](https://www.npmjs.com/package/@cbnsndwch/fractal-generator)
- [npm - fractal-cli](https://www.npmjs.com/package/@cbnsndwch/fractal-cli)
- [npm - fractal-react](https://www.npmjs.com/package/@cbnsndwch/fractal-react)
- [GitHub Repository](https://github.com/cbnsndwch/fractal-svg)

### Related Topics

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Changesets](https://github.com/changesets/changesets)
- [L-systems](https://en.wikipedia.org/wiki/L-system)
- [Fractal Dimension](https://en.wikipedia.org/wiki/Fractal_dimension)

## License

All packages in this monorepo are licensed under the MIT License. See [LICENSE.md](../LICENSE.md) for details.
