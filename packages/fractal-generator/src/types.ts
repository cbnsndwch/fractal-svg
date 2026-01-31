/**
 * Core types for fractal generation
 */

export type FractalType =
  | "carpet"
  | "koch"
  | "mandelbrot"
  | "julia"
  | "dragon"
  | "hilbert"
  | "levy"
  | "sierpinski"
  | "peano"
  | "gosper";

export type Point = { x: number; y: number };

export type Rect = { x: number; y: number; s: number };

export type BaseGeneratorOptions = {
  size: number;
  iter: number;
  bg: string;
  circleBg: string;
  fill: string;
  gradient: string[] | null;
  gradientAngle: number;
  stroke: string;
  strokeWidth: number;
  margin: number;
};

export type CarpetOptions = BaseGeneratorOptions & {
  type: "carpet";
  D: number;
  kMin: number;
  kMax: number;
  maxRects: number;
};

export type KochOptions = BaseGeneratorOptions & {
  type: "koch";
  sides: number;
  inward: boolean;
};

export type MandelbrotOptions = BaseGeneratorOptions & {
  type: "mandelbrot";
  resolution: number;
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
};

export type JuliaOptions = BaseGeneratorOptions & {
  type: "julia";
  resolution: number;
  juliaReal: number;
  juliaImag: number;
  centerX: number;
  centerY: number;
  zoom: number;
  maxIter: number;
};

export type DragonOptions = BaseGeneratorOptions & { type: "dragon" };
export type HilbertOptions = BaseGeneratorOptions & { type: "hilbert" };
export type LevyOptions = BaseGeneratorOptions & { type: "levy" };
export type SierpinskiOptions = BaseGeneratorOptions & { type: "sierpinski" };
export type PeanoOptions = BaseGeneratorOptions & { type: "peano" };
export type GosperOptions = BaseGeneratorOptions & { type: "gosper" };

export type GeneratorOptions =
  | CarpetOptions
  | KochOptions
  | MandelbrotOptions
  | JuliaOptions
  | DragonOptions
  | HilbertOptions
  | LevyOptions
  | SierpinskiOptions
  | PeanoOptions
  | GosperOptions;

export type FractalConfig = {
  defaultIter: number;
  maxIter: number;
  segmentFormula: string;
};

export const FRACTAL_CONFIG: Record<FractalType, FractalConfig> = {
  carpet: {
    defaultIter: 4,
    maxIter: 8,
    segmentFormula: "N^iter rectangles (exponential)",
  },
  koch: { defaultIter: 4, maxIter: 7, segmentFormula: "4^iter segments" },
  mandelbrot: {
    defaultIter: 200,
    maxIter: 500,
    segmentFormula: "resolution-based",
  },
  julia: { defaultIter: 200, maxIter: 500, segmentFormula: "resolution-based" },
  dragon: { defaultIter: 12, maxIter: 18, segmentFormula: "2^iter+1 segments" },
  hilbert: { defaultIter: 6, maxIter: 9, segmentFormula: "4^iter segments" },
  levy: { defaultIter: 14, maxIter: 18, segmentFormula: "2^iter+1 segments" },
  sierpinski: {
    defaultIter: 10,
    maxIter: 14,
    segmentFormula: "3^iter segments",
  },
  peano: { defaultIter: 4, maxIter: 6, segmentFormula: "9^iter segments" },
  gosper: { defaultIter: 4, maxIter: 6, segmentFormula: "7^iter segments" },
};
