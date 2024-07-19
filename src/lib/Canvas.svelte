<script lang="ts">
    import { onMount } from "svelte";
    import { Driver } from "./driver";

    let canvas: HTMLDivElement;
    const drivers: Driver[] = [];
    let driverCount = 0;
    onMount(() => {
        for (let i = 0; i < 10; i++) {
            const driver = createDriver();
            drivers.push(driver);
        }
    });

    
    const getCarColour = (() => {
        const colours = [
            'red',
            'blue',
            'green',
            'yellow',
            'purple',
        ]
        return () => {
            return colours[Math.floor(Math.random() * colours.length)];
        }
    })()

    function createDriver() {
        const driver = new Driver();

        const element = document.createElement("div");
        element.id = `car-${driverCount++}`;
        element.style.background = getCarColour();
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
        /* background-color: red; */
        border-radius: 3px;
    }
</style>
