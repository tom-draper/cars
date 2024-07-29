import type { Driver } from "./driver";
import { addVectors, crossProduct, dotProduct, magnitude, multiplyVectorByScalar, normalize, subtractVectors, type Vector } from "./vector";
import type { Road } from "./road";
import type { Car } from "./car";

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
        const {accelerate, brake} = this.#controlSpeed(driver.car, cars, 0.3);
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
    
    #towardsNearestRoad(car: Car) {
        const road = car.road;
        if (road === null) {
            return 0;
        }

        const position = car.position;
        const direction = car.directionVector;

        const closestPoint = this.#closestPointOnLineSegment(position, road.start, road.end);
        const distanceToClosestPoint = magnitude(subtractVectors(closestPoint, position));

        const targetPoint = distanceToClosestPoint < 20 ? 
            this.#furthestPointWithinRadius(road, position, direction, 35) : 
            closestPoint;

        const shortestPath = subtractVectors(targetPoint, position);

        const steerValue = crossProduct(direction, shortestPath);
        const tolerance = 0.05;
        if (Math.abs(steerValue) < tolerance) {
            return 0;
        }

        const steerIntensity = 0.01
        return steerValue < 0 ? -steerIntensity : steerIntensity;
    }

    // #furthestPointWithinRadius(road: Road, position: Vector, direction: Vector, radius: number): Vector {
    //     const AB = subtractVectors(road.end, road.start);
    //     const points = [];

    //     // Check points along the road in both directions within the given radius
    //     for (let t = 0; t <= 1; t += 0.01) {
    //         const pointOnRoad = {
    //             x: road.start.x + AB.x * t,
    //             y: road.start.y + AB.y * t
    //         };
    //         const vectorToPoint = subtractVectors(pointOnRoad, position);
    //         if (magnitude(vectorToPoint) <= radius && dotProduct(direction, vectorToPoint) > 0) {
    //             points.push(pointOnRoad);
    //         }
    //     }

    //     // Find the furthest point within the radius and in the direction of the car
    //     let furthestPoint = position;
    //     let maxDistance = 0;

    //     for (const point of points) {
    //         const distance = magnitude(subtractVectors(point, position));
    //         if (distance > maxDistance) {
    //             maxDistance = distance;
    //             furthestPoint = point;
    //         }
    //     }

    //     return furthestPoint;
    // }

    #furthestPointWithinRadius(road: Road, position: Vector, direction: Vector, radius: number): Vector {
        const AB = subtractVectors(road.end, road.start);
        const directionNormalized = normalize(direction);

        const furthestPoint: {position: Vector, distance: number} = {position, distance: 0};

        // Sample along the road with a larger step size for better performance
        for (let t = 0; t <= 1; t += 0.02) {
            const pointOnRoad = addVectors(road.start, multiplyVectorByScalar(AB, t));
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

        // console.log(furthestPoint.distance);

        return furthestPoint.position;
    }

    // #furthestPointWithinRadius(road: Road, position: Vector, direction: Vector, radius: number): Vector {
    //     const AB = subtractVectors(road.end, road.start);
    //     const directionNormalized = normalize(direction);

    //     // Compute the projection of the car's position onto the road line segment
    //     const AP = subtractVectors(position, road.start);
    //     const ABLengthSquared = dotProduct(AB, AB);
    //     const projection = dotProduct(AP, AB) / ABLengthSquared;
    //     const clampedProjection = Math.max(0, Math.min(1, projection));

    //     // Calculate the closest point on the road segment to the car
    //     const closestPoint = addVectors(road.start, multiplyVectorByScalar(AB, clampedProjection));

    //     // Check if the closest point is within the radius and in the direction of the car
    //     const vectorToClosestPoint = subtractVectors(closestPoint, position);
    //     if (magnitude(vectorToClosestPoint) > radius) {
    //         // If the closest point is outside the radius, we need to find a point on the circle edge
    //         // Compute the furthest point along the direction vector within the circle
    //         const distance = radius; // We are looking at the radius length
    //         const furthestPoint = addVectors(position, multiplyVectorByScalar(directionNormalized, distance));

    //         return furthestPoint;
    //     } else {
    //         return closestPoint;
    //     }
    // }

    #controlSpeed(car: Car, cars: Car[], speedLimit: number) {
        if (this.#headingTowardsOtherDrivers(car, cars)) {
            console.log(car.id.toString() + " braking to avoid crash")
            return {accelerate: 0, brake: 10};
        }

        if (Math.random() < 0.1) {
            return {accelerate: 0, brake: 5};
        }

        if (car.velocity > speedLimit) {
            return {accelerate: 0, brake: .3};
        } else if (car.velocity < speedLimit) {
            return {accelerate: .5, brake: 0};
        }
        return {accelerate: 0, brake: 0};
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
