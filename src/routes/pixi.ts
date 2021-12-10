import {
    InteractionEvent,
    utils as P_Utils,
    Container as PIXIContainer,
    DisplayObject,
    InteractionManager,
    Rectangle,
} from 'pixi.js';

// Make sure PIXI have enough information so development dev mode works fluently
import '@mszu/pixi-ssr-shim';
import { Application, Sprite, LoaderResource, Graphics } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { percent } from './utils/math';
import Spawner, { checkIfBeyondWorld } from './Spawner';
import Container from './Container';
import { cancelTimeout, executeAfterTimeout } from './utils/timeouts';
import type { DraggingSprite } from './Spawner';
import { compute_rest_props } from 'svelte/internal';

function createApp(): Application {
    return new Application({
        backgroundColor: 0xfaf0f2,
        resizeTo: window,
        autoStart: false,
    });
}

function createSprite(src: string): Sprite {
    if (!src.startsWith('images/')) throw Error('Images for sprite have to be served from images/ in static/images');
    const sprite = Sprite.from(src);
    // sprite.anchor.set(0.5);

    return sprite;
}

/**
 * Class is made so that other files can access the viewport without needing
 * the viewport variable itself as an argument
 */
export class App {
    private static _viewport: Viewport;
    private static _app: Application;
    private static _resources: P_Utils.Dict<LoaderResource>;
    private static _border: Graphics;
    static parentEl: HTMLDivElement;

    static set viewport(vp: Viewport) {
        this._viewport = vp;
    }

    static set app(application: Application) {
        this._app = application;
    }

    static set resources(res: P_Utils.Dict<LoaderResource>) {
        this._resources = res;
    }

    static set border(b: Graphics) {
        this._border = b;
    }

    static get viewport() {
        return this._viewport;
    }

    static get app() {
        return this._app;
    }

    static get resources() {
        return this._resources;
    }

    static get border() {
        return this._border;
    }
}

function loaderProgress(e: { progress: any }) {
    console.log(`Progress: ${e.progress}`);
}

function loaderError(e: { message: string }) {
    alert('Error Loading' + e.message);
}

async function init() {
    const app = App.app;
    app.loader.baseUrl = 'images';
    app.loader.add('rounded_seat', 'seat.svg');

    app.loader.onComplete.add(() => execute());
    app.loader.onError.add(loaderError);

    app.loader.load();

    App.resources = app.loader.resources;
}

export async function run(el: HTMLDivElement) {
    // Initialize app and insert into static class variable
    App.app = createApp();

    App.parentEl = el;

    init();
}

