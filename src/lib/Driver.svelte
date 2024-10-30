<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type Driver from "./driver";
    import type Road from "./road";

    let element: HTMLDivElement;

    // Random color selection for each car
    const colors = ["red", "blue", "green", "yellow", "purple"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    onMount(() => {
        driver.car.setRoad(roads);
        driver.car.attach(element);
        startMovement();
    });

    function startMovement() {
        const move = () => {
            driver.nextMove(drivers);
            driver.car.setRoad(roads);
            animationId = requestAnimationFrame(move);
        };
        animationId = requestAnimationFrame(move);
    }

    let animationId: number;
    onDestroy(() => cancelAnimationFrame(animationId));

    export let driver: Driver, drivers: Driver[], roads: Road[];
</script>

<div bind:this={element} style={`background: ${color}`} class="car"></div>

<style scoped>
    .car {
        position: absolute;
        width: 15px;
        height: 10px;
        border-radius: 3px;
        top: 0;
    }
</style>
