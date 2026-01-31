// fractal-svg.ts
// Usage:
//   npx tsx src/index.ts                     (interactive mode)
//   npx tsx src/index.ts carpet 1.8928 --out carpet.svg --size 512 --iter 4
//   npx tsx src/index.ts koch --sides 3 --iter 4
//
// Generates self-similar fractal SVGs:
//   - Grid carpet fractals (Sierpinski-style)
//   - Koch curve fractals (snowflake-style)

import * as fs from 'node:fs';
import * as path from 'node:path';
import { select, input, confirm, number } from '@inquirer/prompts';

// ============================================================================
// Types
// ============================================================================

type FractalType = 'carpet' | 'koch' | 'mandelbrot' | 'julia' | 'dragon' | 'hilbert' | 'levy' | 'sierpinski' | 'peano' | 'gosper';

type BaseArgs = {
    type: FractalType;
    out: string;
    size: number;
    iter: number;
    bg: string;
    fill: string;
    gradient: string[] | null;
    gradientAngle: number;
    stroke: string;
    strokeWidth: number;
    margin: number;
};

type CarpetArgs = BaseArgs & {
    type: 'carpet';
    D: number;
    kMin: number;
    kMax: number;
    maxRects: number;
};

type KochArgs = BaseArgs & {
    type: 'koch';
    sides: number; // 3 = snowflake, 4 = square koch, etc.
    inward: boolean; // true = inward bumps, false = outward
};

type MandelbrotArgs = BaseArgs & {
    type: 'mandelbrot';
    resolution: number; // Grid resolution for marching squares
    centerX: number; // Center of view in complex plane
    centerY: number;
    zoom: number; // Zoom level (smaller = more zoomed in)
    maxIter: number; // Max iterations for escape calculation
    threshold: number; // Escape threshold (contour level)
};

type JuliaArgs = BaseArgs & {
    type: 'julia';
    resolution: number; // Grid resolution for marching squares
    juliaReal: number; // Real part of the c constant
    juliaImag: number; // Imaginary part of the c constant
    centerX: number; // Center of view in complex plane
    centerY: number;
    zoom: number; // Zoom level (smaller = more zoomed in)
    maxIter: number; // Max iterations for escape calculation
    threshold: number; // Escape threshold (contour level)
};

type DragonArgs = BaseArgs & {
    type: 'dragon';
};

type HilbertArgs = BaseArgs & {
    type: 'hilbert';
};

type LevyArgs = BaseArgs & {
    type: 'levy';
};

type SierpinskiArgs = BaseArgs & {
    type: 'sierpinski';
};

type PeanoArgs = BaseArgs & {
    type: 'peano';
};

type GosperArgs = BaseArgs & {
    type: 'gosper';
};

type Args = CarpetArgs | KochArgs | MandelbrotArgs | JuliaArgs | DragonArgs | HilbertArgs | LevyArgs | SierpinskiArgs | PeanoArgs | GosperArgs;

// ============================================================================
// Fractal Configuration - iteration limits and defaults
// ============================================================================

const FRACTAL_CONFIG: Record<FractalType, { defaultIter: number; maxIter: number; segmentFormula: string }> = {
    carpet:     { defaultIter: 4,  maxIter: 8,  segmentFormula: 'N^iter rectangles (exponential)' },
    koch:       { defaultIter: 4,  maxIter: 7,  segmentFormula: '4^iter segments' },
    mandelbrot: { defaultIter: 4,  maxIter: 10, segmentFormula: 'resolution-based' },
    julia:      { defaultIter: 4,  maxIter: 10, segmentFormula: 'resolution-based' },
    dragon:     { defaultIter: 12, maxIter: 18, segmentFormula: '2^iter+1 segments' },
    hilbert:    { defaultIter: 6,  maxIter: 9,  segmentFormula: '4^iter segments' },
    levy:       { defaultIter: 14, maxIter: 18, segmentFormula: '2^iter+1 segments' },
    sierpinski: { defaultIter: 10, maxIter: 14, segmentFormula: '3^iter segments' },
    peano:      { defaultIter: 4,  maxIter: 6,  segmentFormula: '9^iter segments' },
    gosper:     { defaultIter: 4,  maxIter: 6,  segmentFormula: '7^iter segments' },
};

function getIterationConfig(type: FractalType): { defaultIter: number; maxIter: number } {
    return FRACTAL_CONFIG[type] || { defaultIter: 4, maxIter: 8 };
}

// ============================================================================
// Help
// ============================================================================

function printHelp(): void {
    console.log(`
fractal-svg - Generate self-similar fractal SVGs

USAGE:
  npx tsx src/index.ts                           (interactive mode)
  npx tsx src/index.ts carpet <dimension> [options]
  npx tsx src/index.ts koch [options]
  npx tsx src/index.ts mandelbrot [options]
  npx tsx src/index.ts julia [options]
  npx tsx src/index.ts dragon [options]
  npx tsx src/index.ts hilbert [options]
  npx tsx src/index.ts levy [options]
  npx tsx src/index.ts sierpinski [options]
  npx tsx src/index.ts peano [options]
  npx tsx src/index.ts gosper [options]

FRACTAL TYPES:
  carpet        Grid carpet fractal (Sierpinski-style rectangles)
  koch          Koch curve fractal (snowflake-style paths)
  mandelbrot    Mandelbrot set boundary (contour-traced paths)
  julia         Julia set boundary (contour-traced paths with constant c)
  dragon        Dragon curve (L-system path fractal)
  hilbert       Hilbert curve (space-filling path)
  levy          Lévy C Curve (feathery symmetric pattern)
  sierpinski    Sierpinski Triangle Arrowhead (line-based triangle)
  peano         Peano curve (3x3 space-filling curve)
  gosper        Gosper curve/Flowsnake (hexagonal space-filling)

CARPET OPTIONS:
  <dimension>       Fractal dimension, a number in (0, 2]
                    Examples: 1.8928 (Sierpinski carpet), 0.63, 1.5
  --kMin <n>        Minimum subdivision factor (default: 2)
  --kMax <n>        Maximum subdivision factor (default: 9)
  --maxRects <n>    Maximum rectangles before stopping (default: 40000)

KOCH OPTIONS:
  --sides <n>       Number of sides for base polygon (default: 3 = snowflake)
  --inward          Make bumps point inward (default: outward)

MANDELBROT OPTIONS:
  --resolution <n>  Grid resolution for contour tracing (default: 256)
  --centerX <n>     Center X in complex plane (default: -0.5)
  --centerY <n>     Center Y in complex plane (default: 0)
  --zoom <n>        View width in complex plane (default: 3)
  --maxIter <n>     Max escape iterations (default: 100)
  --threshold <n>   Contour threshold level (default: 2)

JULIA OPTIONS:
  --juliaReal <n>   Real part of c constant (default: -0.7, try: -0.4, 0.285)
  --juliaImag <n>   Imaginary part of c constant (default: 0.27015, try: 0.6, 0.01)
  --resolution <n>  Grid resolution for contour tracing (default: 256)
  --centerX <n>     Center X in complex plane (default: 0)
  --centerY <n>     Center Y in complex plane (default: 0)
  --zoom <n>        View width in complex plane (default: 3.5)
  --maxIter <n>     Max escape iterations (default: 100)
  --threshold <n>   Contour threshold level (default: 2)

  Famous Julia set constants:
    c = -0.7 + 0.27015i  (dendrite pattern, default)
    c = -0.8 + 0.156i    (spiral arms)
    c = -0.4 + 0.6i      (rabbit-like)
    c = 0.285 + 0.01i    (sea horse valley)
    c = -0.70176 - 0.3842i (lightning bolts)

COMMON OPTIONS:
  --out <file>        Output SVG filename
  --size <px>         Canvas size in pixels (default: 512, min: 64)
  --iter <n>          Iteration depth (type-specific defaults and limits below)
  --bg <color>        Background color (default: none/transparent)
  --fill <color>      Fill color (default: black for carpet, none for curves)
  --gradient <colors> Comma-separated gradient color stops (overrides --fill)
                      Example: --gradient "#ff6b6b,#4ecdc4,#45b7d1"
  --gradientAngle <n> Gradient angle in degrees (default: 135, diagonal)
  --stroke <color>    Stroke color (default: none for carpet, black for curves)
  --strokeWidth <n>   Stroke width (default: 0 for carpet, 2 for curves)
  --margin <px>       Margin around the fractal (default: 10)

ITERATION LIMITS (to prevent memory exhaustion):
  carpet:     default 4,  max 8   (N^iter rectangles)
  koch:       default 4,  max 7   (4^iter segments)
  dragon:     default 12, max 18  (2^iter segments)
  levy:       default 14, max 18  (2^iter segments)
  hilbert:    default 6,  max 9   (4^iter segments)
  sierpinski: default 10, max 14  (3^iter segments)
  peano:      default 4,  max 6   (9^iter segments)
  gosper:     default 4,  max 6   (7^iter segments)

EXAMPLES:
  npx tsx src/index.ts carpet 1.8928 --gradient "#ff6b6b,#4ecdc4" --size 256
  npx tsx src/index.ts koch --sides 3 --iter 4 --stroke black --strokeWidth 2
  npx tsx src/index.ts koch --sides 6 --iter 3 --gradient "#22c55e,#3b82f6"
  npx tsx src/index.ts dragon --iter 12 --stroke "#ff6b6b" --strokeWidth 1.5
  npx tsx src/index.ts mandelbrot --gradient "#22c55e,#06b6d4,#3b82f6" --resolution 512
  npx tsx src/index.ts julia --juliaReal -0.8 --juliaImag 0.156 --gradient "#f59e0b,#ef4444"
`);
}

