<script lang="ts">
    import { onMount } from "svelte";
    import { Driver } from "./driver";
    import { Road } from "./road";
    import type { Vector } from "./vector";

    let environment: HTMLDivElement;
    let canvas: HTMLCanvasElement;
    const drivers: Driver[] = [];
    const roads: Road[] = [];
    onMount(() => {
        const ctx = canvas.getContext("2d");
        if (ctx === null) {
            throw new Error("Could not get 2d context");
        }
        createRoad({ x: 100, y: 100 }, { x: 550, y: 900 }, ctx);

        for (let i = 0; i < 1; i++) {
            createDriver();
        }
    });

    const getCarColour = (() => {
        const colours = ["red", "blue", "green", "yellow", "purple"];
        return () => {
            return colours[Math.floor(Math.random() * colours.length)];
        };
    })();

    function createDriver() {
        const driver = new Driver();

        const element = document.createElement("div");
        element.id = `car-${drivers.length}`;
        element.style.background = getCarColour();
        element.classList.add("car");

        driver.car.road = roads[0];
        driver.car.attach(element);
        environment.appendChild(element);

        drivers.push(driver);

        setInterval(() => {
            driver.nextMove();
        }, 10);
        return driver;
    }

    function createRoad(
        start: Vector,
        end: Vector,
        ctx: CanvasRenderingContext2D,
    ) {
        const road = new Road(start, end);
        roads.push(road);
        road.draw(ctx);
    }
</script>

<div id="environment" bind:this={environment}>
    <canvas id="canvas" width="800" height="800" bind:this={canvas}> </canvas>
</div>

<style scoped>
    :global(.car) {
        position: absolute;
        width: 15px;
        height: 10px;
        border-radius: 3px;
        top: 0;
    }
    #environment {
        position: relative;
        text-align: left;
    }
    #canvas {
        margin: 0;
    }
</style>
