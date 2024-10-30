<script lang="ts">
	import { onMount } from "svelte";
	import Driver from "./lib/driver";
	import DriverElement from "./lib/Driver.svelte";
	import Road from "./lib/road";
	import type { Vector } from "./lib/vector";
	import { disableDebug, init } from "./lib/debug";
	import { dimensions } from "./lib/consts";

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let drivers: Driver[] = [];
	let roads: Road[] = [];

	onMount(() => {
		ctx = getContext();

		const { handleMouseDown, handleMouseUp } = setupMouseHandler();
		canvas.addEventListener("mousedown", handleMouseDown);
		canvas.addEventListener("mouseup", handleMouseUp);

		createRoad({ x: 100, y: 100 }, { x: 550, y: 900 });
		// createRoad(ctx, { x: 900, y: 550 }, { x: 200, y: 200 });
		createRoad(
			{ x: 900, y: 550 },
			{ x: 200, y: 200 },
			{ x: 500, y: 500 },
			{ x: 100, y: 200 },
		);
		createRoad({ x: 1200, y: 500 }, { x: 100, y: 600 });

		init(ctx, roads, drivers);
		disableDebug();

		for (let i = 0; i < 1; i++) {
			createDriver();
			setTimeout(() => {
				createDriver();
			}, 1000);
		}
	});

	function getContext() {
		const ctx = canvas.getContext("2d");
		if (ctx === null) {
			throw new Error("Could not get 2d context");
		}
		return ctx;
	}

	function setupMouseHandler() {
		let startMouseX: number;
		let startMouseY: number;

		const handleMouseDown = (event: MouseEvent) => {
			startMouseX = event.clientX;
			startMouseY = event.clientY;
		};

		const handleMouseUp = (event: MouseEvent) => {
			const endMouseX = event.clientX;
			const endMouseY = event.clientY;
			createRoad(
				{ x: startMouseX, y: startMouseY },
				{ x: endMouseX, y: endMouseY },
			);
		};

		return { handleMouseDown, handleMouseUp };
	}

	function createRoad(
		start: Vector,
		end: Vector,
		control1?: Vector,
		control2?: Vector,
	) {
		const road = new Road(start, end, control1, control2);
		road.draw(ctx);
		roads = [...roads, road];
	}

	function createDriver() {
		const driver = new Driver();
		drivers = [...drivers, driver];
	}
</script>

<main>
	<div class="container">
		<canvas
			id="canvas"
			width={dimensions.x}
			height={dimensions.y}
			bind:this={canvas}
		>
		</canvas>
		{#each drivers as driver}
			<DriverElement {driver} {drivers} {roads} />
		{/each}
	</div>
</main>

<style scoped>
	canvas {
		position: relative;
		text-align: left;
		margin: 0;
	}
</style>
