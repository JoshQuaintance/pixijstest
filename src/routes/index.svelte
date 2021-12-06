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

    <!-- <div
        class="fixed bottom-0 h-16 w-[50%] z-[100] flex flex-col justify-center items-center rounded-t-lg bg-cameo-pink-lightest "
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            class="bi bi-chevron-up fixed bottom-[4.5rem] z-[100] opacity-50 cursor-pointer transform-gpu rotate-180"
            viewBox="0 0 16 16"
        >
            <path
                fill-rule="evenodd"
                d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
            />
        </svg>

        <p>Test</p>
    </div> -->
</div>
