/**
 * @cbnsndwch/fractal-react
 * React components for rendering fractal SVGs
 */

export { FractalGenerator } from "./FractalGenerator.js";
export type { FractalGeneratorProps } from "./FractalGenerator.js";

// Headless playground hook for building custom UIs
export {
  useFractalPlayground,
  GRADIENT_PRESETS,
  DEFAULT_OPTIONS,
} from "./useFractalPlayground.js";
export type {
  UseFractalPlaygroundOptions,
  UseFractalPlaygroundReturn,
  FractalPlaygroundState,
  FractalPlaygroundActions,
} from "./useFractalPlayground.js";

// Re-export types and config from generator for convenience
export { FRACTAL_CONFIG } from "@cbnsndwch/fractal-generator";
export type {
  GeneratorOptions,
  FractalType,
  Point,
} from "@cbnsndwch/fractal-generator";
