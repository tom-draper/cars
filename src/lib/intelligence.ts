import Driver, { ActionType, type ActionHistoryEpoch } from "./driver";
import { addVectors, crossProduct, distanceSquared, dotProduct, magnitude, multiplyVectorByScalar, normalize, subtractVectors, type Vector } from "./vector";
import Road from "./road";
import Car from "./car";
import { setColor, displayLine, displayPoint } from "./debug";
import { bezierPoint } from "./bezier";
import type { Action } from "svelte/action";

type Move = {
	steer: number;
	accelerate: number;
	brake: number;
}

export default class Intelligence {
	static stepSize: number = 0.02;
	static furthestPointRadius: number = 35;
	static targetRoadDistance: number = 20;
	static steerIntensity: number = 0.01;
	static steerTolerance: number = 0.001;

	nextMove(driver: Driver, drivers: Driver[]) {
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
		const { accelerate, brake } = this.#controlSpeed(driver, drivers, 0.3);
		const move: Move = { steer, accelerate, brake }
		return move;
	}

	#nearestPointOnRoad(carPosition: Vector, road: Road) {
		if (road.isBezier()) {
			return this.#nearestPointOnBezierLine(carPosition, road.start, road.end, road.control1, road.control2)
		} else {
			return this.#nearestPointOnLineSegment(carPosition, road.start, road.end);
		}
	}

	#nearestPointOnLineSegment(position: Vector, lineStart: Vector, lineEnd: Vector) {
		const AB = subtractVectors(lineEnd, lineStart);
		const AP = subtractVectors(position, lineStart);

		const dotProd = dotProduct(AP, AB);
		const lengthSq = dotProduct(AB, AB);

		let t = dotProd;
		if (lengthSq !== 0) {
			t /= lengthSq;
		}
		t = Math.max(0, Math.min(1, t));  // Clamping t to the line segment

		const closestPoint = addVectors(lineStart, multiplyVectorByScalar(AB, t));
		return closestPoint;
	}

	#nearestPointOnBezierLine(position: Vector, lineStart: Vector, lineEnd: Vector, control1: Vector, control2: Vector) {
		// You would typically use a numerical method to minimize the distance,
		// such as Newton's method or a simple optimization loop.
		const best: { point: Vector | null, distance: number } = {
			point: null,
			distance: Infinity
		}

		for (let t = 0; t <= 1; t += Intelligence.stepSize) {
			const pointOnCurve = bezierPoint(t, lineStart, lineEnd, control1, control2);
			const distance = distanceSquared(pointOnCurve, position);
			if (distance < best.distance) {
				best.distance = distance;
				best.point = pointOnCurve;
			}
		}

		return best.point;
	}

	#towardsNearestRoad(car: Car) {
		const road = car.road;
		if (road === null) {
			console.log(`Car ${car.id}: Road is null`);
			return 0;
		}

		const { position, directionVector } = car;

		const nearestPoint = this.#nearestPointOnRoad(position, road);
		if (nearestPoint === null) {
			return 0;
		}

		setColor('red');
		displayPoint(nearestPoint);

		const distanceToNearestPoint = magnitude(subtractVectors(nearestPoint, position));

		const targetPoint = distanceToNearestPoint < Intelligence.targetRoadDistance ?
			this.#furthestPointWithinRadiusOnRoad(road, position, directionVector, Intelligence.furthestPointRadius) :
			nearestPoint;
		if (targetPoint === null) {
			return 0;
		}

		setColor('green');
		displayLine(position, targetPoint);

		const shortestPath = subtractVectors(targetPoint, position);

		const steerValue = crossProduct(directionVector, shortestPath);
		if (Math.abs(steerValue) < Intelligence.steerTolerance) {
			return 0;
		}

		return steerValue < 0 ? -Intelligence.steerIntensity : Intelligence.steerIntensity;
	}

	#furthestPointWithinRadiusOnRoad(road: Road, position: Vector, direction: Vector, radius: number) {
		const directionNormalized = normalize(direction);

		const best: { point: Vector, distance: number } = {
			point: position,
			distance: 0
		};

		// Sample along the road with a larger step size for better performance
		for (let t = 0; t <= 1; t += Intelligence.stepSize) {
			const pointOnRoad = road.pointOnRoad(t);
			const vectorToPoint = subtractVectors(pointOnRoad, position);

			const distance = magnitude(vectorToPoint);

			// Check if the point is within the radius...
			// and if the point is in the direction of the car...
			// and if the point is the furthest found so far...
			if (
				distance <= radius
				&& dotProduct(directionNormalized, vectorToPoint) > 0
				&& distance > best.distance
			) {
				best.distance = distance;
				best.point = pointOnRoad;
			}
		}

		return best.point;
	}

	#controlSpeed(driver: Driver, drivers: Driver[], speedLimit: number) {
		if (this.#driverStuck(driver)) {
			console.log(`Car ${driver.car.id} is stuck, attempting to reverse`);
			// Check for any cars immediately behind us before reversing...
			if (this.#headingTowardsOtherDrivers(driver, drivers, true)) {
				console.log(`Car ${driver.car.id} is stuck, unable to reverse`);
				return { accelerate: 0, brake: 0 }; // Forced to wait for other cars to move
			}
			return { accelerate: -0.2, brake: 0 };
		}
		
		// Check for braking to avoid crash...
		const reversing = driver.car.velocity < 0;
		if (this.#headingTowardsOtherDrivers(driver, drivers, reversing)) {
			console.log(`Car ${driver.car.id} braking to avoid crash`);
			return { accelerate: 0, brake: 10 };
		}

		// Random braking...
		const p = Math.random();
		if (p < 0.1) {
			return { accelerate: 0, brake: 5 };
		}

		if (driver.car.velocity > speedLimit) {
			return { accelerate: 0, brake: .3 };
		} else if (driver.car.velocity < speedLimit) {
			return { accelerate: 0.5, brake: 0 };
		}
		return { accelerate: 0, brake: 0 };
	}

	#headingTowardsOtherDrivers(driver: Driver, drivers: Driver[], reversing: boolean = false) {
		const car = driver.car;
		const cars = drivers.map(d => d.car);

		const { position, directionVector } = car;

		for (const otherCar of cars) {
			if (otherCar.id === car.id) {
				continue; // Skip if the same car
			}
			const vectorToDriver = subtractVectors(otherCar.position, position);
			const distance = magnitude(vectorToDriver);
			const dp = dotProduct(directionVector, vectorToDriver);
			const inDrivingDirection = reversing ? dp > 0 : dp;
			if (distance < 20 && inDrivingDirection) {
				return true;
			}
		}
		return false;
	}

	#driverStuck(driver: Driver) {
		return driver.car.velocity === 0 && (this.#failingToAccelerate(driver) || this.#continuouslyBraking(driver) || this.#idelling(driver));
	}

	#failingToAccelerate(driver: Driver) {
		let failedAccelerations = 0;
		const maxFailedAccelerations = 5;
		for (let i = 0; i < driver.memory.size; i++) {
			const action = driver.memory.getLastAction(i);
			if (action === undefined) {
				continue;
			}

			// Successful acceleration found
			if (this.#successfulAcceleration(action)) {
				return false;
			}

			// Record failed acceleration
			if (this.#failedAcceleration(action)) {
				failedAccelerations++;
			}

			// Driver is stuck if their last 5 attempts to accelerate failed
			if (failedAccelerations > maxFailedAccelerations) {
				console.log(`Car ${driver.car.id} is failing to accelerate`);
				return true;
			}
		}
		return false;
	}

	#failedAcceleration(action: ActionHistoryEpoch) {
		return action.type === ActionType.Acceleration && action.value > 0 && action.result === 0;
	}
	
	#successfulAcceleration(action: ActionHistoryEpoch) {
		return action.type === ActionType.Acceleration && action.value > 0 && action.result > 0;
	}

	#continuouslyBraking(driver: Driver) {
		for (let i = 0; i < driver.memory.size; i++) {
			const action = driver.memory.getLastAction(i);
			if (action === undefined || !this.#brakingAction(action)) {
				return false;
			}
		}

		console.log(`Car ${driver.car.id} is continuously braking`);
		return true;
	}

	#brakingAction(action: ActionHistoryEpoch) {
		return action.type === ActionType.Acceleration && action.value < 0;
	}

	#idelling(driver: Driver) {
		for (let i = 0; i < driver.memory.size; i++) {
			const action = driver.memory.getLastAction(i);
			if (action === undefined || !this.#idleAction(action)) {
				return false;
			}
		}

		console.log(`Car ${driver.car.id} is idling`);
		return true;
	}

	#idleAction(action: ActionHistoryEpoch) {
		return action.value === 0;
	}
}