// ============================================================================
// CLI Command Generator
// ============================================================================

function argsToCliCommand(args: Args): string {
    // Use OS-appropriate line continuation: ` for Windows, \ for Unix
    const isWindows = process.platform === 'win32';
    const lineContinuation = isWindows ? ' `' : ' \\';
    
    const lines: string[] = ['npx tsx src/index.ts'];

    // Fractal type and type-specific args
    if (args.type === 'carpet') {
        lines.push(`  ${args.type} ${args.D}`);
        if (args.kMin !== 2) lines.push(`  --kMin ${args.kMin}`);
        if (args.kMax !== 9) lines.push(`  --kMax ${args.kMax}`);
        if (args.maxRects !== 40_000) lines.push(`  --maxRects ${args.maxRects}`);
    } else if (args.type === 'koch') {
        lines.push(`  ${args.type}`);
        lines.push(`  --sides ${args.sides}`);
        if (args.inward) lines.push('  --inward');
    } else if (args.type === 'mandelbrot') {
        lines.push(`  ${args.type}`);
        if (args.resolution !== 256) lines.push(`  --resolution ${args.resolution}`);
        if (args.centerX !== -0.5) lines.push(`  --centerX ${args.centerX}`);
        if (args.centerY !== 0) lines.push(`  --centerY ${args.centerY}`);
        if (args.zoom !== 3) lines.push(`  --zoom ${args.zoom}`);
        if (args.maxIter !== 100) lines.push(`  --maxIter ${args.maxIter}`);
        if (args.threshold !== 2) lines.push(`  --threshold ${args.threshold}`);
    } else if (args.type === 'julia') {
        lines.push(`  ${args.type}`);
        lines.push(`  --juliaReal ${args.juliaReal}`);
        lines.push(`  --juliaImag ${args.juliaImag}`);
        if (args.resolution !== 256) lines.push(`  --resolution ${args.resolution}`);
        if (args.centerX !== 0) lines.push(`  --centerX ${args.centerX}`);
        if (args.centerY !== 0) lines.push(`  --centerY ${args.centerY}`);
        if (args.zoom !== 3.5) lines.push(`  --zoom ${args.zoom}`);
        if (args.maxIter !== 100) lines.push(`  --maxIter ${args.maxIter}`);
        if (args.threshold !== 2) lines.push(`  --threshold ${args.threshold}`);
    } else {
        lines.push(`  ${args.type}`);
    }

    // Common options
    lines.push(`  --out "${args.out}"`);
    lines.push(`  --size ${args.size}`);
    lines.push(`  --iter ${args.iter}`);

    if (args.bg !== 'none') lines.push(`  --bg "${args.bg}"`);

    if (args.gradient && args.gradient.length >= 2) {
        lines.push(`  --gradient "${args.gradient.join(',')}"`);
        lines.push(`  --gradientAngle ${args.gradientAngle}`);
    } else if (args.fill !== 'black') {
        lines.push(`  --fill "${args.fill}"`);
    }

    if (args.stroke !== 'none') lines.push(`  --stroke "${args.stroke}"`);
    if (args.strokeWidth > 0) lines.push(`  --strokeWidth ${args.strokeWidth}`);
    if (args.margin !== 10) lines.push(`  --margin ${args.margin}`);

    return lines.join(lineContinuation + '\n');
}

function printCliCommand(args: Args): void {
    console.log('\n📋 Equivalent CLI command:\n');
    console.log(argsToCliCommand(args));
    console.log('');
}

// ============================================================================
// Interactive Mode
// ============================================================================

async function runInteractive(): Promise<Args> {
    console.log('\n🔷 Fractal SVG Generator\n');

    const fractalType = await select({
        message: 'Select fractal type:',
        choices: [
            { name: 'Grid Carpet (Sierpinski-style rectangles)', value: 'carpet' as const },
            { name: 'Koch Curve (Snowflake-style paths)', value: 'koch' as const },
            { name: 'Mandelbrot Set (contour-traced boundary)', value: 'mandelbrot' as const },
            { name: 'Julia Set (contour-traced with constant c)', value: 'julia' as const },
            { name: 'Dragon Curve (L-system path fractal)', value: 'dragon' as const },
            { name: 'Hilbert Curve (space-filling path)', value: 'hilbert' as const },
            { name: 'Lévy C Curve (feathery symmetric pattern)', value: 'levy' as const },
            { name: 'Sierpinski Triangle Arrowhead (line-based triangle)', value: 'sierpinski' as const },
            { name: 'Peano Curve (3x3 space-filling curve)', value: 'peano' as const },
            { name: 'Gosper Curve/Flowsnake (hexagonal space-filling)', value: 'gosper' as const },
        ],
    });

    // Get type-specific iteration config
    const iterConfig = getIterationConfig(fractalType);

    // Common options
    const size = await number({
        message: 'Canvas size (pixels):',
        default: 512,
    }) ?? 512;

    const iter = await number({
        message: `Iteration depth (1-${iterConfig.maxIter}):`,
        default: iterConfig.defaultIter,
        min: 1,
        max: iterConfig.maxIter,
    }) ?? iterConfig.defaultIter;

    const bg = await input({
        message: 'Background color:',
        default: 'none',
    });

    const useGradient = await confirm({
        message: 'Use gradient fill?',
        default: true,
    });

    let fill = 'black';
    let gradient: string[] | null = null;
    let gradientAngle = 135;

    if (useGradient) {
        const gradientColors = await input({
            message: 'Gradient colors (comma-separated):',
            default: '#22c55e,#06b6d4,#3b82f6',
        });
        gradient = gradientColors.split(',').map((c: string) => c.trim());
        
        gradientAngle = await number({
            message: 'Gradient angle (degrees):',
            default: 135,
        }) ?? 135;
    } else {
        fill = await input({
            message: 'Fill color:',
            default: 'black',
        });
    }

    const baseArgs: Omit<BaseArgs, 'type'> = {
        out: '', // Will be set later
        size,
        iter,
        bg,
        fill,
        gradient,
        gradientAngle,
        stroke: 'none',
        strokeWidth: 0,
        margin: 10,
    };

    if (fractalType === 'carpet') {
        const D = await number({
            message: 'Fractal dimension (0-2, e.g., 1.8928 for Sierpinski):',
            default: 1.8928,
            step: 'any',
        }) ?? 1.8928;

        const out = await input({
            message: 'Output filename:',
            default: `output/carpet-D${D.toFixed(4)}.svg`,
        });

        return {
            ...baseArgs,
            type: 'carpet',
            D,
            out,
            kMin: 2,
            kMax: 9,
            maxRects: 40_000,
        };
    } else if (fractalType === 'koch') {
        const sides = await select({
            message: 'Base polygon shape:',
            choices: [
                { name: 'Triangle (Koch Snowflake)', value: 3 },
                { name: 'Square', value: 4 },
                { name: 'Pentagon', value: 5 },
                { name: 'Hexagon', value: 6 },
                { name: 'Heptagon', value: 7 },
                { name: 'Octagon', value: 8 },
                { name: 'Nonagon', value: 9 },
                { name: 'Decagon', value: 10 },
                { name: 'Dodecagon', value: 12 },
                { name: 'Icosagon', value: 20 },
                { name: 'Tetracontagon', value: 40 },
            ],
        });

        const inward = await confirm({
            message: 'Point bumps inward?',
            default: false,
        });

        // Build descriptive filename from all parameters
        const gradientSuffix = gradient ? `-grad${gradient.length}c-${gradientAngle}deg` : `-${fill.replace('#', '')}`;
        const directionSuffix = inward ? '-inward' : '';
        const defaultFilename = `output/koch-${sides}sides${directionSuffix}-i${iter}-${size}px${gradientSuffix}.svg`;

        const out = await input({
            message: 'Output filename:',
            default: defaultFilename,
        });

        return {
            ...baseArgs,
            type: 'koch',
            sides,
            inward,
            out,
            stroke: gradient ? 'none' : 'black',
            strokeWidth: gradient ? 0 : 2,
        };
    } else if (fractalType === 'dragon') {
        const out = await input({
            message: 'Output filename:',
            default: 'output/dragon.svg',
        });

        return {
            ...baseArgs,
            type: 'dragon',
            out,
            stroke: gradient ? 'none' : 'black',
            strokeWidth: gradient ? 0 : 2,
        };
    } else if (fractalType === 'hilbert') {
        const out = await input({
            message: 'Output filename:',
            default: 'output/hilbert.svg',
        });

        return {
            ...baseArgs,
            type: 'hilbert',
            out,
            stroke: gradient ? 'none' : 'black',
            strokeWidth: gradient ? 0 : 2,
        };
    } else if (fractalType === 'levy') {
        const out = await input({
            message: 'Output filename:',
            default: 'output/levy.svg',
        });

        return {
            ...baseArgs,
            type: 'levy',
            out,
            stroke: gradient ? 'none' : 'black',
            strokeWidth: gradient ? 0 : 2,
        };
    } else if (fractalType === 'sierpinski') {
        const out = await input({
            message: 'Output filename:',
            default: 'output/sierpinski.svg',
        });

        return {
            ...baseArgs,
            type: 'sierpinski',
            out,
            stroke: gradient ? 'none' : 'black',
            strokeWidth: gradient ? 0 : 2,
        };
    } else if (fractalType === 'peano') {
        const out = await input({
            message: 'Output filename:',
            default: 'output/peano.svg',
        });

        return {
            ...baseArgs,
            type: 'peano',
            out,
            stroke: gradient ? 'none' : 'black',
            strokeWidth: gradient ? 0 : 2,
        };
    } else if (fractalType === 'gosper') {
        const out = await input({
            message: 'Output filename:',
            default: 'output/gosper.svg',
        });

        return {
            ...baseArgs,
            type: 'gosper',
            out,
            stroke: gradient ? 'none' : 'black',
            strokeWidth: gradient ? 0 : 2,
        };
    } else if (fractalType === 'julia') {
        // Julia set
        console.log('\n  Famous Julia set constants:');
        console.log('    c = -0.7 + 0.27015i  (dendrite, default)');
        console.log('    c = -0.8 + 0.156i    (spiral arms)');
        console.log('    c = -0.4 + 0.6i      (rabbit-like)');
        console.log('    c = 0.285 + 0.01i    (sea horse valley)');
        console.log('    c = -0.70176 - 0.3842i (lightning)\n');

        const juliaReal = await number({
            message: 'Julia c constant - real part:',
            default: -0.7,
            step: 'any',
        }) ?? -0.7;

        const juliaImag = await number({
            message: 'Julia c constant - imaginary part:',
            default: 0.27015,
            step: 'any',
        }) ?? 0.27015;

        const resolution = await number({
            message: 'Grid resolution (higher = more detail, slower):',
            default: 256,
        }) ?? 256;

        const maxIter = await number({
            message: 'Max escape iterations:',
            default: 100,
        }) ?? 100;

        const out = await input({
            message: 'Output filename:',
            default: 'output/julia.svg',
        });

        return {
            ...baseArgs,
            type: 'julia',
            juliaReal,
            juliaImag,
            resolution,
            centerX: 0,
            centerY: 0,
            zoom: 3.5,
            maxIter,
            threshold: 2,
            out,
        };
    } else {
        // Mandelbrot
        const resolution = await number({
            message: 'Grid resolution (higher = more detail, slower):',
            default: 256,
        }) ?? 256;

        const maxIter = await number({
            message: 'Max escape iterations:',
            default: 100,
        }) ?? 100;

        const out = await input({
            message: 'Output filename:',
            default: 'output/mandelbrot.svg',
        });

        return {
            ...baseArgs,
            type: 'mandelbrot',
            resolution,
            centerX: -0.5,
            centerY: 0,
            zoom: 3,
            maxIter,
            threshold: 2,
            out,
        };
    }
}

