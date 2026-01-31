"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type FractalType,
  type GeneratorOptions,
  FRACTAL_CONFIG,
} from "@cbnsndwch/fractal-generator";

/**
 * Gradient presets from uiGradients (https://github.com/Ghosh/uiGradients)
 * MIT License - Community contributed gradients by @_ighosh
 */
export const GRADIENT_PRESETS: Array<{ name: string; colors: string[] }> = [
  { name: "None", colors: [] },
  // Popular gradients
  { name: "Metapolis", colors: ["#659999", "#f4791f"] },
  { name: "Kyoo Pal", colors: ["#dd3e54", "#6be585"] },
  { name: "Stripe", colors: ["#1FA2FF", "#12D8FA", "#A6FFCB"] },
  { name: "Sunset", colors: ["#0B486B", "#F56217"] },
  { name: "Mojito", colors: ["#1D976C", "#93F9B9"] },
  { name: "Cherry", colors: ["#EB3349", "#F45C43"] },
  { name: "Pinky", colors: ["#DD5E89", "#F7BB97"] },
  { name: "Sea Blue", colors: ["#2b5876", "#4e4376"] },
  { name: "Mango", colors: ["#ffe259", "#ffa751"] },
  { name: "Purple Love", colors: ["#cc2b5e", "#753a88"] },
  { name: "Aqua Marine", colors: ["#1A2980", "#26D0CE"] },
  { name: "Sunrise", colors: ["#FF512F", "#F09819"] },
  { name: "Sel", colors: ["#00467F", "#A5CC82"] },
  { name: "Bloody Mary", colors: ["#FF512F", "#DD2476"] },
  { name: "Moonlit Asteroid", colors: ["#0F2027", "#203A43", "#2C5364"] },
  { name: "Cool Blues", colors: ["#2193b0", "#6dd5ed"] },
  { name: "Timber", colors: ["#fc00ff", "#00dbde"] },
  { name: "Relay", colors: ["#3A1C71", "#D76D77", "#FFAF7B"] },
  { name: "Stellar", colors: ["#7474BF", "#348AC7"] },
];

export const DEFAULT_OPTIONS: GeneratorOptions = {
  type: "koch",
  size: 600,
  iter: 4,
  bg: "none",
  circleBg: "none",
  fill: "#000000",
  gradient: ["#659999", "#f4791f"],
  gradientAngle: 0,
  stroke: "none",
  strokeWidth: 1,
  margin: 20,
  sides: 3,
  inward: false,
} as GeneratorOptions;

/**
 * Debounce hook for smooth updates
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export interface UseFractalPlaygroundOptions {
  /** Initial generator options */
  initialOptions?: Partial<GeneratorOptions>;
  /** Debounce delay in ms for preview updates (default: 150) */
  debounceDelay?: number;
  /** Whether to show circle background initially */
  initialShowCircleBg?: boolean;
  /** Initial gradient preset name */
  initialGradient?: string;
}

export interface FractalPlaygroundState {
  /** Current raw options (not debounced) */
  options: GeneratorOptions;
  /** Debounced options for rendering */
  debouncedOptions: GeneratorOptions;
  /** Effective options including circle background toggle */
  effectiveOptions: GeneratorOptions;
  /** Currently selected gradient preset name */
  selectedGradient: string;
  /** Whether circle background is shown */
  showCircleBg: boolean;
  /** Configuration for current fractal type */
  fractalConfig: (typeof FRACTAL_CONFIG)[FractalType];
}

export interface FractalPlaygroundActions {
  /** Update a single option */
  updateOption: <K extends keyof GeneratorOptions>(
    key: K,
    value: GeneratorOptions[K]
  ) => void;
  /** Update multiple options at once */
  updateOptions: (updates: Partial<GeneratorOptions>) => void;
  /** Change fractal type (resets type-specific options) */
  setFractalType: (type: FractalType) => void;
  /** Select a gradient preset by name */
  setGradient: (gradientName: string) => void;
  /** Toggle circle background */
  setShowCircleBg: (show: boolean) => void;
  /** Reset to default options */
  reset: () => void;
  /** Download the SVG */
  downloadSVG: (containerSelector?: string) => void;
  /** Get SVG string from a container element */
  getSVGString: (containerSelector?: string) => string | null;
}

export type UseFractalPlaygroundReturn = FractalPlaygroundState &
  FractalPlaygroundActions;

