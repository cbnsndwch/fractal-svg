import type {
  GeneratorOptions,
  Point,
  Rect,
  KochOptions,
  CarpetOptions,
  MandelbrotOptions,
  JuliaOptions,
  DragonOptions,
  HilbertOptions,
  LevyOptions,
  SierpinskiOptions,
  PeanoOptions,
  GosperOptions,
} from "./types.js";

// ============================================================================
// SVG Utility Functions
// ============================================================================

function svgEscape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildGradientDefs(
  gradient: string[],
  gradientAngle: number,
): { defs: string; fillValue: string } {
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
    .join("\n");

  const defs = `
  <defs>
    <linearGradient id="fractalGradient" x1="${x1.toFixed(1)}%" y1="${y1.toFixed(1)}%" x2="${x2.toFixed(1)}%" y2="${y2.toFixed(1)}%">
${stops}
    </linearGradient>
  </defs>`;

  return { defs, fillValue: "url(#fractalGradient)" };
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

function buildPattern(k: number, N: number): Array<[number, number]> {
  const center = (k - 1) / 2;
  const cells: Array<{
    cx: number;
    cy: number;
    score: number;
    x: number;
    y: number;
  }> = [];
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

function generateRects(
  k: number,
  pattern: Array<[number, number]>,
  iter: number,
  maxRects = 100_000,
): Rect[] {
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
    }
    rects = next;
    if (rects.length > maxRects) break;
  }
  return rects;
}

function renderCarpetSVG(options: CarpetOptions): string {
  const best = pickBestNK(options.D, options.kMin, options.kMax);
  const pattern = buildPattern(best.k, best.N);
  const rects = generateRects(best.k, pattern, options.iter, options.maxRects);

  const {
    size,
    margin,
    bg,
    fill,
    gradient,
    gradientAngle,
    stroke,
    strokeWidth,
  } = options;
  const inner = size - 2 * margin;
  const scale = inner;

  const rectEls = rects
    .map((r) => {
      const x = margin + r.x * scale;
      const y = margin + r.y * scale;
      const s = r.s * scale;
      return `<rect x="${x.toFixed(4)}" y="${y.toFixed(4)}" width="${s.toFixed(4)}" height="${s.toFixed(4)}" />`;
    })
    .join("\n");

  let defs = "";
  let fillValue = svgEscape(fill);

  if (gradient && gradient.length >= 2) {
    const gradResult = buildGradientDefs(gradient, gradientAngle);
    defs = gradResult.defs;
    fillValue = gradResult.fillValue;
  }

  const style = `g.cells rect { fill: ${fillValue}; stroke: ${svgEscape(stroke)}; stroke-width: ${strokeWidth}; shape-rendering: crispEdges; }`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}
  <title>Sierpinski Carpet Fractal</title>
  <style>${style}</style>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${svgEscape(bg)}" />
  <g class="cells">
${rectEls}
  </g>
