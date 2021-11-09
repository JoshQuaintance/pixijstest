<script>
    import { onMount } from 'svelte';
    import { run, App } from './pixi';
    let el;

    onMount(async () => {
        // import * as PIXI from 'pixi.js'
        // const PIXI = await import('pixi.js');

        run(el);

        window.addEventListener('resize', () => {
            App.app.destroy(true);
            App.app = null;
            App.viewport = null;

            run(el);
        });
    });
</script>

<div class="flex items-center justify-around">
    <div bind:this={el} />
</div>