// ============================================================================
// CLI Parsing
// ============================================================================

function parseCLIArgs(argv: string[]): Args | null {
    const cmd = argv[2];

    if (!cmd || cmd === '--help' || cmd === '-h') {
        printHelp();
        return null;
    }

    // Helper to get flag value
    const getFlag = (name: string): string | undefined => {
        const idx = argv.indexOf(name);
        if (idx !== -1 && argv[idx + 1] && !argv[idx + 1].startsWith('--')) {
            return argv[idx + 1];
        }
        return undefined;
    };
    const hasFlag = (name: string): boolean => argv.includes(name);

    // Validate fractal type and get config
    const fractalType = cmd as FractalType;
    const iterConfig = getIterationConfig(fractalType);

    // Common defaults - use type-specific iteration defaults
    let out = '';
    const size = Number(getFlag('--size')) || 512;
    let iter = Number(getFlag('--iter')) || iterConfig.defaultIter;
    
    // Clamp iteration to safe limits
    if (iter > iterConfig.maxIter) {
        console.warn(`⚠️  Iteration ${iter} exceeds max ${iterConfig.maxIter} for ${cmd}. Clamping to ${iterConfig.maxIter}.`);
        iter = iterConfig.maxIter;
    }
    
    const bg = getFlag('--bg') || 'none';
    let fill = getFlag('--fill') || 'black';
    let gradient: string[] | null = null;
    const gradientStr = getFlag('--gradient');
    if (gradientStr) {
        gradient = gradientStr.split(',').map((c) => c.trim());
    }
    const gradientAngle = Number(getFlag('--gradientAngle')) || 135;
    let stroke = getFlag('--stroke') || 'none';
    let strokeWidth = Number(getFlag('--strokeWidth')) || 0;
    const margin = Number(getFlag('--margin')) || 10;

    if (cmd === 'carpet') {
        const DStr = argv[3];
        if (!DStr || DStr.startsWith('--')) {
            throw new Error('Carpet mode requires a dimension argument. Example: carpet 1.8928');
        }
        const D = Number(DStr);
        if (!Number.isFinite(D) || D <= 0 || D > 2) {
            throw new Error(`Dimension must be a finite number in (0, 2]. Got: ${DStr}`);
        }

        out = getFlag('--out') || `output/carpet-D${D.toFixed(4)}.svg`;
        const kMin = Number(getFlag('--kMin')) || 2;
        const kMax = Number(getFlag('--kMax')) || 9;
        const maxRects = Number(getFlag('--maxRects')) || 40_000;

        return {
            type: 'carpet',
            D,
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
            kMin,
            kMax,
            maxRects,
        };
    } else if (cmd === 'koch') {
        const sides = Number(getFlag('--sides')) || 3;
        const inward = hasFlag('--inward');
        out = getFlag('--out') || `output/koch-${sides}sides.svg`;
        
        // Different defaults for Koch curves
        if (!getFlag('--stroke') && !gradient) stroke = 'black';
        if (!getFlag('--strokeWidth') && !gradient) strokeWidth = 2;
        if (!getFlag('--fill') && !gradient) fill = 'none';

        return {
            type: 'koch',
            sides,
            inward,
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
        };
    } else if (cmd === 'mandelbrot') {
        out = getFlag('--out') || 'output/mandelbrot.svg';
        const resolution = Number(getFlag('--resolution')) || 256;
        const centerX = Number(getFlag('--centerX')) || -0.5;
        const centerY = Number(getFlag('--centerY')) || 0;
        const zoom = Number(getFlag('--zoom')) || 3;
        const maxIter = Number(getFlag('--maxIter')) || 100;
        const threshold = Number(getFlag('--threshold')) || 2;

        return {
            type: 'mandelbrot',
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
            resolution,
            centerX,
            centerY,
            zoom,
            maxIter,
            threshold,
        };
    } else if (cmd === 'julia') {
        out = getFlag('--out') || 'output/julia.svg';
        const juliaReal = Number(getFlag('--juliaReal')) || -0.7;
        const juliaImag = Number(getFlag('--juliaImag')) || 0.27015;
        const resolution = Number(getFlag('--resolution')) || 256;
        const centerX = Number(getFlag('--centerX')) || 0;
        const centerY = Number(getFlag('--centerY')) || 0;
        const zoom = Number(getFlag('--zoom')) || 3.5;
        const maxIter = Number(getFlag('--maxIter')) || 100;
        const threshold = Number(getFlag('--threshold')) || 2;

        return {
            type: 'julia',
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
            juliaReal,
            juliaImag,
            resolution,
            centerX,
            centerY,
            zoom,
            maxIter,
            threshold,
        };
    } else if (cmd === 'dragon') {
        out = getFlag('--out') || 'output/dragon.svg';
        
        // Different defaults for Dragon curve
        if (!getFlag('--stroke') && !gradient) stroke = 'black';
        if (!getFlag('--strokeWidth') && !gradient) strokeWidth = 2;
        if (!getFlag('--fill') && !gradient) fill = 'none';

        return {
            type: 'dragon',
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
        };
    } else if (cmd === 'hilbert') {
        out = getFlag('--out') || 'output/hilbert.svg';
        
        // Different defaults for Hilbert curve
        if (!getFlag('--stroke') && !gradient) stroke = 'black';
        if (!getFlag('--strokeWidth') && !gradient) strokeWidth = 2;
        if (!getFlag('--fill') && !gradient) fill = 'none';

        return {
            type: 'hilbert',
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
        };
    } else if (cmd === 'levy') {
        out = getFlag('--out') || 'output/levy.svg';
        
        // Different defaults for Lévy curve
        if (!getFlag('--stroke') && !gradient) stroke = 'black';
        if (!getFlag('--strokeWidth') && !gradient) strokeWidth = 2;
        if (!getFlag('--fill') && !gradient) fill = 'none';

        return {
            type: 'levy',
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
        };
    } else if (cmd === 'sierpinski') {
        out = getFlag('--out') || 'output/sierpinski.svg';
        
        // Different defaults for Sierpinski curve
        if (!getFlag('--stroke') && !gradient) stroke = 'black';
        if (!getFlag('--strokeWidth') && !gradient) strokeWidth = 2;
        if (!getFlag('--fill') && !gradient) fill = 'none';

        return {
            type: 'sierpinski',
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
        };
    } else if (cmd === 'peano') {
        out = getFlag('--out') || 'output/peano.svg';
        
        // Different defaults for Peano curve
        if (!getFlag('--stroke') && !gradient) stroke = 'black';
        if (!getFlag('--strokeWidth') && !gradient) strokeWidth = 2;
        if (!getFlag('--fill') && !gradient) fill = 'none';

        return {
            type: 'peano',
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
        };
    } else if (cmd === 'gosper') {
        out = getFlag('--out') || 'output/gosper.svg';
        
        // Different defaults for Gosper curve
        if (!getFlag('--stroke') && !gradient) stroke = 'black';
        if (!getFlag('--strokeWidth') && !gradient) strokeWidth = 2;
        if (!getFlag('--fill') && !gradient) fill = 'none';

        return {
            type: 'gosper',
            out,
            size,
            iter,
            bg,
            fill,
            gradient,
            gradientAngle,
            stroke,
            strokeWidth,
            margin,
        };
    } else {
        // Legacy mode: assume carpet with dimension as first arg
        const D = Number(cmd);
        if (Number.isFinite(D) && D > 0 && D <= 2) {
            out = getFlag('--out') || `output/carpet-D${D.toFixed(4)}.svg`;
            const kMin = Number(getFlag('--kMin')) || 2;
            const kMax = Number(getFlag('--kMax')) || 9;
            const maxRects = Number(getFlag('--maxRects')) || 40_000;

            return {
                type: 'carpet',
                D,
                out,
                size,
                iter,
                bg,
                fill,
                gradient,
                gradientAngle,
                stroke,
                strokeWidth,
                margin,
                kMin,
                kMax,
                maxRects,
            };
        }
        throw new Error(`Unknown command: ${cmd}. Use 'carpet', 'koch', 'mandelbrot', 'julia', 'dragon', 'hilbert', 'levy', 'sierpinski', 'peano', 'gosper', or run without args for interactive mode.`);
    }
}

