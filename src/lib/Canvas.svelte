<script lang="ts">
    import { onMount } from "svelte";
    import { Car } from "./car";

    function createCar() {
        const car = new Car();

        const element = document.createElement("div");
        element.id = `car-${carCount++}`;
        element.classList.add("car");

        car.attach(element);
        canvas.appendChild(element);

        setInterval(() => {
            moveCar(car);
        }, 1);
        return new Car();
    }

    let canvas: HTMLDivElement;
    let cars: Car[] = [];
    let carCount = 0;
    onMount(() => {
        for (let i = 0; i < 500; i++) {
            const car = createCar();
            cars.push(car);
        }
    });

    function randomSteer(car: Car) {
        const p = Math.random();
        if (p > 0.3) {
            car.steer(Math.random() - 0.5);
        }
    }

    function randomAccelerate(car: Car) {
        const p = Math.random();
        if (p > 0.8) {
            car.accelerate();
        } else if (p < 0.2) {
            car.brake();
        }
    }

    function moveCar(car: Car) {
        randomSteer(car);
        randomAccelerate(car);
        car.move();
    }
</script>

<div id="canvas" bind:this={canvas}></div>

<style>
</style>