</svg>
`;
}

// ============================================================================
// Path-Based Fractal SVG Renderer
// ============================================================================

function renderPathSVG(params: {
  points: Point[];
  size: number;
  margin: number;
  bg: string;
  circleBg?: string;
  fill: string;
  gradient: string[] | null;
  gradientAngle: number;
  stroke: string;
  strokeWidth: number;
  closePath?: boolean;
  title: string;
}): string {
  const {
    points,
    size,
    margin,
    bg,
    circleBg,
    fill,
    gradient,
    gradientAngle,
    stroke,
    strokeWidth,
    closePath = true,
    title,
  } = params;

  const inner = size - 2 * margin;

  // Build path from points
  const pathParts = points.map((p, i) => {
    const x = margin + p.x * inner;
    const y = margin + p.y * inner;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(4)} ${y.toFixed(4)}`;
  });
  if (closePath) {
    pathParts.push("Z");
  }
  const pathD = pathParts.join(" ");

  let defs = "";
  let fillValue = svgEscape(fill);
  let strokeValue = svgEscape(stroke);

  if (gradient && gradient.length >= 2) {
    const gradResult = buildGradientDefs(gradient, gradientAngle);
    defs = gradResult.defs;

    if (closePath) {
      fillValue = gradResult.fillValue;
      if (stroke === "none") strokeValue = "none";
    } else {
      fillValue = "none";
      strokeValue = gradResult.fillValue;
    }
  } else if (!closePath) {
    fillValue = "none";
    if (stroke === "none") {
      strokeValue = fill;
    }
  }

  const finalStrokeWidth = !closePath && strokeWidth === 0 ? 2 : strokeWidth;

  const center = size / 2;
  const circleRadius = size / 2 - margin / 2;
  const circleBgEl =
    circleBg && circleBg !== "none"
      ? `\n  <circle cx="${center}" cy="${center}" r="${circleRadius}" fill="${svgEscape(circleBg)}" />`
      : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defs}
  <title>${svgEscape(title)}</title>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${svgEscape(bg)}" />${circleBgEl}
  <path d="${pathD}" fill="${fillValue}" stroke="${strokeValue}" stroke-width="${finalStrokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;
}

// ============================================================================
// Koch Snowflake Generation
// ============================================================================

function generateKochCurve(
  sides: number,
  iter: number,
  inward: boolean,
): Point[] {
  const basePoints: Point[] = [];
  const radius = 1;
  const angleOffset = -Math.PI / 2;

  for (let i = 0; i < sides; i++) {
    const angle = angleOffset + (2 * Math.PI * i) / sides;
    basePoints.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
  }

  let points = [...basePoints, basePoints[0]];
  const direction = inward ? -1 : 1;

  for (let it = 0; it < iter; it++) {
    const newPoints: Point[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      const a = p1;
      const b = { x: p1.x + dx / 3, y: p1.y + dy / 3 };
      const d = { x: p1.x + (2 * dx) / 3, y: p1.y + (2 * dy) / 3 };

      const midX = (b.x + d.x) / 2;
      const midY = (b.y + d.y) / 2;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      const height = (Math.sqrt(3) / 6) * segLen;

      const perpX = segLen > 0 ? -dy / segLen : 0;
      const perpY = segLen > 0 ? dx / segLen : 0;

      const c = {
        x: midX + direction * height * perpX,
        y: midY + direction * height * perpY,
      };

      newPoints.push(a, b, c, d);
    }
    newPoints.push(points[points.length - 1]);
    points = newPoints;
  }

  // Normalize to fit within circle
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  let circleCenterX = (minX + maxX) / 2;
  let circleCenterY = (minY + maxY) / 2;

  for (let i = 0; i < 100; i++) {
    let maxDist = 0;
    let farthestX = circleCenterX;
    let farthestY = circleCenterY;

    for (const p of points) {
      const dx = p.x - circleCenterX;
      const dy = p.y - circleCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) {
        maxDist = dist;
        farthestX = p.x;
        farthestY = p.y;
      }
    }

    const step = 0.01;
    circleCenterX += step * (farthestX - circleCenterX);
    circleCenterY += step * (farthestY - circleCenterY);
  }

  let maxRadius = 0;
  for (const p of points) {
    const dx = p.x - circleCenterX;
    const dy = p.y - circleCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxRadius) maxRadius = dist;
  }

  const targetRadius = 0.45;
  const scale = maxRadius > 0 ? targetRadius / maxRadius : 1;
  const centerX = 0.5;
  const centerY = 0.5;

  return points.map((p) => ({
    x: centerX + (p.x - circleCenterX) * scale,
    y: centerY + (p.y - circleCenterY) * scale,
  }));
}

// ============================================================================
// Dragon Curve Generation
// ============================================================================