// ============================================================================
// Carpet Fractal Generation
// ============================================================================

function dimFromNK(N: number, k: number): number {
    return Math.log(N) / Math.log(k);
}

function pickBestNK(
    D: number,
    kMin: number,
    kMax: number,
): { k: number; N: number; Dactual: number; err: number } {
    let best = { k: 3, N: 8, Dactual: dimFromNK(8, 3), err: Infinity };

    for (let k = kMin; k <= kMax; k++) {
        const maxN = k * k - 1;
        for (let N = 2; N <= maxN; N++) {
            const Dactual = dimFromNK(N, k);
            const err = Math.abs(Dactual - D);
            if (err < best.err) best = { k, N, Dactual, err };
        }
    }
    return best;
}

type Cell = { cx: number; cy: number; score: number; x: number; y: number };

function buildPattern(k: number, N: number): Array<[number, number]> {
    const center = (k - 1) / 2;
    const cells: Cell[] = [];
    for (let y = 0; y < k; y++) {
        for (let x = 0; x < k; x++) {
            const dx = x - center;
            const dy = y - center;
            const dist2 = dx * dx + dy * dy;
            const cornerPenalty =
                (x === 0 || x === k - 1 ? 0.05 : 0) +
                (y === 0 || y === k - 1 ? 0.05 : 0);
            const score = dist2 + cornerPenalty;
            cells.push({ cx: dx, cy: dy, score, x, y });
        }
    }
    cells.sort((a, b) => a.score - b.score || a.y - b.y || a.x - b.x);
    const kept = cells.slice(0, N).map((c) => [c.x, c.y] as [number, number]);
    return kept;
}

type Rect = { x: number; y: number; s: number };

function estimateAutoIterCarpet(k: number, N: number, maxRects: number, size: number): number {
    const itByCount = Math.floor(Math.log(maxRects) / Math.log(N));
    const itBySize = Math.floor(Math.log(size) / Math.log(k));
    const it = Math.min(itByCount, itBySize);
    return Math.max(1, Math.min(10, it));
}

function generateRects(k: number, pattern: Array<[number, number]>, iter: number, maxRects = 100_000): Rect[] {
    let rects: Rect[] = [{ x: 0, y: 0, s: 1 }];
    const invK = 1 / k;

    for (let i = 0; i < iter; i++) {
        const next: Rect[] = [];
        for (const r of rects) {
            const childS = r.s * invK;
            for (const [px, py] of pattern) {
                next.push({
                    x: r.x + px * childS,
                    y: r.y + py * childS,
                    s: childS,
                });
            }
            // Early termination to prevent memory exhaustion
            if (next.length > maxRects) {
                throw new Error(
                    `Exceeded ${maxRects} rectangles at iteration ${i + 1}. Use lower --iter or higher dimension.`
                );
            }
        }
        rects = next;
    }
    return rects;
}

// ============================================================================
// Koch Curve Generation
// ============================================================================

type Point = { x: number; y: number };

function generateKochCurve(sides: number, iter: number, inward: boolean): Point[] {
    // Generate base polygon centered at origin
    const basePoints: Point[] = [];
    const radius = 0.4; // Fit within [0,1] with margin
    const centerX = 0.5;
    const centerY = 0.5;
    const angleOffset = -Math.PI / 2; // Start from top

    for (let i = 0; i < sides; i++) {
        const angle = angleOffset + (2 * Math.PI * i) / sides;
        basePoints.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        });
    }

    // Close the polygon
    let points = [...basePoints, basePoints[0]];

    // Apply Koch subdivision
    const direction = inward ? -1 : 1;

    for (let it = 0; it < iter; it++) {
        const newPoints: Point[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            // Divide segment into thirds
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;

            const a = p1;
            const b = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
            const d = { x: p1.x + (2 * dx) / 3, y: p1.y + (2 * dy) / 3 };

            // Calculate the peak point (equilateral triangle)
            const midX = (b.x + d.x) / 2;
            const midY = (b.y + d.y) / 2;
            const height = (Math.sqrt(3) / 6) * Math.sqrt(dx * dx + dy * dy);
            
            // Perpendicular direction
            const perpX = -dy / Math.sqrt(dx * dx + dy * dy);
            const perpY = dx / Math.sqrt(dx * dx + dy * dy);

            const c = {
                x: midX + direction * height * perpX,
                y: midY + direction * height * perpY,
            };

            newPoints.push(a, b, c, d);
        }
        newPoints.push(points[points.length - 1]);
        points = newPoints;
    }

    return points;
}

// ============================================================================
// Dragon Curve Generation
// ============================================================================

/**
 * Generate Dragon Curve using the turn sequence method
 * Each iteration builds a sequence of left/right turns by:
 *   1. Taking the previous sequence
 *   2. Adding a Left turn in the middle
 *   3. Appending the reverse of the previous sequence with flipped turns
 */
function generateDragonCurve(iter: number): Point[] {
    // Build turn sequence: true = left turn (L), false = right turn (R)
    // Start with empty, each iteration: turns = turns + L + reverse(flip(turns))
    let turns: boolean[] = [];
    
    for (let i = 0; i < iter; i++) {
        const flippedReversed = [...turns].reverse().map(t => !t);
        turns = [...turns, true, ...flippedReversed];
    }
    
    // Convert turns to points using turtle graphics
    // Start facing right (angle 0), then apply turns
    const points: Point[] = [];
    let x = 0;
    let y = 0;
    let angle = 0; // 0=right, 90=up, 180=left, 270=down
    
    points.push({ x, y });
    
    // Move forward first segment
    x += Math.cos(angle * Math.PI / 180);
    y += Math.sin(angle * Math.PI / 180);
    points.push({ x, y });
    
    // Apply each turn and move forward
    for (const turnLeft of turns) {
        angle += turnLeft ? -90 : 90;
        x += Math.cos(angle * Math.PI / 180);
        y += Math.sin(angle * Math.PI / 180);
        points.push({ x, y });
    }
    
    // Find bounds for centering
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    
    // Normalize to [0, 1] space with margin, centered
    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const scale = 0.8 / Math.max(width, height); // Leave 10% margin on each side
    const centerX = 0.5;
    const centerY = 0.5;
    
    const normalizedPoints = points.map(p => ({
        x: centerX + (p.x - (minX + maxX) / 2) * scale,
        y: centerY + (p.y - (minY + maxY) / 2) * scale,
    }));
    
    return normalizedPoints;
}

// ============================================================================
// Hilbert Curve Generation
// ============================================================================

/**
 * Generate Hilbert Curve using recursive L-system approach
 * The Hilbert curve is a space-filling curve that visits every point in a grid
 * Each iteration subdivides the space into 4 quadrants
 */
function generateHilbertCurve(iter: number): Point[] {
    // Use L-system rules for Hilbert curve
    // A -> -BF+AFA+FB-
    // B -> +AF-BFB-FA+
    // where: F = forward, + = turn left 90°, - = turn right 90°
    
    const hilbertA = (level: number, angle: number): string => {
        if (level === 0) return '';
        return turn(-angle) + hilbertB(level - 1, -angle) + forward() + 
               turn(angle) + hilbertA(level - 1, angle) + forward() + 
               hilbertA(level - 1, angle) + turn(angle) + forward() + 
               hilbertB(level - 1, -angle) + turn(-angle);
    };
    
    const hilbertB = (level: number, angle: number): string => {
        if (level === 0) return '';
        return turn(angle) + hilbertA(level - 1, -angle) + forward() + 
               turn(-angle) + hilbertB(level - 1, angle) + forward() + 
               hilbertB(level - 1, angle) + turn(-angle) + forward() + 
               hilbertA(level - 1, -angle) + turn(angle);
    };
    
    const forward = () => 'F';
    const turn = (angle: number) => angle > 0 ? '+' : '-';
    
    // Generate the L-system string
    const instructions = hilbertA(iter, 90);
    
    // Convert L-system string to points
    const points: Point[] = [];
    let x = 0;
    let y = 0;
    let dir = 0; // 0=right, 90=up, 180=left, 270=down
    
    points.push({ x, y });
    
    for (const cmd of instructions) {
        if (cmd === 'F') {
            // Move forward in current direction
            const rad = (dir * Math.PI) / 180;
            x += Math.cos(rad);
            y += Math.sin(rad);
            points.push({ x, y });
        } else if (cmd === '+') {
            dir = (dir + 90) % 360;
        } else if (cmd === '-') {
            dir = (dir - 90 + 360) % 360;
        }
    }
    
    // Find bounds for centering
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    
    // Normalize to [0, 1] space with margin, centered
    const width = maxX - minX;
    const height = maxY - minY;
    const scale = 0.8 / Math.max(width, height); // Leave 10% margin on each side
    const centerX = 0.5;
    const centerY = 0.5;
    
    const normalizedPoints = points.map(p => ({
        x: centerX + (p.x - (minX + maxX) / 2) * scale,
        y: centerY + (p.y - (minY + maxY) / 2) * scale,
    }));
    
    return normalizedPoints;
}

