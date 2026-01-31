# Contributing to fractal-svg

Thank you for your interest in contributing to fractal-svg! This document provides guidelines and instructions for contributing to this monorepo.

## Development Setup

### Prerequisites

- Node.js >= 18
- pnpm >= 10 (required for workspace management)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/cbnsndwch/fractal-svg.git
cd fractal-svg

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run the CLI in development mode
pnpm dev
```

## Monorepo Structure

This project uses Turborepo to manage a monorepo with multiple packages:

```
fractal-svg/
├── packages/
│   ├── fractal-generator/    # Core library (isomorphic)
│   ├── fractal-cli/           # CLI tool
│   └── fractal-react/         # React components
├── apps/
│   └── demo/                  # Demo/playground app
├── turbo.json                 # Turborepo configuration
└── package.json               # Root package.json
```

### Package Dependencies

- `fractal-cli` depends on `fractal-generator`
- `fractal-react` depends on `fractal-generator`
- `demo` depends on both `fractal-generator` and `fractal-react`

## Development Workflow

### Working on a Package

```bash
# Navigate to the package directory
cd packages/fractal-generator

# Install dependencies (if needed)
pnpm install

# Run type checking
pnpm types

# Build the package
pnpm build

# Watch mode for development
pnpm dev
```

### Running Tasks Across All Packages

Turborepo allows you to run tasks across all packages in parallel:

```bash
# Build all packages
pnpm build

# Type check all packages
pnpm types

# Lint all packages
pnpm lint

# Run tests (when implemented)
pnpm test
```

### Working on the Demo App

```bash
cd apps/demo

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Adding a New Fractal Type

To add a new fractal type, you'll need to modify the `fractal-generator` package:

1. **Create the generator function** in `packages/fractal-generator/src/generators/`:

```typescript
// packages/fractal-generator/src/generators/myFractal.ts
import type { CommonOptions } from '../types';

export interface MyFractalOptions extends CommonOptions {
  // Add fractal-specific options here
  customParam?: number;
}

export function generateMyFractal(options: MyFractalOptions): string {
  const {
    size = 512,
    iterations = 4,
    // ... extract options
  } = options;

  // Your fractal generation logic here
  
  return `<svg>...</svg>`;
}
```

2. **Export the function** in `packages/fractal-generator/src/index.ts`:

```typescript
export { generateMyFractal } from './generators/myFractal';
export type { MyFractalOptions } from './generators/myFractal';
```

3. **Add CLI support** in `packages/fractal-cli/src/index.ts`:

```typescript
// Add to the type union
type FractalType = 'koch' | 'dragon' | /* ... */ | 'myfractal';

// Add to the interactive menu
const fractalOptions = [
  // ...
  { value: 'myfractal', name: 'My Fractal - Description', description: 'Details' }
];

// Add command-line handling
if (fractalType === 'myfractal') {
  // Handle specific arguments and options
}
```

4. **Add React support** in `packages/fractal-react/src/FractalGenerator.tsx`:

```typescript
// Update the type union and component logic
```

5. **Update documentation**:
   - Add examples to the main README
   - Add to the generator package README
   - Add to the CLI package README

## Testing

Currently, the project doesn't have automated tests. Contributions to add testing infrastructure are welcome!

When adding tests:
- Use Vitest for unit testing
- Add test files next to the code they test (e.g., `myFractal.test.ts`)
- Run tests with `pnpm test`

## Code Style

- TypeScript is required for all code
- Use ESLint for linting (`pnpm lint`)
- Follow existing code patterns and structure
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

## Commit Guidelines

We use Conventional Commits for clear commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat(generator): add Barnsley fern fractal
fix(cli): correct gradient parsing for single colors
docs(react): add example for responsive fractals
```

## Publishing Changes

This project uses [Changesets](https://github.com/changesets/changesets) for version management.

### Adding a Changeset

When you make changes that should be published, add a changeset:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages were affected
2. Choose the type of change (major/minor/patch)
3. Write a summary of the changes

The changeset will be committed with your PR.

### Release Process (Maintainers Only)

```bash
# Update package versions based on changesets
pnpm version-packages

# Build and publish to npm
pnpm release
```

## Pull Request Process

1. **Fork the repository** and create a new branch from `main`
2. **Make your changes** following the guidelines above
3. **Add a changeset** if applicable (`pnpm changeset`)
4. **Test your changes** locally
5. **Update documentation** if needed
6. **Submit a pull request** with a clear description

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Changes are tested locally
- [ ] Documentation is updated (if applicable)
- [ ] Changeset is added (if applicable)
- [ ] Commit messages follow Conventional Commits
- [ ] All packages build successfully (`pnpm build`)
- [ ] Type checking passes (`pnpm types`)

## Design Principles

When contributing, keep these principles in mind:

### Fractal Invariants

All fractal generators must follow these rules:

1. **Square Output** - Width and height must be equal
2. **Centered Fractals** - Fractals are centered at `(size/2, size/2)`
3. **Circular Bounding** - Fractals fit within an inscribed circle with radius `size/2 - margin`

### Package Boundaries

- `fractal-generator` - Pure generation logic, no I/O, isomorphic
- `fractal-cli` - CLI-specific code, file I/O, prompts
- `fractal-react` - React components only, minimal logic

## Questions or Issues?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
