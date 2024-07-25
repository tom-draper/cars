import type { Driver } from "./driver";
import { addVectors, angleBetweenVectors, dotProduct, multiplyVectorByScalar, normalize, rotateVector, subtractVectors, vectorToRadians, type Vector } from "./vector";
import type { Road } from "./road";

type Move = {
    steer: number;
    accelerate: number;
    brake: number;
}

export class Intelligence {
    nextMove(driver: Driver): Move {
        // Decide next move based on: 
        // - Current velocity
        // - Road layout
        // - Action history
        // - Ability
        // - State
        const steer = this.#towardsNearestRoad(driver.car.road, driver.car.position, driver.car.directionVector);
        const accelerate = this.#accelerateToSpeedLimit(driver.car.velocity, 0.3);
        const brake = this.#brakeForSpeedLimit(driver.car.velocity, 0.3);
        return { steer, accelerate, brake};
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

    #shortestPathVector(carPosition: Vector, lineStart: Vector, lineEnd: Vector) {
        const closestPoint = this.#closestPointOnLineSegment(carPosition, lineStart, lineEnd);
        return subtractVectors(closestPoint, carPosition);
    }

    #towardsNearestRoad(road: Road | null, position: Vector, direction: Vector) {
        if (road === null) {
            return 0;
        }

        const shortestPath = this.#shortestPathVector(position, road.start, road.end);
        // const normalizedShortestPath = normalize(shortestPath);
        // const angleToRotate = angleBetweenVectors(direction, normalizedShortestPath);
        const angleToRotate = angleBetweenVectors(direction, shortestPath);
        const tolerance = .1;
        if (Math.abs(angleToRotate) < tolerance) {
            return 0;
        }
        // const newCarDirection = rotateVector(direction, angleToRotate);
        // const theta = vectorToRadians(newCarDirection);
        // const theta = angleBetweenVectors(road.direction, direction);
        // if (angleToRotate > 0 || angleToRotate < 0) {
        //     return angleToRotate;
        // }
        // return 0;

        // console.log(angleToRotate)

        if (angleToRotate < 0) {
            return -.05;
        } else if (angleToRotate > 0) {
            return .05;
        }
        return 0;

        const steerIntensity = .1;
        return angleToRotate < 0 ? -steerIntensity : steerIntensity;

        // Calculate the angle between the car's direction and the road's direction
        // console.log(angle)
        // if (angle < 0) {
        //     return -0.1;
        // } else {
        //     return 0.1;
        // }
    }

    #accelerateToSpeedLimit(currentVelocity: number, speedLimit: number) {
        if (currentVelocity > speedLimit) {
            return 0;
        }
        return .5;
    }

    #brakeForSpeedLimit(currentVelocity: number, speedLimit: number) {
        if (currentVelocity > speedLimit) {
            return .3;
        }
        return 0;
    }
}
