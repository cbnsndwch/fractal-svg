'use client';

import React from 'react';
import { generateFractalSVG, type GeneratorOptions } from '@cbnsndwch/fractal-generator';

export interface FractalGeneratorProps {
  options: GeneratorOptions;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * React component for rendering fractal SVGs
 * Can be used in both client and server components
 */
export function FractalGenerator({ options, className, style }: FractalGeneratorProps) {
  const svgString = generateFractalSVG(options);
  
  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
