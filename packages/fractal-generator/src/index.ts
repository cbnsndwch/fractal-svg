/**
 * @cbnsndwch/fractal-generator
 * Isomorphic TypeScript library for generating fractal SVGs
 */

export * from "./types.js";

// Re-export core generation functions
// TODO: These will be extracted and refactored from generator.ts
// For now, we're focusing on getting the monorepo structure working

export { generateFractalSVG } from "./svg-generator.js";
