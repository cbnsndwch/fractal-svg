// spiral-koch-fractal.ts
// Generates a spiral Koch curve fractal - a continuous path with recursive bumps

import * as fs from 'node:fs';
import * as path from 'node:path';

interface Point {
    x: number;
    y: number;
}

// Apply Koch subdivision to a line segment
// Instead of straight line A->B, create A -> P1 -> P2 -> P3 -> B
// where P2 is pushed outward to create the characteristic bump
function kochSubdivide(p1: Point, p2: Point, outward: boolean = true): Point[] {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len < 0.5) return []; // Skip tiny segments
    
    // Points at 1/3 and 2/3 along the segment
    const a: Point = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
    const b: Point = { x: p1.x + (2 * dx) / 3, y: p1.y + (2 * dy) / 3 };
    
    // Peak point - perpendicular to segment, at 1/2 point, pushed out
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const perpX = -dy / len;
    const perpY = dx / len;
    const dir = outward ? 1 : -1;
    const peak: Point = {
        x: midX + perpX * (len / 3) * 0.866 * dir, // sqrt(3)/2 for equilateral
        y: midY + perpY * (len / 3) * 0.866 * dir
    };
    
    return [a, peak, b];
}

// Recursively apply Koch subdivision to a path
function applyKochToPath(points: Point[], iterations: number, outward: boolean = true): Point[] {
    if (iterations === 0) return points;
    
    let result: Point[] = [points[0]];
    
    for (let i = 0; i < points.length - 1; i++) {
        const subdivided = kochSubdivide(points[i], points[i + 1], outward);
        if (subdivided.length > 0) {
            result.push(...subdivided);
        }
        result.push(points[i + 1]);
    }
    
    return applyKochToPath(result, iterations - 1, outward);
}

// Create a thick spiral shape by generating inner and outer edges
function generateSpiralShape(
    centerX: number,
    centerY: number,
    startRadius: number,
    endRadius: number,
    startAngle: number,
    totalRotation: number,
    thickness: number,
    endThickness: number,
    numPoints: number,
    kochIterations: number,
    clockwise: boolean = false
): Point[] {
    const outerPoints: Point[] = [];
    const innerPoints: Point[] = [];
    
    const rotDir = clockwise ? -1 : 1;
    
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const angle = startAngle + totalRotation * t * rotDir;
        const radius = startRadius + (endRadius - startRadius) * t;
        const thick = thickness + (endThickness - thickness) * t;
        
        // Outer edge
        outerPoints.push({
            x: centerX + Math.cos(angle) * (radius + thick / 2),
            y: centerY + Math.sin(angle) * (radius + thick / 2)
        });
        
        // Inner edge
        innerPoints.push({
            x: centerX + Math.cos(angle) * (radius - thick / 2),
            y: centerY + Math.sin(angle) * (radius - thick / 2)
        });
    }
    
    // Apply Koch fractal to the outer edge (the bumpy part)
    // Bumps should point outward from the spiral
    const fractalOuter = applyKochToPath(outerPoints, kochIterations, !clockwise);
    
    // Inner edge stays smooth, just reverse it
    const reversedInner = [...innerPoints].reverse();
    
    // Combine into closed shape
    return [...fractalOuter, ...reversedInner];
}

// Convert points to SVG path data
function pointsToPath(points: Point[]): string {
    if (points.length === 0) return '';
    
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
    }
    d += ' Z';
    
    return d;
}

function generateFractal(size: number): string {
    const cx = size / 2;
    const cy = size / 2 - 50;
    
    // Green spiral arm (left side, curling inward clockwise)
    const greenSpiral = generateSpiralShape(
        cx - 70, cy + 20,   // center offset to the left
        120,                 // start radius (outer)
        12,                  // end radius (inner, tight curl)
        Math.PI * 0.85,     // start angle (upper left)
        Math.PI * 2.3,      // total rotation
        32,                  // start thickness
        6,                   // end thickness
        50,                  // num base points
        4,                   // koch iterations
        true                 // clockwise
    );
    
    // Blue spiral arm (right side, curling inward counter-clockwise)
    const blueSpiral = generateSpiralShape(
        cx + 70, cy - 20,   // center offset to the right
        110,                 // start radius
        12,                  // end radius
        Math.PI * 0.15,     // start angle (upper right)
        Math.PI * 2.1,      // total rotation
        30,                  // start thickness
        6,                   // end thickness
        50,                  // num base points
        4,                   // koch iterations
        false                // counter-clockwise
    );
    
    const greenPath = pointsToPath(greenSpiral);
    const bluePath = pointsToPath(blueSpiral);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <title>Spiral Fractal - Self-Similar</title>
  <desc>A self-similar spiral Koch fractal</desc>
  
  <defs>
    <linearGradient id="greenGradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2ecc71"/>
      <stop offset="50%" stop-color="#1abc9c"/>
      <stop offset="100%" stop-color="#16a085"/>
    </linearGradient>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5dade2"/>
      <stop offset="50%" stop-color="#3498db"/>
      <stop offset="100%" stop-color="#1a5276"/>
    </linearGradient>
  </defs>
  
  <rect width="${size}" height="${size}" fill="white"/>
  
  <path d="${greenPath}" fill="url(#greenGradient)" />
  <path d="${bluePath}" fill="url(#blueGradient)" />
  
  <text x="${size/2}" y="${size - 80}" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="300" fill="#2c3e50" text-anchor="middle" letter-spacing="10">FRACTAL</text>
  <text x="${size/2}" y="${size - 45}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="300" fill="#7f8c8d" text-anchor="middle" letter-spacing="5">SELF-SIMILAR</text>
</svg>
`;
}

function main() {
    const svg = generateFractal(800);
    
    const outPath = path.resolve(process.cwd(), 'output/spiral-fractal.svg');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, svg, 'utf8');
    
    console.log('Generated spiral Koch fractal');
    console.log('Wrote: output/spiral-fractal.svg');
}

main();
