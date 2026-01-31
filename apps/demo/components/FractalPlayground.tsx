"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { FractalGenerator } from "@cbnsndwch/fractal-react";
import {
  type FractalType,
  type GeneratorOptions,
  FRACTAL_CONFIG,
} from "@cbnsndwch/fractal-generator";

/**
 * Gradient presets from uiGradients (https://github.com/Ghosh/uiGradients)
 * MIT License - Community contributed gradients by @_ighosh
 */
const GRADIENT_PRESETS: Array<{ name: string; colors: string[] }> = [
  { name: "None", colors: [] },
  // Requested gradients
  { name: "Metapolis", colors: ["#659999", "#f4791f"] },
  { name: "Kyoo Pal", colors: ["#dd3e54", "#6be585"] },
  // Beautiful multi-color gradients
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

const DEFAULT_BASE_OPTIONS = {
  size: 600,
  iter: 4,
  bg: "#ffffff",
  circleBg: "#f0f0f0",
  fill: "#000000",
  gradient: null,
  gradientAngle: 0,
  stroke: "#000000",
  strokeWidth: 1,
  margin: 20,
};

// Color picker with transparent option
function ColorPicker({
  label,
  value,
  onChange,
  allowTransparent = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowTransparent?: boolean;
}) {
  const isTransparent = value === "none" || value === "transparent";

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={isTransparent ? "#ffffff" : value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isTransparent}
          className={`flex-1 h-10 cursor-pointer rounded ${isTransparent ? "opacity-50" : ""}`}
        />
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange(isTransparent ? "#ffffff" : "none")}
            className={`px-3 py-2 text-xs font-medium rounded border transition-colors ${
              isTransparent
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
            title="Toggle transparent"
          >
            ∅
          </button>
        )}
      </div>
      {isTransparent && (
        <p className="text-xs text-gray-500 mt-1">Transparent</p>
      )}
    </div>
  );
}

// Debounce hook for snappy preview updates
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

export default function FractalPlayground() {
  const [options, setOptions] = useState<GeneratorOptions>({
    ...DEFAULT_BASE_OPTIONS,
    type: "koch",
    sides: 3,
    inward: false,
    // Start with a beautiful gradient by default
    gradient: ["#659999", "#f4791f"],
  } as GeneratorOptions);

  const [selectedGradient, setSelectedGradient] = useState("Metapolis");
  const [showCircleBg, setShowCircleBg] = useState(false);

  // Debounce options for smooth preview updates (150ms delay)
  const debouncedOptions = useDebouncedValue(options, 150);

  // Compute effective options with circle backdrop toggle
  const effectiveOptions = useMemo(
    () => ({
      ...debouncedOptions,
      circleBg: showCircleBg ? debouncedOptions.circleBg : "none",
    }),
    [debouncedOptions, showCircleBg],
  );

  const fractalType = options.type;
  const config = FRACTAL_CONFIG[fractalType];

  const handleFractalTypeChange = (type: FractalType) => {
    // Set type-specific defaults
    const baseOpts = {
      ...DEFAULT_BASE_OPTIONS,
      iter: FRACTAL_CONFIG[type].defaultIter,
      gradient: options.gradient, // Preserve current gradient
      gradientAngle: options.gradientAngle,
    };

    switch (type) {
      case "koch":
        setOptions({
          ...baseOpts,
          type: "koch",
          sides: 3,
          inward: false,
        });
        break;
      case "carpet":
        setOptions({
          ...baseOpts,
          type: "carpet",
          D: 2.5,
          kMin: 2,
          kMax: 5,
          maxRects: 10000,
        });
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
        });
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
        });
        break;
      case "dragon":
        setOptions({ ...baseOpts, type: "dragon" });
        break;
      case "hilbert":
        setOptions({ ...baseOpts, type: "hilbert" });
        break;
      case "levy":
        setOptions({ ...baseOpts, type: "levy" });
        break;
      case "sierpinski":
        setOptions({ ...baseOpts, type: "sierpinski" });
        break;
      case "peano":
        setOptions({ ...baseOpts, type: "peano" });
        break;
      case "gosper":
        setOptions({ ...baseOpts, type: "gosper" });
        break;
      default:
        setOptions({
          ...baseOpts,
          type: "koch",
          sides: 3,
          inward: false,
        });
    }
  };

  const handleGradientChange = (gradientName: string) => {
    setSelectedGradient(gradientName);
    const preset = GRADIENT_PRESETS.find((p) => p.name === gradientName);
    if (preset) {
      updateOption("gradient", preset.colors.length > 0 ? preset.colors : null);
    }
  };

  const updateOption = (key: string, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleDownload = () => {
    const svgElement = document.querySelector(".fractal-preview svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fractalType}-fractal.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Controls Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Controls</h2>

          {/* Fractal Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Fractal Type
            </label>
            <select
              value={fractalType}
              onChange={(e) =>
                handleFractalTypeChange(e.target.value as FractalType)
              }
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="koch">Koch Snowflake</option>
              <option value="dragon">Dragon Curve</option>
              <option value="hilbert">Hilbert Curve</option>
              <option value="levy">Lévy C Curve</option>
              <option value="sierpinski">Sierpinski Triangle</option>
              <option value="peano">Peano Curve</option>
              <option value="gosper">Gosper Curve</option>
              <option value="carpet">Sierpinski Carpet</option>
              <option value="mandelbrot">Mandelbrot Set</option>
              <option value="julia">Julia Set</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {config.segmentFormula}
            </p>
          </div>

          {/* Iterations / Resolution */}
          <div className="mb-4">
            {fractalType === "mandelbrot" || fractalType === "julia" ? (
              <>
                <label className="block text-sm font-medium mb-2">
                  Resolution: {(options as any).resolution}
                </label>
                <input
                  type="range"
                  min="50"
                  max={config.maxIter}
                  step="10"
                  value={(options as any).resolution}
                  onChange={(e) =>
                    updateOption("resolution", parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </>
            ) : (
              <>
                <label className="block text-sm font-medium mb-2">
                  Iterations: {options.iter}
                </label>
                <input
                  type="range"
                  min="1"
                  max={config.maxIter}
                  value={options.iter}
                  onChange={(e) =>
                    updateOption("iter", parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </>
            )}
          </div>

          {/* Size */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Size: {options.size}px
            </label>
            <input
              type="range"
              min="200"
              max="1200"
              step="50"
              value={options.size}
              onChange={(e) => updateOption("size", parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Koch-specific options */}
          {fractalType === "koch" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Sides: {(options as any).sides}
                </label>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={(options as any).sides}
                  onChange={(e) =>
                    updateOption("sides", parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(options as any).inward}
                    onChange={(e) => updateOption("inward", e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Inward</span>
                </label>
              </div>
            </>
          )}

          {/* Colors */}
          <div className="space-y-3 mb-4">
            <ColorPicker
              label="Background"
              value={options.bg}
              onChange={(value) => updateOption("bg", value)}
              allowTransparent
            />

            {/* Circle Backdrop Toggle */}
            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">Circle Backdrop</span>
                <button
                  type="button"
                  onClick={() => setShowCircleBg(!showCircleBg)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showCircleBg
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showCircleBg ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
              {showCircleBg && (
                <div className="mt-2">
                  <ColorPicker
                    label="Circle Color"
                    value={options.circleBg}
                    onChange={(value) => updateOption("circleBg", value)}
                    allowTransparent
                  />
                </div>
              )}
            </div>

            <ColorPicker
              label="Stroke"
              value={options.stroke}
              onChange={(value) => updateOption("stroke", value)}
              allowTransparent
            />
          </div>

          {/* Fill Mode Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Fill Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedGradient("None");
                  updateOption("gradient", null);
                }}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  !options.gradient || options.gradient.length === 0
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => {
                  if (!options.gradient || options.gradient.length === 0) {
                    setSelectedGradient("Metapolis");
                    updateOption("gradient", ["#659999", "#f4791f"]);
                  }
                }}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  options.gradient && options.gradient.length > 0
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Gradient
              </button>
            </div>
          </div>

          {/* Solid Fill Color (only when no gradient) */}
          {(!options.gradient || options.gradient.length === 0) && (
            <div className="mb-4">
              <ColorPicker
                label="Fill Color"
                value={options.fill}
                onChange={(value) => updateOption("fill", value)}
                allowTransparent
              />
            </div>
          )}

          {/* Gradient Preset Picker (only when gradient mode) */}
          {options.gradient && options.gradient.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Gradient Preset
              </label>
              <select
                value={selectedGradient}
                onChange={(e) => handleGradientChange(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                {GRADIENT_PRESETS.filter((p) => p.colors.length > 0).map(
                  (preset) => (
                    <option key={preset.name} value={preset.name}>
                      {preset.name}
                    </option>
                  ),
                )}
              </select>
              {/* Gradient preview swatch */}
              <div
                className="mt-2 h-6 rounded"
                style={{
                  background: `linear-gradient(to right, ${options.gradient.join(", ")})`,
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Gradients from{" "}
                <a
                  href="https://github.com/Ghosh/uiGradients"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  uiGradients
                </a>
              </p>
            </div>
          )}

          {/* Gradient Angle (only show when gradient is active) */}
          {options.gradient && options.gradient.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Gradient Angle: {options.gradientAngle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={options.gradientAngle}
                onChange={(e) =>
                  updateOption("gradientAngle", parseInt(e.target.value))
                }
                className="w-full"
              />
            </div>
          )}

          {/* Stroke Width */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Stroke Width: {options.strokeWidth}px
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={options.strokeWidth}
              onChange={(e) =>
                updateOption("strokeWidth", parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Download SVG
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Preview</h2>
          <div
            className="fractal-preview flex items-center justify-center bg-gray-100 dark:bg-gray-200 rounded-lg overflow-hidden"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #d9d9d9 25%, transparent 25%), linear-gradient(-45deg, #d9d9d9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d9d9d9 75%), linear-gradient(-45deg, transparent 75%, #d9d9d9 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          >
            <FractalGenerator options={effectiveOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
