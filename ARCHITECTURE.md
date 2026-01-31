# Architecture

This document describes the architecture and design decisions of the fractal-svg monorepo.

## Overview

The fractal-svg project is organized as a monorepo containing three publishable packages and one demo application. The architecture follows a layered approach where each package has a specific responsibility and clear boundaries.

## Monorepo Structure

```
fractal-svg/
├── packages/
│   ├── fractal-generator/    # Layer 1: Core generation logic
│   ├── fractal-cli/           # Layer 2: CLI interface
│   └── fractal-react/         # Layer 2: React interface
├── apps/
│   └── demo/                  # Layer 3: Demo application
├── scripts/
│   └── ralph/                 # Development tooling
├── docs/                      # Documentation
├── turbo.json                 # Turborepo configuration
├── package.json               # Root workspace configuration
└── .changeset/                # Changeset configuration
```

## Package Architecture

### Layer 1: @cbnsndwch/fractal-generator

**Purpose:** Core fractal generation library

**Characteristics:**
- Isomorphic (works in Node.js and browser)
- Zero dependencies (pure TypeScript)
- No I/O operations
- Pure functions only

**Structure:**
```
fractal-generator/
├── src/
│   ├── index.ts              # Main exports
│   ├── types.ts              # TypeScript type definitions
│   ├── utils.ts              # Shared utilities (SVG helpers)
│   └── generators/           # Individual fractal generators
│       ├── koch.ts
│       ├── dragon.ts
│       ├── hilbert.ts
│       ├── levy.ts
│       ├── sierpinski.ts
│       ├── peano.ts
│       ├── gosper.ts
│       ├── carpet.ts
│       ├── mandelbrot.ts
│       └── julia.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts            # Build configuration
```

**API Design:**
- Each fractal has its own generator function (e.g., `generateKochCurve`)
- Each generator takes an options object and returns an SVG string
- Options follow a consistent pattern with common properties
- All generators are side-effect free

**Example:**
```typescript
export function generateKochCurve(options: KochOptions): string {
  // Pure function that generates and returns SVG string
  return `<svg>...</svg>`;
}
```

### Layer 2a: @cbnsndwch/fractal-cli

**Purpose:** Command-line interface for fractal generation

**Dependencies:**
- `@cbnsndwch/fractal-generator` (workspace dependency)
- `@inquirer/prompts` (for interactive mode)

**Structure:**
```
fractal-cli/
├── src/
│   └── index.ts              # CLI implementation and commands
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

**Features:**
- Interactive mode with prompts
- Command-line mode with arguments
- File I/O for saving SVGs
- Output directory management

**Binary:**
- Package provides a `fractal-svg` binary
- Shebang: `#!/usr/bin/env node`
- Entry point configured in `package.json` via `bin` field

### Layer 2b: @cbnsndwch/fractal-react

**Purpose:** React component library for fractal rendering

**Dependencies:**
- `@cbnsndwch/fractal-generator` (workspace dependency)
- `react` and `react-dom` (peer dependencies)

**Structure:**
```
fractal-react/
├── src/
│   ├── index.ts              # Exports
│   ├── FractalGenerator.tsx  # Main component
│   └── types.ts              # Component prop types
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

**Component Design:**
- Single main component: `FractalGenerator`
- Props-based API matching generator options
- Client-side only (uses 'use client' directive)
- Memoization for performance
- Type-safe props with TypeScript

### Layer 3: demo (Playground Application)

**Purpose:** Interactive demo and documentation site

**Dependencies:**
- `@cbnsndwch/fractal-generator`
- `@cbnsndwch/fractal-react`
- Next.js 15 + React 19
- Tailwind CSS

**Structure:**
```
demo/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── components/
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

**Features:**
- Interactive fractal playground
- Real-time parameter adjustment
- Preview and download functionality
- Responsive design
- Example gallery

## Dependency Flow

```
          ┌─────────────┐
          │    demo     │ (Layer 3: Application)
          └──────┬──────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼────┐     ┌────▼────┐
    │fractal- │     │fractal- │ (Layer 2: Interfaces)
    │  cli    │     │  react  │
    └────┬────┘     └────┬────┘
         │               │
         └───────┬───────┘
                 │
          ┌──────▼─────┐
          │  fractal-  │ (Layer 1: Core)
          │ generator  │
          └────────────┘
```

**Key Points:**
- Core generator has zero dependencies
- CLI and React packages depend only on the generator
- Demo app uses both interface packages
- No circular dependencies
- Clear separation of concerns

## Build System

### Turborepo Configuration

**File:** `turbo.json`

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "types": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Features:**
- Parallel task execution
- Dependency-aware builds
- Incremental builds with caching
- Task orchestration across packages

### Build Tools

