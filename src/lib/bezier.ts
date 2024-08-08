import type { Vector } from "./vector";

export function bezierPoint(t: number, lineStart: Vector, lineEnd: Vector, control1: Vector, control2: Vector) {
    // Cubic Bezier curve formula
    const x = Math.pow(1 - t, 3) * lineStart.x +
        3 * Math.pow(1 - t, 2) * t * control1.x +
        3 * (1 - t) * Math.pow(t, 2) * control2.x +
        Math.pow(t, 3) * lineEnd.x;

    const y = Math.pow(1 - t, 3) * lineStart.y +
        3 * Math.pow(1 - t, 2) * t * control1.y +
        3 * (1 - t) * Math.pow(t, 2) * control2.y +
        Math.pow(t, 3) * lineEnd.y;

    return { x, y };
}