function generateDragonCurve(iter: number): Point[] {
  let turns: boolean[] = [];

  for (let i = 0; i < iter; i++) {
    const flippedReversed = [...turns].reverse().map((t) => !t);
    turns = [...turns, true, ...flippedReversed];
  }

  const points: Point[] = [];
  let x = 0;
  let y = 0;
  let angle = 0;

  points.push({ x, y });

  x += Math.cos((angle * Math.PI) / 180);
  y += Math.sin((angle * Math.PI) / 180);
  points.push({ x, y });

  for (const turnLeft of turns) {
    angle += turnLeft ? -90 : 90;
    x += Math.cos((angle * Math.PI) / 180);
    y += Math.sin((angle * Math.PI) / 180);
    points.push({ x, y });
  }

  return normalizePoints(points);
}

// ============================================================================
// Hilbert Curve Generation
// ============================================================================

function generateHilbertCurve(iter: number): Point[] {
  const forward = () => "F";
  const turn = (angle: number) => (angle > 0 ? "+" : "-");

  const hilbertA = (level: number, angle: number): string => {
    if (level === 0) return "";
    return (
      turn(-angle) +
      hilbertB(level - 1, -angle) +
      forward() +
      turn(angle) +
      hilbertA(level - 1, angle) +
      forward() +
      hilbertA(level - 1, angle) +
      turn(angle) +
      forward() +
      hilbertB(level - 1, -angle) +
      turn(-angle)
    );
  };

  const hilbertB = (level: number, angle: number): string => {
    if (level === 0) return "";
    return (
      turn(angle) +
      hilbertA(level - 1, -angle) +
      forward() +
      turn(-angle) +
      hilbertB(level - 1, angle) +
      forward() +
      hilbertB(level - 1, angle) +
      turn(-angle) +
      forward() +
      hilbertA(level - 1, -angle) +
      turn(angle)
    );
  };

  const instructions = hilbertA(iter, 90);
  return executeInstructions(instructions, 90);
}

// ============================================================================
// Lévy C Curve Generation
// ============================================================================

