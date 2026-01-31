/**
 * @cbnsndwch/fractal-react
 * React components for rendering fractal SVGs
 */

export { FractalGenerator } from "./FractalGenerator.js";
export type { FractalGeneratorProps } from "./FractalGenerator.js";

// Re-export types from generator for convenience
export type {
  GeneratorOptions,
  FractalType,
  Point,
} from "@cbnsndwch/fractal-generator";
