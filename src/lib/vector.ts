
export type Vector = {
	x: number;
	y: number;
}

export function dotProduct(v1: Vector, v2: Vector) {
	return v1.x * v2.x + v1.y * v2.y;
}

export function crossProduct(v1: Vector, v2: Vector) {
	return v1.x * v2.y - v1.y * v2.x;
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
	if (mag === 0) {
		return { x: 0, y: 0 };
	}
	return { x: v.x / mag, y: v.y / mag };
}

export function angleBetweenVectors(v1: Vector, v2: Vector) {
	if (Math.abs(v1.x - v2.x) < Number.EPSILON && Math.abs(v1.y - v2.y) < Number.EPSILON) {
		return 0;
	}
	const magV1 = magnitude(v1);
	const magV2 = magnitude(v2);
	if (magV1 === 0 || magV2 === 0) {
		return 0;
	}
	const dotProd = dotProduct(v1, v2);
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

export function distanceSquared(v1: Vector, v2: Vector) {
	return (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2;
}