function generateLevyCurve(iter: number): Point[] {
  let points: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ];

  for (let it = 0; it < iter; it++) {
    const newPoints: Point[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

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

  return normalizePoints(points);
}

// ============================================================================
// Sierpinski Triangle Arrowhead Curve Generation
// ============================================================================

function generateSierpinskiCurve(iter: number): Point[] {
  const sierpinskiA = (level: number): string => {
    if (level === 0) return "F";
    return (
      sierpinskiB(level - 1) +
      "-" +
      sierpinskiA(level - 1) +
      "-" +
      sierpinskiB(level - 1)
    );
  };

  const sierpinskiB = (level: number): string => {
    if (level === 0) return "F";
    return (
      sierpinskiA(level - 1) +
      "+" +
      sierpinskiB(level - 1) +
      "+" +
      sierpinskiA(level - 1)
    );
  };

  const instructions = sierpinskiA(iter);
  return executeInstructions(instructions, 60);
}

// ============================================================================
// Peano Curve Generation
// ============================================================================

function generatePeanoCurve(iter: number): Point[] {
  const peanoA = (level: number): string => {
    if (level === 0) return "F";
    const a = peanoA(level - 1);
    const b = peanoB(level - 1);
    return a + "-" + b + "-" + a + "+" + "F" + "+" + a + "-" + b + "-" + a;
  };

  const peanoB = (level: number): string => {
    if (level === 0) return "F";
    const a = peanoA(level - 1);
    const b = peanoB(level - 1);
    return b + "+" + a + "+" + b + "-" + "F" + "-" + b + "+" + a + "+" + b;
  };

  const instructions = peanoA(iter);
  return executeInstructions(instructions, 90);
}

// ============================================================================
// Gosper Curve Generation
// ============================================================================

function generateGosperCurve(iter: number): Point[] {
  const gosperA = (level: number): string => {
    if (level === 0) return "F";
    const a = gosperA(level - 1);
    const b = gosperB(level - 1);
    return (
      a + "-" + b + "-" + "-" + b + "+" + a + "+" + "+" + a + a + "+" + b + "-"
    );
  };

  const gosperB = (level: number): string => {
    if (level === 0) return "F";
    const a = gosperA(level - 1);
    const b = gosperB(level - 1);
    return (
      "+" + a + "-" + b + b + "-" + "-" + b + "-" + a + "+" + "+" + a + "+" + b
    );
  };

  const instructions = gosperA(iter);
  return executeInstructions(instructions, 60);
}

// ============================================================================
// Helper Functions
// ============================================================================

function executeInstructions(instructions: string, turnAngle: number): Point[] {
  const points: Point[] = [];
  let x = 0;
  let y = 0;
  let dir = 0;

  points.push({ x, y });

  for (const cmd of instructions) {
    if (cmd === "F") {
      const rad = (dir * Math.PI) / 180;
      x += Math.cos(rad);
      y += Math.sin(rad);
      points.push({ x, y });
    } else if (cmd === "+") {
      dir = (dir + turnAngle) % 360;
    } else if (cmd === "-") {
      dir = (dir - turnAngle + 360) % 360;
    }
  }

  return normalizePoints(points);
}

function normalizePoints(points: Point[]): Point[] {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  const scale = 0.8 / Math.max(width, height);
  const centerX = 0.5;
  const centerY = 0.5;

  return points.map((p) => ({
    x: centerX + (p.x - (minX + maxX) / 2) * scale,
    y: centerY + (p.y - (minY + maxY) / 2) * scale,
  }));
}

// ============================================================================
// Mandelbrot and Julia Set Generation (Multi-Band Contours)
// ============================================================================

/**
 * Parse a hex color string to RGB components
 */
function parseHexColor(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/**
 * Linearly interpolate between two RGB colors and return as hex
 */
function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number,
): string {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Generate N band colors from a gradient or solid fill.
 * Colors go from outermost band (fastest escape) to innermost (near set boundary).
 */
function generateBandColors(
  gradient: string[] | null,
  fill: string,
  numBands: number,
): string[] {
  const colors: string[] = [];

  if (gradient && gradient.length >= 2) {
    // Interpolate evenly along the multi-stop gradient
    for (let i = 0; i < numBands; i++) {
      const t = numBands > 1 ? i / (numBands - 1) : 0;
      const scaledT = t * (gradient.length - 1);
      const idx = Math.min(Math.floor(scaledT), gradient.length - 2);
      const localT = scaledT - idx;
      const c1 = parseHexColor(gradient[idx]);
      const c2 = parseHexColor(gradient[idx + 1]);
      colors.push(lerpColor(c1, c2, localT));
    }
  } else {
    // Solid fill: create shades from a lighter version to the full fill color
    const fillHex =
      fill === "none" || fill === "transparent" ? "#000000" : fill;
    const fillRgb = parseHexColor(fillHex);
    const light: [number, number, number] = [
      Math.min(255, fillRgb[0] + Math.round((255 - fillRgb[0]) * 0.85)),
      Math.min(255, fillRgb[1] + Math.round((255 - fillRgb[1]) * 0.85)),
      Math.min(255, fillRgb[2] + Math.round((255 - fillRgb[2]) * 0.85)),
    ];
    for (let i = 0; i < numBands; i++) {
      const t = numBands > 1 ? i / (numBands - 1) : 1;
      colors.push(lerpColor(light, fillRgb, t));
    }
  }

  return colors;
}

/**
 * Calculate escape time for a point in the Mandelbrot set.
 * Includes cardioid and period-2 bulb optimization.
 * Uses smooth (continuous) iteration count for better contour quality.
 */
function mandelbrotEscape(cx: number, cy: number, maxIter: number): number {
  // Cardioid check: skip iteration for points inside the main cardioid
  const q = (cx - 0.25) * (cx - 0.25) + cy * cy;
  if (q * (q + (cx - 0.25)) <= 0.25 * cy * cy) {
    return maxIter;
  }

  // Period-2 bulb check
  if ((cx + 1) * (cx + 1) + cy * cy <= 0.0625) {
    return maxIter;
  }

  let x = 0;
  let y = 0;
  let x2 = 0;
  let y2 = 0;
  let iter = 0;

  // Optimized escape loop (3 multiplications per iteration)
  while (x2 + y2 <= 4 && iter < maxIter) {
    y = 2 * x * y + cy;
    x = x2 - y2 + cx;
    x2 = x * x;
    y2 = y * y;
    iter++;
  }

  // Smooth (continuous) iteration count for sub-integer precision contours
  if (iter < maxIter) {
    const log_zn = Math.log(x2 + y2) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    return iter + 1 - nu;
  }
  return maxIter;
}

/**
 * Calculate escape time for a point in the Julia set.
 * Uses smooth iteration count for better contour quality.
 */
function juliaEscape(
  zx: number,
  zy: number,
  cx: number,
  cy: number,
  maxIter: number,
): number {
  let x = zx;
  let y = zy;
  let x2 = x * x;
  let y2 = y * y;
  let iter = 0;

  while (x2 + y2 <= 4 && iter < maxIter) {
    y = 2 * x * y + cy;
    x = x2 - y2 + cx;
    x2 = x * x;
    y2 = y * y;
    iter++;
  }

  // Smooth iteration count
  if (iter < maxIter) {
    const log_zn = Math.log(x2 + y2) / 2;
    const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
    return iter + 1 - nu;
  }
  return maxIter;
}

/**
 * Pad an escape-time grid with zeros around the border.
 * This ensures ALL marching-squares contours form closed loops,
 * since the zero border guarantees no contour reaches the grid edge.
 */
function padGrid(grid: number[][]): number[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const padded: number[][] = [];

  padded.push(new Array(cols + 2).fill(0));
  for (const row of grid) {
    padded.push([0, ...row, 0]);
  }
  padded.push(new Array(cols + 2).fill(0));

  return padded;
}

/**
 * Compute escape time grid for Mandelbrot
 */
function computeMandelbrotGrid(
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
 * Compute escape time grid for Julia
 */
function computeJuliaGrid(
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
    0: [],
    15: [],
    1: [[3, 0]],
    14: [[3, 0]],
    2: [[0, 1]],
    13: [[0, 1]],
    3: [[3, 1]],
    12: [[3, 1]],
    4: [[1, 2]],
    11: [[1, 2]],
    5: [
      [3, 0],
      [1, 2],
    ],
    10: [
      [0, 1],
      [2, 3],
    ],
    6: [[0, 2]],
    9: [[0, 2]],
    7: [[3, 2]],
    8: [[3, 2]],
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
        switch (edge) {
          case 0: {
            // Top edge
            const t = (threshold - grid[j][i]) / (grid[j][i + 1] - grid[j][i]);
            return [i + Math.max(0, Math.min(1, t)), j];
          }
          case 1: {
            // Right edge
            const t =
              (threshold - grid[j][i + 1]) /
              (grid[j + 1][i + 1] - grid[j][i + 1]);
            return [i + 1, j + Math.max(0, Math.min(1, t))];
          }
          case 2: {
            // Bottom edge
            const t =
              (threshold - grid[j + 1][i]) /
              (grid[j + 1][i + 1] - grid[j + 1][i]);
            return [i + Math.max(0, Math.min(1, t)), j + 1];
          }
          case 3: {
            // Left edge
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

  const pointKey = (p: [number, number]) =>
    `${p[0].toFixed(6)},${p[1].toFixed(6)}`;

  // Build adjacency map
  const adjacency = new Map<
    string,
    Array<{ segIdx: number; point: [number, number] }>
  >();

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
 * Convert marching-squares contours from a padded grid to SVG path data.
 * The padded grid has 1-cell border of zeros, so grid coordinates are offset by 1.
 * Maps grid coords → normalized [-1,1] → SVG viewport with margin.
 */
function contoursToSVGPath(
  contours: Array<Array<[number, number]>>,
  resolution: number,
  size: number,
  margin: number,
): string {
  const center = size / 2;
  const radius = size / 2 - margin;

  return contours
    .map((contour) => {
      const parts = contour.map((p, i) => {
        // Adjust for padding offset: original data is at [1, resolution+1]
        const nx = ((p[0] - 1) / resolution) * 2 - 1;
        const ny = ((p[1] - 1) / resolution) * 2 - 1;
        const x = center + nx * radius;
        const y = center + ny * radius;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      });
      return parts.join(" ") + " Z";
    })
    .join(" ");
}

function renderMandelbrotSVG(options: MandelbrotOptions): string {
  const {
    size,
    margin,
    bg,
    fill,
    gradient,
    stroke,
    strokeWidth,
    resolution,
    centerX,
    centerY,
    zoom,
    maxIter,
    numBands,
  } = options;

  // Compute escape time grid
  const grid = computeMandelbrotGrid(
    resolution,
    centerX,
    centerY,
    zoom,
    maxIter,
  );

  // Pad the grid with zeros so all contours form closed loops
  const paddedGrid = padGrid(grid);

  // Generate linearly-spaced band thresholds
  const thresholds: number[] = [];
  for (let i = 1; i <= numBands; i++) {
    thresholds.push((i / numBands) * maxIter);
  }

  // Generate per-band colors from the gradient or solid fill
  const bandColors = generateBandColors(gradient, fill, numBands);

  // Build SVG path elements for each band (rendered outer → inner)
  const bandElements: string[] = [];
  for (let b = 0; b < numBands; b++) {
    const contours = marchingSquares(paddedGrid, thresholds[b]);
    if (contours.length === 0) continue;

    const pathData = contoursToSVGPath(contours, resolution, size, margin);
    const color = svgEscape(bandColors[b]);
    const strokeAttr =
      stroke !== "none" && stroke !== "transparent"
        ? ` stroke="${svgEscape(stroke)}" stroke-width="${strokeWidth * 0.5}"`
        : "";
    bandElements.push(
      `  <path d="${pathData}" fill="${color}"${strokeAttr} fill-rule="evenodd" />`,
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <title>Mandelbrot Set</title>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${svgEscape(bg)}" />
${bandElements.join("\n")}
</svg>
`;
}

function renderJuliaSVG(options: JuliaOptions): string {
  const {
    size,
    margin,
    bg,
    fill,
    gradient,
    stroke,
    strokeWidth,
    resolution,
    juliaReal,
    juliaImag,
    centerX,
    centerY,
    zoom,
    maxIter,
    numBands,
  } = options;

  // Compute escape time grid
  const grid = computeJuliaGrid(
    resolution,
    centerX,
    centerY,
    zoom,
    juliaReal,
    juliaImag,
    maxIter,
  );

  // Pad the grid with zeros so all contours form closed loops
  const paddedGrid = padGrid(grid);

  // Generate linearly-spaced band thresholds
  const thresholds: number[] = [];
  for (let i = 1; i <= numBands; i++) {
    thresholds.push((i / numBands) * maxIter);
  }

  // Generate per-band colors
  const bandColors = generateBandColors(gradient, fill, numBands);

  // Build SVG path elements for each band (rendered outer → inner)
  const bandElements: string[] = [];
  for (let b = 0; b < numBands; b++) {
    const contours = marchingSquares(paddedGrid, thresholds[b]);
    if (contours.length === 0) continue;

    const pathData = contoursToSVGPath(contours, resolution, size, margin);
    const color = svgEscape(bandColors[b]);
    const strokeAttr =
      stroke !== "none" && stroke !== "transparent"
        ? ` stroke="${svgEscape(stroke)}" stroke-width="${strokeWidth * 0.5}"`
        : "";
    bandElements.push(
      `  <path d="${pathData}" fill="${color}"${strokeAttr} fill-rule="evenodd" />`,
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <title>Julia Set</title>
  <rect x="0" y="0" width="${size}" height="${size}" fill="${svgEscape(bg)}" />
${bandElements.join("\n")}
</svg>
`;
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Generate an SVG string from fractal options
 */
export function generateFractalSVG(options: GeneratorOptions): string {
  switch (options.type) {
    case "carpet":
      return renderCarpetSVG(options);

    case "koch":
      return renderPathSVG({
        points: generateKochCurve(options.sides, options.iter, options.inward),
        size: options.size,
        margin: options.margin,
        bg: options.bg,
        circleBg: options.circleBg,
        fill: options.fill,
        gradient: options.gradient,
        gradientAngle: options.gradientAngle,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        closePath: true,
        title: "Koch Snowflake",
      });

    case "dragon":
      return renderPathSVG({
        points: generateDragonCurve(options.iter),
        size: options.size,
        margin: options.margin,
        bg: options.bg,
        circleBg: options.circleBg,
        fill: options.fill,
        gradient: options.gradient,
        gradientAngle: options.gradientAngle,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        closePath: false,
        title: "Dragon Curve",
      });

    case "hilbert":
      return renderPathSVG({
        points: generateHilbertCurve(options.iter),
        size: options.size,
        margin: options.margin,
        bg: options.bg,
        circleBg: options.circleBg,
        fill: options.fill,
        gradient: options.gradient,
        gradientAngle: options.gradientAngle,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        closePath: false,
        title: "Hilbert Curve",
      });

    case "levy":
      return renderPathSVG({
        points: generateLevyCurve(options.iter),
        size: options.size,
        margin: options.margin,
        bg: options.bg,
        circleBg: options.circleBg,
        fill: options.fill,
        gradient: options.gradient,
        gradientAngle: options.gradientAngle,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        closePath: false,
        title: "Lévy C Curve",
      });

    case "sierpinski":
      return renderPathSVG({
        points: generateSierpinskiCurve(options.iter),
        size: options.size,
        margin: options.margin,
        bg: options.bg,
        circleBg: options.circleBg,
        fill: options.fill,
        gradient: options.gradient,
        gradientAngle: options.gradientAngle,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        closePath: false,
        title: "Sierpinski Triangle",
      });

    case "peano":
      return renderPathSVG({
        points: generatePeanoCurve(options.iter),
        size: options.size,
        margin: options.margin,
        bg: options.bg,
        circleBg: options.circleBg,
        fill: options.fill,
        gradient: options.gradient,
        gradientAngle: options.gradientAngle,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        closePath: false,
        title: "Peano Curve",
      });

    case "gosper":
      return renderPathSVG({
        points: generateGosperCurve(options.iter),
        size: options.size,
        margin: options.margin,
        bg: options.bg,
        circleBg: options.circleBg,
        fill: options.fill,
        gradient: options.gradient,
        gradientAngle: options.gradientAngle,
        stroke: options.stroke,
        strokeWidth: options.strokeWidth,
        closePath: false,
        title: "Gosper Curve",
      });

    case "mandelbrot":
      return renderMandelbrotSVG(options);

    case "julia":
      return renderJuliaSVG(options);

    default:
      // Fallback for unknown types
      const unknownOptions = options as GeneratorOptions;
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${unknownOptions.size}" height="${unknownOptions.size}" viewBox="0 0 ${unknownOptions.size} ${unknownOptions.size}">
  <title>Unknown Fractal Type</title>
  <rect width="${unknownOptions.size}" height="${unknownOptions.size}" fill="${unknownOptions.bg}" />
</svg>`;
  }
}
