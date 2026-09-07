export interface Point {
  x: number;
  y: number;
}

export type EasingFunction = (t: number) => number;

/**
 * Standard cubic easing (ease-in-out)
 */
export const easeInOutCubic: EasingFunction = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Natural human acceleration and deceleration curve with subtle smooth plateau
 */
export const naturalHumanEase: EasingFunction = (t: number): number => {
  // Modified smootherstep
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const linearEase: EasingFunction = (t: number): number => t;

/**
 * Evaluates a cubic bezier curve at parameter t (0 <= t <= 1)
 */
export function cubicBezierPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
  };
}

/**
 * Generates natural human-like control points for a smooth curved trajectory between start and end.
 */
export function generateNaturalTrajectory(
  start: Point,
  end: Point,
  deterministic = false
): [Point, Point] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 10) {
    return [
      { x: start.x + dx * 0.3, y: start.y + dy * 0.3 },
      { x: start.x + dx * 0.7, y: start.y + dy * 0.7 }
    ];
  }

  // Calculate perpendicular normal
  const nx = -dy / dist;
  const ny = dx / dist;

  // Curvature intensity scales with distance, up to a natural limit
  const maxArc = Math.min(dist * 0.25, 80);
  const factor = deterministic ? 0.6 : 0.4 + Math.random() * 0.6;
  // Slight random or alternating direction
  const direction = deterministic ? 1 : Math.random() > 0.5 ? 1 : -1;

  const arc1 = maxArc * factor * direction;
  const arc2 = maxArc * (factor * 0.7) * direction;

  const cp1: Point = {
    x: start.x + dx * 0.25 + nx * arc1,
    y: start.y + dy * 0.25 + ny * arc1
  };

  const cp2: Point = {
    x: start.x + dx * 0.75 + nx * arc2,
    y: start.y + dy * 0.75 + ny * arc2
  };

  return [cp1, cp2];
}
