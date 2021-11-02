<script>
	import { onMount } from 'svelte';
	import { run } from './pixi';
	let el;

	onMount(async () => {
		// import * as PIXI from 'pixi.js'	
		// const PIXI = await import('pixi.js');

		run(el);
	});
</script>

<div class="flex items-center justify-around">
	<div bind:this={el} />
</div>