// ============================================================================
// Lévy C Curve Generation
// ============================================================================

/**
 * Generate Lévy C Curve using recursive L-system approach
 * The Lévy C Curve creates a feathery pattern by replacing each line segment
 * with two segments at 45° angles forming a symmetric V-shape
 */
function generateLevyCurve(iter: number): Point[] {
    // Start with a horizontal line from (0,0) to (1,0)
    let points: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    
    // Apply Lévy C Curve transformation
    // Each segment is replaced by two segments forming a 90° angle
    // The two segments meet at 45° angles to the original segment
    for (let it = 0; it < iter; it++) {
        const newPoints: Point[] = [];
        
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            
            // Calculate the midpoint of the perpendicular
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            
            // The new point is at 45° angle, forming an isosceles right triangle
            // Distance from p1 to mid = distance from mid to p2 = |p1-p2| / sqrt(2)
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            
            // Perpendicular vector (rotated 90° counter-clockwise), scaled by 1/2
            const perpX = -dy / 2;
            const perpY = dx / 2;
            
            const mid = {
                x: midX + perpX,
                y: midY + perpY,
            };
            
            newPoints.push(p1, mid);
        }
        newPoints.push(points[points.length - 1]);
        points = newPoints;
    }
    
    // Find bounds for centering
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    
    // Normalize to [0, 1] space with margin, centered
    const width = maxX - minX;
    const height = maxY - minY;
    const scale = 0.8 / Math.max(width, height); // Leave 10% margin on each side
    const centerX = 0.5;
    const centerY = 0.5;
    
    const normalizedPoints = points.map(p => ({
        x: centerX + (p.x - (minX + maxX) / 2) * scale,
        y: centerY + (p.y - (minY + maxY) / 2) * scale,
    }));
    
    return normalizedPoints;
}

// ============================================================================
// Sierpinski Triangle Arrowhead Curve Generation
// ============================================================================

/**
 * Generate Sierpinski Triangle Arrowhead Curve using L-system approach
 * The Sierpinski arrowhead is a curve that draws the outline of a Sierpinski triangle
 * as a single continuous path
 * 
 * L-system rules:
 * A -> B-A-B
 * B -> A+B+A
 * where: + = turn left 60°, - = turn right 60°
 */
function generateSierpinskiCurve(iter: number): Point[] {
    // Use L-system rules for Sierpinski arrowhead
    // Start with 'A' for even iterations, 'B-A-B' for odd to ensure proper orientation
    
    const sierpinskiA = (level: number): string => {
        if (level === 0) return 'F';
        return sierpinskiB(level - 1) + '-' + sierpinskiA(level - 1) + '-' + sierpinskiB(level - 1);
    };
    
    const sierpinskiB = (level: number): string => {
        if (level === 0) return 'F';
        return sierpinskiA(level - 1) + '+' + sierpinskiB(level - 1) + '+' + sierpinskiA(level - 1);
    };
    
    // Generate the L-system string
    // Start with A for even iterations to create proper triangular shape
    const instructions = sierpinskiA(iter);
    
    // Convert L-system string to points
    const points: Point[] = [];
    let x = 0;
    let y = 0;
    let dir = 0; // Start pointing right (0 degrees)
    
    points.push({ x, y });
    
    for (const cmd of instructions) {
        if (cmd === 'F') {
            // Move forward in current direction
            const rad = (dir * Math.PI) / 180;
            x += Math.cos(rad);
            y += Math.sin(rad);
            points.push({ x, y });
        } else if (cmd === '+') {
            dir = (dir + 60) % 360; // Turn left 60°
        } else if (cmd === '-') {
            dir = (dir - 60 + 360) % 360; // Turn right 60°
        }
    }
    
    // Find bounds for centering
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    
    // Normalize to [0, 1] space with margin, centered
    const width = maxX - minX;
    const height = maxY - minY;
    const scale = 0.8 / Math.max(width, height); // Leave 10% margin on each side
    const centerX = 0.5;
    const centerY = 0.5;
    
    const normalizedPoints = points.map(p => ({
        x: centerX + (p.x - (minX + maxX) / 2) * scale,
        y: centerY + (p.y - (minY + maxY) / 2) * scale,
    }));
    
    return normalizedPoints;
}

// ============================================================================
// Peano Curve Generation
// ============================================================================

/**
 * Generate Peano Curve using L-system approach
 * The Peano curve is a 3x3 space-filling curve
 * 
 * L-system rules:
 * A -> A-B-A+F+A-B-A
 * B -> B+A+B-F-B+A+B
 * where: F = forward, + = turn left 90°, - = turn right 90°
 */
function generatePeanoCurve(iter: number): Point[] {
    // Use L-system rules for Peano curve
    
    const peanoA = (level: number): string => {
        if (level === 0) return 'F';
        const a = peanoA(level - 1);
        const b = peanoB(level - 1);
        return a + '-' + b + '-' + a + '+' + 'F' + '+' + a + '-' + b + '-' + a;
    };
    
    const peanoB = (level: number): string => {
        if (level === 0) return 'F';
        const a = peanoA(level - 1);
        const b = peanoB(level - 1);
        return b + '+' + a + '+' + b + '-' + 'F' + '-' + b + '+' + a + '+' + b;
    };
    
    // Generate the L-system string - start with A
    const instructions = peanoA(iter);
    
    // Convert L-system string to points
    const points: Point[] = [];
    let x = 0;
    let y = 0;
    let dir = 0; // Start pointing right (0 degrees)
    
    points.push({ x, y });
    
    for (const cmd of instructions) {
        if (cmd === 'F') {
            // Move forward in current direction
            const rad = (dir * Math.PI) / 180;
            x += Math.cos(rad);
            y += Math.sin(rad);
            points.push({ x, y });
        } else if (cmd === '+') {
            dir = (dir + 90) % 360; // Turn left 90°
        } else if (cmd === '-') {
            dir = (dir - 90 + 360) % 360; // Turn right 90°
        }
    }
    
    // Find bounds for centering
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    
    // Normalize to [0, 1] space with margin, centered
    const width = maxX - minX;
    const height = maxY - minY;
    const scale = 0.8 / Math.max(width, height); // Leave 10% margin on each side
    const centerX = 0.5;
    const centerY = 0.5;
    
    const normalizedPoints = points.map(p => ({
        x: centerX + (p.x - (minX + maxX) / 2) * scale,
        y: centerY + (p.y - (minY + maxY) / 2) * scale,
    }));
    
    return normalizedPoints;
}

// ============================================================================
// Gosper Curve Generation
// ============================================================================

/**
 * Generate Gosper Curve (also known as Flowsnake) using L-system approach
 * The Gosper curve is a hexagonal space-filling curve
 * 
 * L-system rules:
 * A -> A-B--B+A++AA+B-
 * B -> +A-BB--B-A++A+B
 * where: F = forward, + = turn left 60°, - = turn right 60°
 */
function generateGosperCurve(iter: number): Point[] {
    // Use L-system rules for Gosper curve
    
    const gosperA = (level: number): string => {
        if (level === 0) return 'F';
        const a = gosperA(level - 1);
        const b = gosperB(level - 1);
        return a + '-' + b + '-' + '-' + b + '+' + a + '+' + '+' + a + a + '+' + b + '-';
    };
    
    const gosperB = (level: number): string => {
        if (level === 0) return 'F';
        const a = gosperA(level - 1);
        const b = gosperB(level - 1);
        return '+' + a + '-' + b + b + '-' + '-' + b + '-' + a + '+' + '+' + a + '+' + b;
    };
    
    // Generate the L-system string - start with A
    const instructions = gosperA(iter);
    
    // Convert L-system string to points
    const points: Point[] = [];
    let x = 0;
    let y = 0;
    let dir = 0; // Start pointing right (0 degrees)
    
    points.push({ x, y });
    
    for (const cmd of instructions) {
        if (cmd === 'F') {
            // Move forward in current direction
            const rad = (dir * Math.PI) / 180;
            x += Math.cos(rad);
            y += Math.sin(rad);
            points.push({ x, y });
        } else if (cmd === '+') {
            dir = (dir + 60) % 360; // Turn left 60°
        } else if (cmd === '-') {
            dir = (dir - 60 + 360) % 360; // Turn right 60°
        }
    }
    
    // Find bounds for centering
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    
    // Normalize to [0, 1] space with margin, centered
    const width = maxX - minX;
    const height = maxY - minY;
    const scale = 0.8 / Math.max(width, height); // Leave 10% margin on each side
    const centerX = 0.5;
    const centerY = 0.5;
    
    const normalizedPoints = points.map(p => ({
        x: centerX + (p.x - (minX + maxX) / 2) * scale,
        y: centerY + (p.y - (minY + maxY) / 2) * scale,
    }));
    
    return normalizedPoints;
}

