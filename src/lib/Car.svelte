<script lang="ts">
    import { onMount } from 'svelte';
    import { Car } from './car';

    let car: Car = new Car();
    let carDiv: HTMLDivElement | undefined;
    onMount(() => {
        car.attach(carDiv);
        setInterval(moveCar, 1);
    });

    function randomSteer() {
        const p = Math.random();
        if (p > 0.3) {
            car.steer(Math.random() - 0.5);
        }
    }

    function randomAccelerate() {
        const p = Math.random();
        if (p > 0.8) {
            car.accelerate();
        } else if (p < 0.2) {
            car.brake();
        }
    }

    function moveCar() {
        randomSteer();
        randomAccelerate();
        car.move();
    }

</script>

<div id="car" bind:this={carDiv}>

</div>

<style scoped>

#car {
    background: red;
    width: 15px;
    height: 10px;
    border-radius: 2px;
}

</style>