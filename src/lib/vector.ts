
export type Vector = {
    x: number;
    y: number;
}

export function dotProduct(v1: Vector, v2: Vector) {
  return v1.x * v2.x + v1.y * v2.y;
}

export function subtractVectors(v1: Vector, v2: Vector) {
  return { x: v1.x - v2.x, y: v1.y - v2.y };
}

export function multiplyVectorByScalar(v: Vector, scalar: number) {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function addVectors(v1: Vector, v2: Vector) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function magnitude(v: Vector) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v: Vector) {
  const mag = magnitude(v);
  return { x: v.x / mag, y: v.y / mag };
}

export function angleBetweenVectors(v1: Vector, v2: Vector) {
  const dotProd = dotProduct(v1, v2);
  const magV1 = magnitude(v1);
  const magV2 = magnitude(v2);
  const cosTheta = dotProd / (magV1 * magV2);
  return Math.acos(cosTheta); // Returns the angle in radians
}

export function rotateVector(v: Vector, angle: number) {
  const cosTheta = Math.cos(angle);
  const sinTheta = Math.sin(angle);
  return {
    x: v.x * cosTheta - v.y * sinTheta,
    y: v.x * sinTheta + v.y * cosTheta
  };
}

export function vectorToRadians(v: Vector) {
  return Math.atan2(v.y, v.x);
}