// ============================================================================
// Mandelbrot Generation with Marching Squares
// ============================================================================

/**
 * Calculate escape time for a point in the Mandelbrot set
 */
function mandelbrotEscape(cx: number, cy: number, maxIter: number): number {
    let x = 0;
    let y = 0;
    let iter = 0;
    
    while (x * x + y * y <= 4 && iter < maxIter) {
        const xNew = x * x - y * y + cx;
        y = 2 * x * y + cy;
        x = xNew;
        iter++;
    }
    
    // Smooth iteration count for better contours
    if (iter < maxIter) {
        const log_zn = Math.log(x * x + y * y) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        return iter + 1 - nu;
    }
    return iter;
}

/**
 * Compute escape time grid
 */
function computeEscapeGrid(
    resolution: number,
    centerX: number,
    centerY: number,
    zoom: number,
    maxIter: number,
): number[][] {
    const grid: number[][] = [];
    const halfZoom = zoom / 2;
    
    for (let j = 0; j <= resolution; j++) {
        const row: number[] = [];
        const cy = centerY - halfZoom + (j / resolution) * zoom;
        
        for (let i = 0; i <= resolution; i++) {
            const cx = centerX - halfZoom + (i / resolution) * zoom;
            row.push(mandelbrotEscape(cx, cy, maxIter));
        }
        grid.push(row);
    }
    
    return grid;
}

/**
 * Marching squares contour extraction
 * Returns array of contour paths, each path is an array of [x, y] coordinates
 */
function marchingSquares(
    grid: number[][],
    threshold: number,
): Array<Array<[number, number]>> {
    const rows = grid.length - 1;
    const cols = grid[0].length - 1;
    
    // Edge lookup table for marching squares
    // Each case produces 0, 1, or 2 line segments (pairs of edge indices)
    const edgeTable: Record<number, Array<[number, number]>> = {
        0: [], 15: [],
        1: [[3, 0]], 14: [[3, 0]],
        2: [[0, 1]], 13: [[0, 1]],
        3: [[3, 1]], 12: [[3, 1]],
        4: [[1, 2]], 11: [[1, 2]],
        5: [[3, 0], [1, 2]], 10: [[0, 1], [2, 3]],
        6: [[0, 2]], 9: [[0, 2]],
        7: [[3, 2]], 8: [[3, 2]],
    };
    
    // Collect all line segments
    const segments: Array<[[number, number], [number, number]]> = [];
    
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            // Get corner values
            const v0 = grid[j][i] >= threshold ? 1 : 0;
            const v1 = grid[j][i + 1] >= threshold ? 1 : 0;
            const v2 = grid[j + 1][i + 1] >= threshold ? 1 : 0;
            const v3 = grid[j + 1][i] >= threshold ? 1 : 0;
            
            const caseIndex = v0 | (v1 << 1) | (v2 << 2) | (v3 << 3);
            const edges = edgeTable[caseIndex];
            
            if (!edges) continue;
            
            // Interpolate edge positions
            const getEdgePoint = (edge: number): [number, number] => {
                const val = (v: number) => grid[j + (v >= 2 ? 1 : 0)][i + (v === 1 || v === 2 ? 1 : 0)];
                
                switch (edge) {
                    case 0: { // Top edge
                        const t = (threshold - grid[j][i]) / (grid[j][i + 1] - grid[j][i]);
                        return [i + Math.max(0, Math.min(1, t)), j];
                    }
                    case 1: { // Right edge
                        const t = (threshold - grid[j][i + 1]) / (grid[j + 1][i + 1] - grid[j][i + 1]);
                        return [i + 1, j + Math.max(0, Math.min(1, t))];
                    }
                    case 2: { // Bottom edge
                        const t = (threshold - grid[j + 1][i]) / (grid[j + 1][i + 1] - grid[j + 1][i]);
                        return [i + Math.max(0, Math.min(1, t)), j + 1];
                    }
                    case 3: { // Left edge
                        const t = (threshold - grid[j][i]) / (grid[j + 1][i] - grid[j][i]);
                        return [i, j + Math.max(0, Math.min(1, t))];
                    }
                    default:
                        return [i, j];
                }
            };
            
            for (const [e1, e2] of edges) {
                segments.push([getEdgePoint(e1), getEdgePoint(e2)]);
            }
        }
    }
    
    // Connect segments into paths
    const paths: Array<Array<[number, number]>> = [];
    const used = new Set<number>();
    
    const pointKey = (p: [number, number]) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`;
    
    // Build adjacency map
    const adjacency = new Map<string, Array<{ segIdx: number; point: [number, number] }>>();
    
    for (let i = 0; i < segments.length; i++) {
        const [p1, p2] = segments[i];
        const k1 = pointKey(p1);
        const k2 = pointKey(p2);
        
        if (!adjacency.has(k1)) adjacency.set(k1, []);
        if (!adjacency.has(k2)) adjacency.set(k2, []);
        
        adjacency.get(k1)!.push({ segIdx: i, point: p2 });
        adjacency.get(k2)!.push({ segIdx: i, point: p1 });
    }
    
    // Trace paths
    for (let startIdx = 0; startIdx < segments.length; startIdx++) {
        if (used.has(startIdx)) continue;
        
        const path: Array<[number, number]> = [];
        let current = segments[startIdx][0];
        path.push(current);
        
        let currentIdx = startIdx;
        used.add(currentIdx);
        current = segments[startIdx][1];
        path.push(current);
        
        // Follow the path
        let maxSteps = segments.length;
        while (maxSteps-- > 0) {
            const key = pointKey(current);
            const neighbors = adjacency.get(key);
            if (!neighbors) break;
            
            let found = false;
            for (const { segIdx, point } of neighbors) {
                if (!used.has(segIdx)) {
                    used.add(segIdx);
                    current = point;
                    path.push(current);
                    found = true;
                    break;
                }
            }
            
            if (!found) break;
        }
        
        if (path.length > 2) {
            paths.push(path);
        }
    }
    
    return paths;
}

/**
 * Generate Mandelbrot boundary contours
 */
function generateMandelbrotContours(args: MandelbrotArgs): Array<Array<[number, number]>> {
    const grid = computeEscapeGrid(
        args.resolution,
        args.centerX,
        args.centerY,
        args.zoom,
        args.maxIter,
    );
    
    // Extract contour at the boundary (where escape time = threshold)
    // For the classic Mandelbrot set boundary, we use a threshold near maxIter
    const contours = marchingSquares(grid, args.maxIter * 0.95);
    
    return contours;
}

// ============================================================================
// Julia Set Generation with Marching Squares
// ============================================================================

/**
 * Calculate escape time for a point in the Julia set
 * Unlike Mandelbrot, z starts at the point and c is a fixed constant
 */
function juliaEscape(zx: number, zy: number, cx: number, cy: number, maxIter: number): number {
    let x = zx;
    let y = zy;
    let iter = 0;
    
    while (x * x + y * y <= 4 && iter < maxIter) {
        const xNew = x * x - y * y + cx;
        y = 2 * x * y + cy;
        x = xNew;
        iter++;
    }
    
    // Smooth iteration count for better contours
    if (iter < maxIter) {
        const log_zn = Math.log(x * x + y * y) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        return iter + 1 - nu;
    }
    return iter;
}

/**
 * Compute Julia escape time grid
 */
function computeJuliaEscapeGrid(
    resolution: number,
    centerX: number,
    centerY: number,
    zoom: number,
    juliaReal: number,
    juliaImag: number,
    maxIter: number,
): number[][] {
    const grid: number[][] = [];
    const halfZoom = zoom / 2;
    
    for (let j = 0; j <= resolution; j++) {
        const row: number[] = [];
        const zy = centerY - halfZoom + (j / resolution) * zoom;
        
        for (let i = 0; i <= resolution; i++) {
            const zx = centerX - halfZoom + (i / resolution) * zoom;
            row.push(juliaEscape(zx, zy, juliaReal, juliaImag, maxIter));
        }
        grid.push(row);
    }
    
    return grid;
}

/**
 * Generate Julia set boundary contours
 */
function generateJuliaContours(args: JuliaArgs): Array<Array<[number, number]>> {
    const grid = computeJuliaEscapeGrid(
        args.resolution,
        args.centerX,
        args.centerY,
        args.zoom,
        args.juliaReal,
        args.juliaImag,
        args.maxIter,
    );
    
    // Extract contour at the boundary (where escape time = threshold)
    const contours = marchingSquares(grid, args.maxIter * 0.95);
    
    return contours;
}

// ============================================================================
// SVG Rendering
// ============================================================================

function svgEscape(s: string): string {
    return s
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
}

function buildGradientDefs(gradient: string[], gradientAngle: number): { defs: string; fillValue: string } {
    const angleRad = (gradientAngle * Math.PI) / 180;
    const x1 = 50 - 50 * Math.cos(angleRad);
    const y1 = 50 - 50 * Math.sin(angleRad);
    const x2 = 50 + 50 * Math.cos(angleRad);
    const y2 = 50 + 50 * Math.sin(angleRad);

    const stops = gradient
        .map((color, i) => {
            const offset = (i / (gradient.length - 1)) * 100;
            return `      <stop offset="${offset}%" stop-color="${svgEscape(color)}" />`;
        })
        .join('\n');

    const defs = `
  <defs>
    <linearGradient id="fractalGradient" x1="${x1.toFixed(1)}%" y1="${y1.toFixed(1)}%" x2="${x2.toFixed(1)}%" y2="${y2.toFixed(1)}%">
