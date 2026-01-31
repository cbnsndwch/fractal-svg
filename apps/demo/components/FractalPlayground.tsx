'use client';

import { useState } from 'react';
import { FractalGenerator } from '@cbnsndwch/fractal-react';
import { type FractalType, type GeneratorOptions, FRACTAL_CONFIG } from '@cbnsndwch/fractal-generator';

const DEFAULT_BASE_OPTIONS = {
  size: 600,
  iter: 4,
  bg: '#ffffff',
  circleBg: '#f0f0f0',
  fill: '#000000',
  gradient: null,
  gradientAngle: 0,
  stroke: '#000000',
  strokeWidth: 1,
  margin: 20,
};

export default function FractalPlayground() {
  const [fractalType, setFractalType] = useState<FractalType>('koch');
  const [options, setOptions] = useState<GeneratorOptions>({
    ...DEFAULT_BASE_OPTIONS,
    sides: 3,
    inward: false,
  } as any);

  const config = FRACTAL_CONFIG[fractalType];

  const handleFractalTypeChange = (type: FractalType) => {
    setFractalType(type);
    
    // Set type-specific defaults
    const baseOpts = {
      ...DEFAULT_BASE_OPTIONS,
      iter: FRACTAL_CONFIG[type].defaultIter,
    };

    switch (type) {
      case 'koch':
        setOptions({ ...baseOpts, sides: 3, inward: false });
        break;
      case 'carpet':
        setOptions({ ...baseOpts, D: 2.5, kMin: 2, kMax: 5, maxRects: 10000 });
        break;
      case 'mandelbrot':
        setOptions({ ...baseOpts, resolution: 200, centerX: -0.5, centerY: 0, zoom: 1, maxIter: 100, threshold: 4 });
        break;
      case 'julia':
        setOptions({ ...baseOpts, resolution: 200, juliaReal: -0.7, juliaImag: 0.27, centerX: 0, centerY: 0, zoom: 1, maxIter: 100, threshold: 4 });
        break;
      default:
        setOptions(baseOpts);
    }
  };

  const updateOption = (key: string, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleDownload = () => {
    const svgElement = document.querySelector('.fractal-preview svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
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
            <label className="block text-sm font-medium mb-2">Fractal Type</label>
            <select
              value={fractalType}
              onChange={(e) => handleFractalTypeChange(e.target.value as FractalType)}
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
            <p className="text-xs text-gray-500 mt-1">{config.segmentFormula}</p>
          </div>

          {/* Iterations */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Iterations: {options.iter}
            </label>
            <input
              type="range"
              min="1"
              max={config.maxIter}
              value={options.iter}
              onChange={(e) => updateOption('iter', parseInt(e.target.value))}
              className="w-full"
            />
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
              onChange={(e) => updateOption('size', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Koch-specific options */}
          {fractalType === 'koch' && (
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
                  onChange={(e) => updateOption('sides', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(options as any).inward}
                    onChange={(e) => updateOption('inward', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Inward</span>
                </label>
              </div>
            </>
          )}

          {/* Colors */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Background</label>
              <input
                type="color"
                value={options.bg}
                onChange={(e) => updateOption('bg', e.target.value)}
                className="w-full h-10 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fill</label>
              <input
                type="color"
                value={options.fill}
                onChange={(e) => updateOption('fill', e.target.value)}
                className="w-full h-10 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stroke</label>
              <input
                type="color"
                value={options.stroke}
                onChange={(e) => updateOption('stroke', e.target.value)}
                className="w-full h-10 cursor-pointer"
              />
            </div>
          </div>

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
              onChange={(e) => updateOption('strokeWidth', parseFloat(e.target.value))}
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
          <div className="fractal-preview flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
            <FractalGenerator options={options} />
          </div>
        </div>
      </div>
    </div>
  );
}
