import type { Driver } from "./driver";
import { addVectors, crossProduct, dotProduct, magnitude, multiplyVectorByScalar, normalize, subtractVectors, type Vector } from "./vector";
import type { Road } from "./road";
import type { Car } from "./car";
import Debug from "./debug";

type Move = {
    steer: number;
    accelerate: number;
    brake: number;
}

export class Intelligence {
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

    #closestPointOnRoad(carPosition: Vector, road: Road) {
        if (road.isBezier()) {
            return this.#closestPointOnBezierLine(carPosition, road.start, road.end, road.control1, road.control2)
        } else {
            return this.#closestPointOnLineSegment(carPosition, road.start, road.end);
        }
    }

    #closestPointOnLineSegment(carPosition: Vector, lineStart: Vector, lineEnd: Vector) {
        const AB = subtractVectors(lineEnd, lineStart);
        const AP = subtractVectors(carPosition, lineStart);

        const dotProd = dotProduct(AP, AB);
        const lengthSq = dotProduct(AB, AB);

        let t = dotProd / lengthSq;
        t = Math.max(0, Math.min(1, t));  // Clamping t to the line segment

        return addVectors(lineStart, multiplyVectorByScalar(AB, t));
    }

    #closestPointOnBezierLine(carPosition: Vector, lineStart: Vector, lineEnd: Vector, control1: Vector, control2: Vector) {
        // You would typically use a numerical method to minimize the distance,
        // such as Newton's method or a simple optimization loop.

        const best: { t: number, distance: number } = {
            t: 0,
            distance: Infinity
        }

        for (let t = 0; t <= 1; t += 0.02) {
            const pointOnCurve = this.#bezierPoint(t, lineStart, lineEnd, control1, control2);
            const distance = this.#distanceSquared(pointOnCurve, carPosition);
            if (distance < best.distance) {
                best.distance = distance;
                best.t = t;
            }
        }

        return this.#bezierPoint(best.t, lineStart, lineEnd, control1, control2);
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

    #distanceSquared(point1: Vector, point2: Vector) {
        return (point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2;
    }

    #towardsNearestRoad(car: Car) {
        const road = car.road;
        if (road === null) {
            console.log(`Road is null for car ${car.id}`)
            return 0;
        }

        const { position, directionVector } = car;

        const closestPoint = this.#closestPointOnRoad(position, road);

        Debug.color = 'red';
        Debug.displayPoint(closestPoint);

        const distanceToClosestPoint = magnitude(subtractVectors(closestPoint, position));

        const targetPoint = distanceToClosestPoint < 20 ?
            this.#furthestPointWithinRadiusOnRoad(road, position, directionVector, 35) :
            closestPoint;

        Debug.color = 'green';
        Debug.displayLine(position, targetPoint);

        const shortestPath = subtractVectors(targetPoint, position);

        const steerValue = crossProduct(directionVector, shortestPath);
        const tolerance = 0.05;
        if (Math.abs(steerValue) < tolerance) {
            return 0;
        }

        const steerIntensity = 0.01
        return steerValue < 0 ? -steerIntensity : steerIntensity;
    }

    #furthestPointWithinRadiusOnRoad(road: Road, position: Vector, direction: Vector, radius: number): Vector {
        const AB = subtractVectors(road.end, road.start);
        const directionNormalized = normalize(direction);

        const furthestPoint: { position: Vector, distance: number } = { position, distance: 0 };

        // Sample along the road with a larger step size for better performance
        for (let t = 0; t <= 1; t += 0.02) {
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
            console.log(car.id.toString() + " braking to avoid crash")
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