${stops}
    </linearGradient>
  </defs>`;

    return { defs, fillValue: 'url(#fractalGradient)' };
}

function renderCarpetSVG(params: {
    rects: Rect[];
    size: number;
    margin: number;
    bg: string;
    fill: string;
    gradient: string[] | null;
    gradientAngle: number;
    stroke: string;
    strokeWidth: number;
    meta: Record<string, string>;
}): string {
    const { rects, size, margin, bg, fill, gradient, gradientAngle, stroke, strokeWidth, meta } = params;

    const inner = size - 2 * margin;
    const scale = inner;

    const metaLines = Object.entries(meta)
        .map(([k, v]) => `${k}=${v}`)
        .join(' | ');

    const rectEls = rects
        .map((r) => {
            const x = margin + r.x * scale;
            const y = margin + r.y * scale;
            const s = r.s * scale;
            return `<rect x="${x.toFixed(4)}" y="${y.toFixed(4)}" width="${s.toFixed(4)}" height="${s.toFixed(4)}" />`;
        })
        .join('\n');

    let defs = '';
    let fillValue = svgEscape(fill);

    if (gradient && gradient.length >= 2) {
        const gradResult = buildGradientDefs(gradient, gradientAngle);
        defs = gradResult.defs;
        fillValue = gradResult.fillValue;
    }

    const style = `g.cells rect { fill: ${fillValue}; stroke: ${svgEscape(stroke)}; stroke-width: ${strokeWidth}; shape-rendering: crispEdges; }`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}
  <title>${svgEscape(metaLines)}</title>
  <style>${style}</style>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${svgEscape(bg)}" />
  <g class="cells">
${rectEls}
  </g>
</svg>
`;
}

/**
 * Generic path-based SVG renderer for fractal curves
 * Used by Koch, Dragon, Hilbert, Lévy, Sierpinski, Peano, and Gosper curves
 */
function renderPathSVG(params: {
    points: Point[];
    size: number;
    margin: number;
    bg: string;
    fill: string;
    gradient: string[] | null;
    gradientAngle: number;
    stroke: string;
    strokeWidth: number;
    meta: Record<string, string>;
    closePath?: boolean; // Whether to close the path with 'Z' (default: true for Koch)
}): string {
    const { points, size, margin, bg, fill, gradient, gradientAngle, stroke, strokeWidth, meta, closePath = true } = params;

    const inner = size - 2 * margin;

    const metaLines = Object.entries(meta)
        .map(([k, v]) => `${k}=${v}`)
        .join(' | ');

    // Build path from points
    const pathParts = points.map((p, i) => {
        const x = margin + p.x * inner;
        const y = margin + p.y * inner;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(4)} ${y.toFixed(4)}`;
    });
    if (closePath) {
        pathParts.push('Z');
    }
    const pathD = pathParts.join(' ');

    let defs = '';
    let fillValue = svgEscape(fill);
    let strokeValue = svgEscape(stroke);

    if (gradient && gradient.length >= 2) {
        const gradResult = buildGradientDefs(gradient, gradientAngle);
        defs = gradResult.defs;
        
        if (closePath) {
            // Closed paths: apply gradient to fill
            fillValue = gradResult.fillValue;
            if (stroke === 'none') strokeValue = 'none';
        } else {
            // Open paths (dragon, hilbert, etc.): apply gradient to stroke
            fillValue = 'none';
            strokeValue = gradResult.fillValue;
        }
    } else if (!closePath) {
        // Open paths without gradient need visible stroke
        fillValue = 'none';
        if (stroke === 'none') {
            strokeValue = fill; // Use fill color as stroke for open paths
        }
    }
    
    // Ensure open paths have a reasonable stroke width
    const finalStrokeWidth = !closePath && strokeWidth === 0 ? 2 : strokeWidth;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}
  <title>${svgEscape(metaLines)}</title>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${svgEscape(bg)}" />
  <path d="${pathD}" fill="${fillValue}" stroke="${strokeValue}" stroke-width="${finalStrokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;
}

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use renderPathSVG instead
 */
function renderKochSVG(params: {
    points: Point[];
    size: number;
    margin: number;
    bg: string;
    fill: string;
    gradient: string[] | null;
    gradientAngle: number;
    stroke: string;
    strokeWidth: number;
    meta: Record<string, string>;
}): string {
    return renderPathSVG({ ...params, closePath: true });
}

// ============================================================================
// Main Generators
// ============================================================================

function generateCarpet(args: CarpetArgs): void {
    const best = pickBestNK(args.D, args.kMin, args.kMax);
    const pattern = buildPattern(best.k, best.N);

    const iter = args.iter || estimateAutoIterCarpet(best.k, best.N, args.maxRects, args.size);
    const rects = generateRects(best.k, pattern, iter, args.maxRects);

    const svg = renderCarpetSVG({
        rects,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        meta: {
            type: 'carpet',
            targetD: args.D.toString(),
            chosenK: best.k.toString(),
            chosenN: best.N.toString(),
            actualD: best.Dactual.toFixed(8),
            iter: iter.toString(),
            rects: rects.length.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Grid Carpet\n` +
            `   Target D=${args.D}, Actual D=${best.Dactual.toFixed(4)}\n` +
            `   Grid: ${best.k}×${best.k}, Kept cells: ${best.N}\n` +
            `   Iterations: ${iter}, Rectangles: ${rects.length}`,
    );
}