**TypeScript Compilation:**
- All packages use TypeScript 5.9
- Shared `tsconfig.json` in root
- Package-specific `tsconfig.json` extends root config

**Bundling:**
- `tsup` for library packages (generator, cli, react)
- Generates ESM output
- Type declaration files (`.d.ts`)
- Source maps for debugging

**Next.js:**
- Used only for demo app
- Built-in bundling and optimization

## Package Management

### Workspaces

Uses pnpm workspaces for package management:

**Root `package.json`:**
```json
{
  "name": "@cbnsndwch/fractal-svg",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "types": "turbo types",
    "lint": "turbo lint"
  }
}
```

**Workspace Protocol:**
```json
{
  "dependencies": {
    "@cbnsndwch/fractal-generator": "workspace:*"
  }
}
```

- `workspace:*` ensures latest local version is used
- During publishing, replaced with actual version numbers
- Enables local development without publishing

## Version Management

### Changesets

**Tool:** `@changesets/cli`

**Workflow:**
1. Developer makes changes
2. Developer runs `pnpm changeset`
3. Changeset file is created in `.changeset/`
4. PR is merged with changeset
5. Maintainer runs `pnpm version-packages`
6. Versions are bumped according to changesets
7. Maintainer runs `pnpm release`
8. Packages are published to npm

**Benefits:**
- Semantic versioning
- Changelog generation
- Version coordination across packages
- Clear release notes

## Design Patterns

### Fractal Generation Pattern

All fractal generators follow this pattern:

```typescript
export interface FractalOptions extends CommonOptions {
  // Fractal-specific options
}

export function generateFractal(options: FractalOptions): string {
  // 1. Extract and set defaults
  const { size = 512, iterations = 4, ... } = options;
  
  // 2. Calculate center point
  const cx = size / 2;
  const cy = size / 2;
  
  // 3. Calculate bounding circle
  const radius = size / 2 - margin;
  
  // 4. Generate fractal geometry
  const geometry = generateGeometry(...);
  
  // 5. Build and return SVG
  return buildSVG({ size, bg, fill, stroke, gradient, ... }, geometry);
}
```

**Invariants:**
1. Output is always square (`width === height`)
2. Fractal is centered at `(size/2, size/2)`
3. Fractal fits within inscribed circle of radius `size/2 - margin`

### Component Pattern (React)

```typescript
export function FractalGenerator({ type, options, ...props }: Props) {
  // 1. Memoize SVG generation
  const svg = useMemo(() => {
    switch (type) {
      case 'koch': return generateKochCurve(options);
      case 'dragon': return generateDragonCurve(options);
      // ...
    }
  }, [type, options]);
  
  // 2. Render with dangerouslySetInnerHTML
  return <div {...props} dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

## Type System

### Common Types

```typescript
// Base options shared by all fractals
interface CommonOptions {
  size?: number;
  iterations?: number;
  bg?: string;
  circleBg?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  gradient?: string;
  gradientAngle?: number;
  margin?: number;
  out?: string;
}

// Fractal-specific options extend common options
interface KochOptions extends CommonOptions {
  sides?: number;
  inward?: boolean;
}
```

### Type Safety

- All options are typed
- Return types are explicit
- No `any` types in public API
- Strict TypeScript configuration

## Performance Considerations

### Generator Package
- Pure functions enable memoization
- No unnecessary allocations
- Efficient path building for line-based fractals

### React Package
- Memoized SVG generation
- Prevents unnecessary re-renders
- Recommendation: memoize options objects

### CLI Package
- Lazy-load heavy dependencies
- Stream file writes for large SVGs
- Progress indicators for long operations

## Testing Strategy (Future)

Planned testing approach:

1. **Unit Tests** (Vitest)
   - Test individual generator functions
   - Verify SVG structure and attributes
   - Test edge cases and error handling

2. **Integration Tests**
   - Test CLI commands
   - Test React component rendering

3. **Visual Regression Tests**
   - Compare generated SVGs to snapshots
   - Detect unintended visual changes

## Future Enhancements

Potential architectural improvements:

1. **Plugin System**
   - Allow user-defined fractals
   - Generic L-system engine

2. **Streaming Generation**
   - For very large/complex fractals
   - Reduce memory footprint

3. **Web Workers**
   - Offload generation in browser
   - Keep UI responsive

4. **Server Components**
   - SSR-compatible React components
   - Pre-generate at build time

## Related Documentation

- [README.md](./README.md) - User documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [packages/fractal-generator/README.md](./packages/fractal-generator/README.md) - Generator API docs
- [packages/fractal-cli/README.md](./packages/fractal-cli/README.md) - CLI documentation
- [packages/fractal-react/README.md](./packages/fractal-react/README.md) - React component docs
