import type { Driver } from "./driver";
import { addVectors, crossProduct, distanceSquared, dotProduct, magnitude, multiplyVectorByScalar, normalize, subtractVectors, type Vector } from "./vector";
import type { Road } from "./road";
import type { Car } from "./car";
import { setColor, displayLine, displayPoint } from "./debug";

type Move = {
	steer: number;
	accelerate: number;
	brake: number;
}

export class Intelligence {
	static stepSize: number = 0.02;
	static furthestPointRadius: number = 35;
	static targetRoadDistance: number = 20;
	static steerIntensity: number = 0.01;
	static steerTolerance: number = 0.05;

	nextMove(driver: Driver, drivers: Driver[]): Move {
		// Decide next move based on: 
		// - Current velocity
		// - Road layout
		// - Action history
		// - Ability
		// - State
		const steer = this.#towardsNearestRoad(driver.car);
		// if (steer > 0) {
		//     console.log('Steering right');
		// } else if (steer < 0) {
		//     console.log('Steering left');
		// } else {
		//     console.log('No steering');
		// }
		const cars = drivers.map(d => d.car);
		const { accelerate, brake } = this.#controlSpeed(driver.car, cars, 0.3);
		return { steer, accelerate, brake };
	}

	#nearestPointOnRoad(carPosition: Vector, road: Road) {
		if (road.isBezier()) {
			return this.#nearestPointOnBezierLine(carPosition, road.start, road.end, road.control1, road.control2)
		} else {
			return this.#nearestPointOnLineSegment(carPosition, road.start, road.end);
		}
	}

	#nearestPointOnLineSegment(carPosition: Vector, lineStart: Vector, lineEnd: Vector) {
		const AB = subtractVectors(lineEnd, lineStart);
		const AP = subtractVectors(carPosition, lineStart);

		const dotProd = dotProduct(AP, AB);
		const lengthSq = dotProduct(AB, AB);

		let t = dotProd / lengthSq;
		t = Math.max(0, Math.min(1, t));  // Clamping t to the line segment

		const closestPoint = addVectors(lineStart, multiplyVectorByScalar(AB, t));
		return closestPoint;
	}

	#nearestPointOnBezierLine(carPosition: Vector, lineStart: Vector, lineEnd: Vector, control1: Vector, control2: Vector) {
		// You would typically use a numerical method to minimize the distance,
		// such as Newton's method or a simple optimization loop.
		const best: { position: Vector | null, distance: number } = {
			position: null,
			distance: Infinity
		}

		for (let t = 0; t <= 1; t += Intelligence.stepSize) {
			const pointOnCurve = this.#bezierPoint(t, lineStart, lineEnd, control1, control2);
			const distance = distanceSquared(pointOnCurve, carPosition);
			if (distance < best.distance) {
				best.distance = distance;
				best.position = pointOnCurve;
			}
		}

		return best.position;
	}

	#bezierPoint(t: number, lineStart: Vector, lineEnd: Vector, control1: Vector, control2: Vector) {
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

	#towardsNearestRoad(car: Car) {
		const road = car.road;
		if (road === null) {
			console.log(`Car ${car.id}: Road is null`)
			return 0;
		}

		const { position, directionVector } = car;

		const nearestPoint = this.#nearestPointOnRoad(position, road);
		if (nearestPoint === null) {
			return 0;
		}

		setColor('red');
		displayPoint(nearestPoint);

		const distanceToClosestPoint = magnitude(subtractVectors(nearestPoint, position));

		const targetPoint = distanceToClosestPoint < Intelligence.targetRoadDistance ?
			this.#furthestPointWithinRadiusOnRoad(road, position, directionVector, Intelligence.furthestPointRadius) :
			nearestPoint;

		setColor('green');
		displayLine(position, targetPoint);

		const shortestPath = subtractVectors(targetPoint, position);

		const steerValue = crossProduct(directionVector, shortestPath);
		if (Math.abs(steerValue) < Intelligence.steerTolerance) {
			return 0;
		}

		return steerValue < 0 ? -Intelligence.steerIntensity : Intelligence.steerIntensity;
	}

	#furthestPointWithinRadiusOnRoad(road: Road, position: Vector, direction: Vector, radius: number): Vector {
		const AB = subtractVectors(road.end, road.start);
		const directionNormalized = normalize(direction);

		const furthestPoint: { position: Vector, distance: number } = {
			position,
			distance: 0
		};

		// Sample along the road with a larger step size for better performance
		for (let t = 0; t <= 1; t += Intelligence.stepSize) {
			let pointOnRoad: Vector;
			if (road.isBezier()) {
				pointOnRoad = this.#bezierPoint(t, road.start, road.end, road.control1, road.control2)
			} else {
				pointOnRoad = addVectors(road.start, multiplyVectorByScalar(AB, t));
			}
			// const pointOnRoad = addVectors(start, multiplyVectorByScalar(AB, t));
			const vectorToPoint = subtractVectors(pointOnRoad, position);

			// Skip if the point is outside the radius
			if (magnitude(vectorToPoint) > radius) {
				continue;
			}
			// Skip if the point is in the opposite direction to the car
			if (dotProduct(directionNormalized, vectorToPoint) <= 0) {
				continue;
			}

			const distance = magnitude(vectorToPoint);

			// Update furthest point if this point is further
			if (distance > furthestPoint.distance) {
				furthestPoint.distance = distance;
				furthestPoint.position = pointOnRoad;
			}
		}

		return furthestPoint.position;
	}

	#controlSpeed(car: Car, cars: Car[], speedLimit: number) {
		if (this.#headingTowardsOtherDrivers(car, cars)) {
			console.log(`Car ${car.id} braking to avoid crash`)
			return { accelerate: 0, brake: 10 };
		}

		if (Math.random() < 0.1) {
			return { accelerate: 0, brake: 5 };
		}

		if (car.velocity > speedLimit) {
			return { accelerate: 0, brake: .3 };
		} else if (car.velocity < speedLimit) {
			return { accelerate: .5, brake: 0 };
		}
		return { accelerate: 0, brake: 0 };
	}

	#headingTowardsOtherDrivers(car: Car, cars: Car[]) {
		for (const otherCar of cars) {
			if (otherCar.id === car.id) {
				continue;
			}
			const vectorToDriver = subtractVectors(otherCar.position, car.position);
			const distance = magnitude(vectorToDriver);
			if (distance < 30 && dotProduct(car.directionVector, vectorToDriver) > 0) {
				return true;
			}
		}
		return false;
	}
}
