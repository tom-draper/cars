<script lang="ts">
	import { onMount } from "svelte";
	import { Driver } from "./driver";
	import { Road } from "./road";
	import type { Vector } from "./vector";
	import { init } from "./debug";

	let environment: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	const drivers: Driver[] = [];
	const roads: Road[] = [];
	onMount(() => {
		const ctx = canvas.getContext("2d");
		if (ctx === null) {
			throw new Error("Could not get 2d context");
		}

		const {handleMouseDown, handleMouseUp} = setupMouseHandler(ctx);
		canvas.addEventListener('mousedown', handleMouseDown)
		canvas.addEventListener('mouseup', handleMouseUp)

		createRoad(ctx, { x: 100, y: 100 }, { x: 550, y: 900 });
		// createRoad(ctx, { x: 900, y: 550 }, { x: 200, y: 200 });
		createRoad(
			ctx,
			{ x: 900, y: 550 },
			{ x: 200, y: 200 },
			{ x: 500, y: 500 },
			{ x: 100, y: 200 },
		);

		init(ctx, roads, drivers);

		for (let i = 0; i < 1; i++) {
			createDriver();
			setTimeout(() => {
				createDriver();
			}, 100);
		}
	});

	function createDriver() {
		const driver = new Driver();

		driver.car.setRoad(roads);

		const element = document.createElement("div");
		driver.car.attach(element);
		environment.appendChild(element);

		drivers.push(driver);

		setInterval(() => {
			driver.nextMove(drivers);
			driver.car.setRoad(roads);
		}, 10);
		return driver;
	}

	function createRoad(
		ctx: CanvasRenderingContext2D,
		start: Vector,
		end: Vector,
		control1: Vector | null = null,
		control2: Vector | null = null,
	) {
		const road = new Road(start, end, control1, control2);
		roads.push(road);
		road.draw(ctx);
	}

	function setupMouseHandler(ctx: CanvasRenderingContext2D) {
		let startMouseX: number;
		let startMouseY: number;

		const handleMouseDown = (event: MouseEvent) => {
			startMouseX = event.clientX;
			startMouseY = event.clientY;
		};

		const padding = 32;
		const handleMouseUp = (event: MouseEvent) => {
			const endMouseX = event.clientX;
			const endMouseY = event.clientY;
			createRoad(
				ctx,
				{ x: startMouseX - padding, y: startMouseY - padding },
				{ x: endMouseX - padding, y: endMouseY - padding },
			);
		};

		return { handleMouseDown, handleMouseUp };
	};
</script>

<div id="environment" bind:this={environment}>
	<canvas
		id="canvas"
		width="800"
		height="800"
		bind:this={canvas}
	>
	</canvas>
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