function generateKoch(args: KochArgs): void {
    const points = generateKochCurve(args.sides, args.iter, args.inward);
    const dimension = Math.log(4) / Math.log(3); // ~1.2619

    const svg = renderPathSVG({
        points,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        closePath: true, // Koch curve is a closed polygon
        meta: {
            type: 'koch',
            sides: args.sides.toString(),
            inward: args.inward.toString(),
            dimension: dimension.toFixed(4),
            iter: args.iter.toString(),
            points: points.length.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Koch Curve\n` +
            `   Base polygon: ${args.sides} sides\n` +
            `   Direction: ${args.inward ? 'inward' : 'outward'}\n` +
            `   Dimension: ${dimension.toFixed(4)}\n` +
            `   Iterations: ${args.iter}, Points: ${points.length}`,
    );
}

function renderMandelbrotSVG(params: {
    contours: Array<Array<[number, number]>>;
    resolution: number;
    size: number;
    margin: number;
    bg: string;
    fill: string;
    gradient: string[] | null;
    gradientAngle: number;
    stroke: string;
    strokeWidth: number;
    meta: Record<string, string>;
}): string {
    const { contours, resolution, size, margin, bg, fill, gradient, gradientAngle, stroke, strokeWidth, meta } = params;

    // Invariant: output must be square, centered in circular bounds
    const center = size / 2;
    const radius = size / 2 - margin;

    const metaLines = Object.entries(meta)
        .map(([k, v]) => `${k}=${v}`)
        .join(' | ');

    // Convert contours from grid coordinates to SVG coordinates
    // Grid is [0, resolution], map to circular bounds centered at (center, center)
    const paths = contours.map((contour) => {
        const pathParts = contour.map((p, i) => {
            // Normalize to [-1, 1] then scale to radius
            const nx = (p[0] / resolution) * 2 - 1;
            const ny = (p[1] / resolution) * 2 - 1;
            const x = center + nx * radius;
            const y = center + ny * radius;
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        });
        return pathParts.join(' ');
    }).join(' ');

    let defs = '';
    let fillValue = svgEscape(fill);
    let strokeValue = svgEscape(stroke);

    if (gradient && gradient.length >= 2) {
        const gradResult = buildGradientDefs(gradient, gradientAngle);
        defs = gradResult.defs;
        fillValue = gradResult.fillValue;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}
  <title>${svgEscape(metaLines)}</title>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${svgEscape(bg)}" />
  <path d="${paths}" fill="${fillValue}" stroke="${strokeValue}" stroke-width="${strokeWidth}" fill-rule="evenodd" />
</svg>
`;
}

/**
 * Render Julia set SVG with auto-fit scaling that preserves natural aspect ratio.
 * Calculates actual bounding box and scales uniformly to fit within the viewport
 * while keeping the fractal centered.
 */
function renderJuliaSVG(params: {
    contours: Array<Array<[number, number]>>;
    resolution: number;
    size: number;
    margin: number;
    bg: string;
    fill: string;
    gradient: string[] | null;
    gradientAngle: number;
    stroke: string;
    strokeWidth: number;
    meta: Record<string, string>;
}): { svg: string; aspectRatio: { width: number; height: number; scaleX: number; scaleY: number } } {
    const { contours, resolution, size, margin, bg, fill, gradient, gradientAngle, stroke, strokeWidth, meta } = params;

    // First, calculate the bounding box of all contour points in grid coordinates
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const contour of contours) {
        for (const [x, y] of contour) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    }
    
    // Handle edge case of empty contours
    if (!Number.isFinite(minX)) {
        minX = 0; maxX = resolution;
        minY = 0; maxY = resolution;
    }
    
    // Calculate content dimensions in grid space
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;
    
    // Calculate uniform scale to fit content into viewport (preserve aspect ratio)
    const viewportSize = size - 2 * margin;
    const scaleX = contentWidth > 0 ? viewportSize / contentWidth : 1;
    const scaleY = contentHeight > 0 ? viewportSize / contentHeight : 1;
    
    // Use the smaller scale to fit entirely while preserving natural proportions
    const uniformScale = Math.min(scaleX, scaleY);
    const center = size / 2;

    const metaLines = Object.entries(meta)
        .map(([k, v]) => `${k}=${v}`)
        .join(' | ');

    // Convert contours from grid coordinates to SVG coordinates with uniform scaling
    const paths = contours.map((contour) => {
        const pathParts = contour.map((p, i) => {
            // Translate to center, then scale uniformly to preserve aspect ratio
            const dx = p[0] - contentCenterX;
            const dy = p[1] - contentCenterY;
            const x = center + dx * uniformScale;
            const y = center + dy * uniformScale;
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        });
        return pathParts.join(' ');
    }).join(' ');

    let defs = '';
    let fillValue = svgEscape(fill);
    let strokeValue = svgEscape(stroke);

    if (gradient && gradient.length >= 2) {
        const gradResult = buildGradientDefs(gradient, gradientAngle);
        defs = gradResult.defs;
        fillValue = gradResult.fillValue;
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}
  <title>${svgEscape(metaLines)}</title>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${svgEscape(bg)}" />
  <path d="${paths}" fill="${fillValue}" stroke="${strokeValue}" stroke-width="${strokeWidth}" fill-rule="evenodd" />
</svg>
`;

    return {
        svg,
        aspectRatio: {
            width: contentWidth,
            height: contentHeight,
            scaleX,
            scaleY,
        },
    };
}

function generateMandelbrot(args: MandelbrotArgs): void {
    console.log('Generating Mandelbrot contours... (this may take a moment)');
    
    const contours = generateMandelbrotContours(args);
    const totalPoints = contours.reduce((sum, c) => sum + c.length, 0);

    const svg = renderMandelbrotSVG({
        contours,
        resolution: args.resolution,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        meta: {
            type: 'mandelbrot',
            resolution: args.resolution.toString(),
            centerX: args.centerX.toString(),
            centerY: args.centerY.toString(),
            zoom: args.zoom.toString(),
            maxIter: args.maxIter.toString(),
            contours: contours.length.toString(),
            points: totalPoints.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Mandelbrot Set\n` +
            `   Resolution: ${args.resolution}×${args.resolution}\n` +
            `   Center: (${args.centerX}, ${args.centerY}), Zoom: ${args.zoom}\n` +
            `   Contours: ${contours.length}, Total points: ${totalPoints}`,
    );
}

function generateJulia(args: JuliaArgs): void {
    console.log(`Generating Julia set contours for c = ${args.juliaReal} + ${args.juliaImag}i... (this may take a moment)`);
    
    const contours = generateJuliaContours(args);
    const totalPoints = contours.reduce((sum, c) => sum + c.length, 0);

    const { svg, aspectRatio } = renderJuliaSVG({
        contours,
        resolution: args.resolution,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        meta: {
            type: 'julia',
            juliaReal: args.juliaReal.toString(),
            juliaImag: args.juliaImag.toString(),
            resolution: args.resolution.toString(),
            centerX: args.centerX.toString(),
            centerY: args.centerY.toString(),
            zoom: args.zoom.toString(),
            maxIter: args.maxIter.toString(),
            contours: contours.length.toString(),
            points: totalPoints.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    // Calculate and display the natural aspect ratio
    const naturalRatio = aspectRatio.width / aspectRatio.height;
    const ratioInfo = Math.abs(naturalRatio - 1) > 0.01
        ? `\n   Natural aspect: ${naturalRatio.toFixed(2)}:1 (${naturalRatio > 1 ? 'wider' : 'taller'})`
        : '';

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Julia Set\n` +
            `   c = ${args.juliaReal} + ${args.juliaImag}i\n` +
            `   Resolution: ${args.resolution}×${args.resolution}\n` +
            `   Center: (${args.centerX}, ${args.centerY}), Zoom: ${args.zoom}\n` +
            `   Contours: ${contours.length}, Total points: ${totalPoints}${ratioInfo}`,
    );
}

function generateDragon(args: DragonArgs): void {
    const points = generateDragonCurve(args.iter);
    const dimension = 2; // Dragon curve has Hausdorff dimension of exactly 2

    const svg = renderPathSVG({
        points,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        closePath: false, // Dragon curve is an open path
        meta: {
            type: 'dragon',
            dimension: dimension.toFixed(4),
            iter: args.iter.toString(),
            segments: points.length.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Dragon Curve\n` +
            `   Dimension: ${dimension.toFixed(4)}\n` +
            `   Iterations: ${args.iter}, Segments: ${points.length}`,
    );
}

function generateHilbert(args: HilbertArgs): void {
    const points = generateHilbertCurve(args.iter);
    const dimension = 2; // Hilbert curve has Hausdorff dimension of exactly 2

    const svg = renderPathSVG({
        points,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        closePath: false, // Hilbert curve is an open path
        meta: {
            type: 'hilbert',
            dimension: dimension.toFixed(4),
            iter: args.iter.toString(),
            segments: points.length.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Hilbert Curve\n` +
            `   Dimension: ${dimension.toFixed(4)}\n` +
            `   Iterations: ${args.iter}, Segments: ${points.length}`,
    );
}

function generateLevy(args: LevyArgs): void {
    const points = generateLevyCurve(args.iter);
    const dimension = 2; // Lévy C Curve has Hausdorff dimension of exactly 2

    const svg = renderPathSVG({
        points,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        closePath: false, // Lévy curve is an open path
        meta: {
            type: 'levy',
            dimension: dimension.toFixed(4),
            iter: args.iter.toString(),
            segments: points.length.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Lévy C Curve\n` +
            `   Dimension: ${dimension.toFixed(4)}\n` +
            `   Iterations: ${args.iter}, Segments: ${points.length}`,
    );
}

function generateSierpinski(args: SierpinskiArgs): void {
    const points = generateSierpinskiCurve(args.iter);
    const dimension = Math.log(3) / Math.log(2); // Sierpinski triangle has dimension ~1.585

    const svg = renderPathSVG({
        points,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        closePath: false, // Sierpinski arrowhead is an open path
        meta: {
            type: 'sierpinski',
            dimension: dimension.toFixed(4),
            iter: args.iter.toString(),
            segments: points.length.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Sierpinski Triangle Arrowhead\n` +
            `   Dimension: ${dimension.toFixed(4)}\n` +
            `   Iterations: ${args.iter}, Segments: ${points.length}`,
    );
}

function generatePeano(args: PeanoArgs): void {
    const points = generatePeanoCurve(args.iter);
    const dimension = 2; // Peano curve has Hausdorff dimension of exactly 2 (space-filling)

    const svg = renderPathSVG({
        points,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        closePath: false, // Peano curve is an open path
        meta: {
            type: 'peano',
            dimension: dimension.toFixed(4),
            iter: args.iter.toString(),
            segments: points.length.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Peano Curve\n` +
            `   Dimension: ${dimension.toFixed(4)}\n` +
            `   Iterations: ${args.iter}, Segments: ${points.length}`,
    );
}

function generateGosper(args: GosperArgs): void {
    const points = generateGosperCurve(args.iter);
    const dimension = Math.log(7) / Math.log(Math.sqrt(7)); // Gosper curve has dimension log(7)/log(sqrt(7)) ≈ 2

    const svg = renderPathSVG({
        points,
        size: args.size,
        margin: args.margin,
        bg: args.bg,
        fill: args.fill,
        gradient: args.gradient,
        gradientAngle: args.gradientAngle,
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        closePath: false, // Gosper curve is an open path
        meta: {
            type: 'gosper',
            dimension: dimension.toFixed(4),
            iter: args.iter.toString(),
            segments: points.length.toString(),
        },
    });

    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');

    console.log(
        `✅ Wrote ${args.out}\n` +
            `   Type: Gosper Curve/Flowsnake\n` +
            `   Dimension: ${dimension.toFixed(4)}\n` +
            `   Iterations: ${args.iter}, Segments: ${points.length}`,
    );
}

// ============================================================================
// Entry Point
// ============================================================================

async function main() {
    let args: Args | null;
    let isInteractive = false;

    // Check if running in interactive mode (no args or just the script path)
    if (process.argv.length <= 2) {
        args = await runInteractive();
        isInteractive = true;
    } else {
        args = parseCLIArgs(process.argv);
    }

    if (!args) {
        return; // Help was printed
    }

    // Print CLI command for interactive mode (before generation, so user sees it)
    if (isInteractive) {
        printCliCommand(args);
    }

    if (args.type === 'carpet') {
        generateCarpet(args);
    } else if (args.type === 'koch') {
        generateKoch(args);
    } else if (args.type === 'dragon') {
        generateDragon(args);
    } else if (args.type === 'hilbert') {
        generateHilbert(args);
    } else if (args.type === 'levy') {
        generateLevy(args);
    } else if (args.type === 'sierpinski') {
        generateSierpinski(args);
    } else if (args.type === 'peano') {
        generatePeano(args);
    } else if (args.type === 'gosper') {
        generateGosper(args);
    } else if (args.type === 'julia') {
        generateJulia(args);
    } else {
        generateMandelbrot(args);
    }
}

main().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