function execute() {
    let mode = 'view';
    const app = App.app;

    App.viewport = new Viewport({
        screenWidth: app.view.width,
        screenHeight: percent(88, app.view.height),
        worldWidth: app.view.width * 3 + 3000,
        worldHeight: app.view.width * 3,
        passiveWheel: false,

        interaction: app.renderer.plugins.interaction,
    });

    const viewport = App.viewport;

    App.parentEl.appendChild(app.view);

    viewport
        .drag({
            // keyToPress: ['ControlLeft', 'ControlRight'],
        })
        .pinch()
        .wheel({})
        .decelerate();
    viewport.clampZoom({ minScale: 0.15, maxScale: 3 });
    viewport.clamp({
        underflow: 'center',
        top: -viewport.worldHeight * 0.016,
        left: -viewport.worldWidth * 0.01,
        bottom: viewport.worldHeight * 1.016,
        right: viewport.worldWidth * 1.01,
    });

    viewport.fit(false, viewport.screenWidth, viewport.screenHeight);
    viewport.moveCenter(viewport.worldWidth / 2, viewport.worldHeight / 2);

    let texture = App.resources.rounded_seat.texture;

    // const cursor = new Graphics();

    // cursor
    //     .lineStyle(2, 0xff0000)
    //     .drawRect(app.view.width / 2 - 9, percent(88, app.view.height) / 2, 20, 2)
    //     .drawRect(app.view.width / 2, percent(88, app.view.height) / 2 - 9, 2, 20);

    // app.stage.addChild(cursor);

    const border = viewport.addChild(new Graphics());
    border.lineStyle(20, 0xff0000).drawRect(0, 0, viewport.worldWidth, viewport.worldHeight);

    App.border = border;

    app.stage.addChild(viewport);

    app.start();

    let seatingContainer = new Container();

    const rect = new Graphics();

    rect.beginFill(0xdea3f8)
        .drawRect(0, percent(88, app.view.height), app.view.width, percent(15, app.view.height))
        .endFill();

    function seatingContainerFunction(container: PIXIContainer, child: DisplayObject) {
        if (!(child instanceof Sprite)) return;

        child.anchor.set(0.5);

        // Make the scale 50% of the rectangle's height divided by the original height
        child.scale.set(percent(50, rect.height) / child.height);

        child.x = container.width / 2;
        child.y = percent(88, app.view.height) + percent(50, percent(12, app.view.height));

        container.addChild(child);
    }

    seatingContainer.addChild(rect);
    const seatSpawner = new Spawner(texture, 'seat');
    const seatSpawnerMode = new Sprite(texture);
    const screenContainer = new Rectangle(0, 0, app.stage.width);

    seatSpawner.sprite.anchor.set(0.5);
    seatSpawner.sprite.scale.set(percent(50, rect.height) / seatSpawner.sprite.height);

    seatingContainer.addChild(seatSpawnerMode, seatingContainerFunction);
    app.stage.addChild(seatingContainer.this);

    seatSpawnerMode.interactive = true;
    seatSpawnerMode.on('pointerdown', (e) => {
        mode = mode == 'build' ? 'view' : 'build';

        if (mode != 'build') {
            seatSpawner.sprite.destroy();
        } else {
            viewport.addChild(seatSpawner.sprite);

            let intManager = new InteractionManager(app.renderer);
            let mouse = intManager.mouse;

            seatSpawner.sprite.x = mouse.global.x != -999999 ? mouse.global.x : viewport.center.x;
            seatSpawner.sprite.y = mouse.global.y != -999999 ? mouse.global.y : viewport.center.y;
            seatSpawner.sprite.alpha = 0.5;

            function highlighting(e: InteractionEvent) {
                console.log('s');
                // const sprite: DraggingSprite = seatSpawner.sprite as DraggingSprite;
                // const viewport = App.viewport;
                // let { x, y } = e.data.getLocalPosition(viewport);
                // if (sprite.dragging) {
                //     if (!checkIfBeyondWorld(sprite, x, y)) {
                //         sprite.position.x += x - sprite.dragging.x;
                //         sprite.position.y += y - sprite.dragging.y;
                //         sprite.dragging = { x, y };
                //     }
                // } else {
                //     sprite.position.x = x;
                //     sprite.position.y = y;
                // }
            }
            screenContainer.on('pointermove', highlighting);
        }
    });

    // if (mode == 'build') {
    //     viewport.addChild(seatSpawner.sprite);

    //     let intManager = new InteractionManager(app.renderer);
    //     let mouse = intManager.mouse;

    //     seatSpawner.sprite.x = mouse.global.x != -999999 ? mouse.global.x : viewport.center.x;
    //     seatSpawner.sprite.y = mouse.global.y != -999999 ? mouse.global.y : viewport.center.y;
    //     seatSpawner.sprite.alpha = 0.5;

    //     function highlighting(e: InteractionEvent) {
    //         const sprite: DraggingSprite = seatSpawner.sprite as DraggingSprite;
    //         const viewport = App.viewport;
    //         let { x, y } = e.data.getLocalPosition(viewport);

    //         if (sprite.dragging) {
    //             if (!checkIfBeyondWorld(sprite, x, y)) {
    //                 sprite.position.x += x - sprite.dragging.x;
    //                 sprite.position.y += y - sprite.dragging.y;
    //                 sprite.dragging = { x, y };
    //             }
    //         } else {
    //             sprite.position.x = x;
    //             sprite.position.y = y;
    //         }
    //     }

    //     viewport.on('pointermove', highlighting);
    // }
}
