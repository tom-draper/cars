<script lang="ts">
    import { onMount } from "svelte";
    import { Driver } from "./driver";
    
    let canvas: HTMLDivElement;
    const drivers: Driver[] = [];
    let driverCount = 0;
    onMount(() => {
        for (let i = 0; i < 10; i++) {
            const driver = newDriver();
            drivers.push(driver);
        }
    });
    
    function newDriver() {
        const driver = new Driver();

        const element = document.createElement("div");
        element.id = `car-${driverCount++}`;
        element.classList.add("car");

        driver.car.attach(element);
        canvas.appendChild(element);

        setInterval(() => {
            driver.nextMove();
        }, 1);
        return driver;
    }
</script>

<div id="canvas" bind:this={canvas}></div>

<style>
    :global(.car) {
        position: absolute;
        width: 15px;
        height: 10px;
        background-color: red;
        border-radius: 3px;
    }
</style>