/**
 * Headless hook for building fractal playground UIs
 *
 * Provides all state management and actions for a fractal playground,
 * allowing you to build your own UI on top of it.
 *
 * @example
 * ```tsx
 * function MyPlayground() {
 *   const {
 *     effectiveOptions,
 *     options,
 *     fractalConfig,
 *     updateOption,
 *     setFractalType,
 *     downloadSVG,
 *   } = useFractalPlayground();
 *
 *   return (
 *     <div>
 *       <select
 *         value={options.type}
 *         onChange={(e) => setFractalType(e.target.value as FractalType)}
 *       >
 *         <option value="koch">Koch Snowflake</option>
 *         <option value="dragon">Dragon Curve</option>
 *       </select>
 *
 *       <input
 *         type="range"
 *         min={1}
 *         max={fractalConfig.maxIter}
 *         value={options.iter}
 *         onChange={(e) => updateOption('iter', Number(e.target.value))}
 *       />
 *
 *       <div className="preview">
 *         <FractalGenerator options={effectiveOptions} />
 *       </div>
 *
 *       <button onClick={() => downloadSVG('.preview')}>Download</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFractalPlayground(
  opts: UseFractalPlaygroundOptions = {}
): UseFractalPlaygroundReturn {
  const {
    initialOptions = {},
    debounceDelay = 150,
    initialShowCircleBg = false,
    initialGradient = "Metapolis",
  } = opts;

  const [options, setOptions] = useState<GeneratorOptions>({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
  } as GeneratorOptions);

  const [selectedGradient, setSelectedGradient] = useState(initialGradient);
  const [showCircleBg, setShowCircleBg] = useState(initialShowCircleBg);

  // Debounce options for smooth preview updates
  const debouncedOptions = useDebouncedValue(options, debounceDelay);

  // Compute effective options with circle backdrop toggle
  const effectiveOptions = useMemo(
    () => ({
      ...debouncedOptions,
      circleBg: showCircleBg ? debouncedOptions.circleBg : "none",
    }),
    [debouncedOptions, showCircleBg]
  );

  const fractalConfig = FRACTAL_CONFIG[options.type];

  const updateOption = useCallback(
    <K extends keyof GeneratorOptions>(key: K, value: GeneratorOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }) as GeneratorOptions);
    },
    []
  );

  const updateOptions = useCallback((updates: Partial<GeneratorOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }) as GeneratorOptions);
  }, []);

  const setFractalType = useCallback(
    (type: FractalType) => {
      const baseOpts = {
        ...DEFAULT_OPTIONS,
        iter: FRACTAL_CONFIG[type].defaultIter,
        gradient: options.gradient,
        gradientAngle: options.gradientAngle,
      };

      switch (type) {
        case "koch":
          setOptions({
            ...baseOpts,
            type: "koch",
            sides: 3,
            inward: false,
          } as GeneratorOptions);
          break;
        case "carpet":
          setOptions({
            ...baseOpts,
            type: "carpet",
            D: 2.5,
            kMin: 2,
            kMax: 5,
            maxRects: 10000,
          } as GeneratorOptions);
          break;
        case "mandelbrot":
          setOptions({
            ...baseOpts,
            type: "mandelbrot",
            resolution: 200,
            centerX: -0.5,
            centerY: 0,
            zoom: 1,
            maxIter: 200,
          } as GeneratorOptions);
          break;
        case "julia":
          setOptions({
            ...baseOpts,
            type: "julia",
            resolution: 200,
            juliaReal: -0.7,
            juliaImag: 0.27,
            centerX: 0,
            centerY: 0,
            zoom: 1,
            maxIter: 200,
          } as GeneratorOptions);
          break;
        default:
          setOptions({ ...baseOpts, type } as GeneratorOptions);
      }
    },
    [options.gradient, options.gradientAngle]
  );

  const setGradient = useCallback((gradientName: string) => {
    setSelectedGradient(gradientName);
    const preset = GRADIENT_PRESETS.find((p) => p.name === gradientName);
    if (preset) {
      const newGradient = preset.colors.length > 0 ? preset.colors : null;
      setOptions((prev) => ({
        ...prev,
        gradient: newGradient,
      }) as GeneratorOptions);
    }
  }, []);

  const getSVGString = useCallback(
    (containerSelector: string = ".fractal-preview"): string | null => {
      const container = document.querySelector(containerSelector);
      const svgElement = container?.querySelector("svg");
      if (!svgElement) return null;
      return new XMLSerializer().serializeToString(svgElement);
    },
    []
  );

  const downloadSVG = useCallback(
    (containerSelector: string = ".fractal-preview") => {
      const svgData = getSVGString(containerSelector);
      if (!svgData) return;

      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${options.type}-fractal.svg`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [options.type, getSVGString]
  );

  const reset = useCallback(() => {
    setOptions({ ...DEFAULT_OPTIONS } as GeneratorOptions);
    setSelectedGradient("Metapolis");
    setShowCircleBg(false);
  }, []);

  return {
    // State
    options,
    debouncedOptions,
    effectiveOptions,
    selectedGradient,
    showCircleBg,
    fractalConfig,
    // Actions
    updateOption,
    updateOptions,
    setFractalType,
    setGradient,
    setShowCircleBg,
    reset,
    downloadSVG,
    getSVGString,
  };
}
