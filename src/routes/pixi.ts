// Make sure PIXI have enough information so development dev mode works fluently
import '@mszu/pixi-ssr-shim';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { percent } from './utils/math';
import Spawner from './Spawner';
import Container from './Container';
import { cancelTimeout, executeAfterTimeout } from './utils/timeouts';

function createApp(): PIXI.Application {
    return new PIXI.Application({
        backgroundColor: 0xfaf0f2,
        resizeTo: window,
        autoStart: false,
    });
}

function createSprite(src: string): PIXI.Sprite {
    if (!src.startsWith('images/')) throw Error('Images for sprite have to be served from images/ in static/images');
    const sprite = PIXI.Sprite.from(src);
    // sprite.anchor.set(0.5);

    return sprite;
}

/**
 * Class is made so that other files can access the viewport without needing
 * the viewport variable itself as an argument
 */
export class App {
    private static _viewport: Viewport;
    private static _app: PIXI.Application;
    private static _resources: PIXI.utils.Dict<PIXI.LoaderResource>;
    static parentEl: HTMLDivElement;

    static set viewport(vp: Viewport) {
        this._viewport = vp;
    }

    static set app(application: PIXI.Application) {
        this._app = application;
    }

    static set resources(res: PIXI.utils.Dict<PIXI.LoaderResource>) {
        this._resources = res;
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
}

function loaderProgress(e) {
    console.log(`Progress: ${e.progress}`);
}

function loaderError(e) {
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
    const app = App.app;

    App.viewport = new Viewport({
        screenWidth: app.view.width,
        screenHeight: app.view.height,
        worldWidth: app.view.width * 3 + 3000,
        worldHeight: app.view.width * 3,
        passiveWheel: false,

        interaction: app.renderer.plugins.interaction,
    });

    const viewport = App.viewport;

    App.parentEl.appendChild(app.view);

    viewport
        .drag({
            keyToPress: ['ControlLeft', 'ControlRight'],
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

    const border = viewport.addChild(new PIXI.Graphics());
    border.lineStyle(20, 0xff0000).drawRect(0, 0, viewport.worldWidth, viewport.worldHeight);

    app.stage.addChild(viewport);

    app.start();

    let texture = App.resources.rounded_seat.texture;
    const circleSpawner = new Spawner(texture, app);
    circleSpawner.sprite.x = viewport.worldWidth / 2;
    circleSpawner.sprite.y = viewport.worldHeight / 2;
    viewport.addChild(circleSpawner.sprite);

    interface DraggingSprite extends PIXI.Sprite {
        dragging: boolean;
        data?: PIXI.InteractionData;
        anchorCord: {
            x: number;
            y: number;
        };
    }

    function onDragStart(e: PIXI.InteractionEvent) {
        const sprite: DraggingSprite = e.currentTarget as DraggingSprite;
        const viewport = App.viewport;

        sprite.anchor.set(0);
        console.log(e.data.originalEvent.currentTarget)

        sprite.anchorCord = e.data.getLocalPosition(e.currentTarget);
        let { x, y } = sprite.anchorCord;
        // console.log(sprite.anchorCord, Math.abs(x / 1000), Math.abs(y / 1000))
        sprite.anchor.set(Math.abs(x / 1000), Math.abs(y / 1000));
        console.log(x, y);
        console.log(sprite.anchor)
        // console.log(sprite.width, sprite.height);

        // sprite.anchor.set(0.5)

        sprite.alpha = 0.5;
        sprite.data = e.data;
        sprite.dragging = true;
        viewport.drag({ pressDrag: false });
    }

    
        function onDragMove(e: PIXI.InteractionEvent) {
            const sprite: DraggingSprite = e.currentTarget as DraggingSprite;
            
            if (sprite.dragging) {
                console.log(sprite.anchor)
                const { x, y } = sprite.data!.getLocalPosition(App.viewport);
    
                sprite.x = x + sprite.anchorCord.x / 100;
                sprite.y = y + sprite.anchorCord.y / 100;
            }
        }
    function onDragEnd(e: PIXI.InteractionEvent) {
        const sprite: DraggingSprite = e.currentTarget as DraggingSprite;
        const viewport = App.viewport;
        const anchor = sprite.anchorCord;

        sprite.alpha = 1;
        sprite.dragging = false;
        sprite.data = null;
        viewport.drag();

        // const { x, y } = sprite.data!.getLocalPosition(App.viewport);

        // sprite.x = x -anchor.x;
        // sprite.y = anchor.y
    }

    circleSpawner.sprite.on('pointerdown', onDragStart);
    circleSpawner.sprite.on('pointermove', onDragMove);
    circleSpawner.sprite.on('pointerup', onDragEnd);
    circleSpawner.sprite.on('pointerupoutside', onDragEnd);
}

// let spawnerContainer = new Container();
// viewport.addChild(spawnerContainer.this);
// let seatingContainer = new Container();
// app.stage.addChild(seatingContainer.this);
// const rect = new PIXI.Graphics();
// rect.beginFill(0xdea3f8).drawRect(0, 0, app.view.width, percent(85, app.view.height)).endFill();
// seatingContainer.addChild(rect);
// Bottom Bar
// const line = new PIXI.Graphics();
// 0xF0D1D9 0xdc93a5
// line.lineStyle(3.5, 0xdc93a5, 0.7)
//     .beginFill(0xf0d1d9)
//     .moveTo(0, percent(85, app.view.height))
//     .lineTo(app.view.width, percent(85, app.view.height))
//     .drawRect(0, percent(85, app.view.height), app.view.width, app.view.height)
//     .endFill();
// line.zIndex = 0;
// spawnerContainer.addChild(line);

// const crateSpawner = new Spawner('images/chair.png', app);
// // Sprite
// let circle = createSprite('images/chair.png');
// circle.x = app.view.width / 2;
// circle.y = app.view.height / 2;
// app.stage.addChild(circle);
// // Make stage interactive
// circle.interactive = true;
// let circle = circleSpawner.sprite;

// circle.on('mousedown', userPress);
// circle.on('mousemove', userMove);
// circle.on('mouseup', userUp);
// circle.containerUpdateTransform();
// window.addEventListener('mouseup', () => (circle.dragging = false));
// let spriteHalfHeight = Math.floor(circle.height / 2);
// let spriteHalfWidth = Math.floor(circle.width / 2);
// executeAfterTimeout(
//     () => {
//         spriteHalfHeight = Math.floor(circle.height / 2);
//         spriteHalfWidth = Math.floor(circle.width / 2);
//     },
//     200,
//     'gethalfwidth',
//     true
// );
// const { width: screenWidth, height: screenHeight } = app.screen;
// let n;
// function userPress(e) {
//     let { x, y } = e.data.global;
//     n = e.data.getLocalPosition(circle);
//     circle.anchor.set(Math.abs(n.x / 100), Math.abs(n.y / 100));
//     if (x > spriteHalfWidth && x < screenWidth - spriteHalfWidth) circle.x = x;
//     if (y > spriteHalfHeight && y < screenHeight - spriteHalfHeight) circle.y = y;
//     circle.dragging = true;
// }
// function userMove(e) {
//     if (circle.dragging) {
//         let { x, y } = e.data.global;
//         if (x > spriteHalfWidth && x < screenWidth - spriteHalfWidth) circle.x = x;
//         if (y > spriteHalfHeight && y < screenHeight - spriteHalfHeight) circle.y = y;
//         if (x < 0 || y < 0 || x > screenWidth || y > screenHeight) {
//             executeAfterTimeout(
//                 () => {
//                     circle.dragging = false;
//                 },
//                 1000,
//                 'sprite-timeout',
//                 true
//             );
//         } else {
//             cancelTimeout('sprite-timeout');
//         }
//     }
// }
// function userUp(e) {
//     circle.dragging = false;
//     let { x, y } = e.data.global;
//     circle.anchor.set(0);
//     if (x > spriteHalfWidth && x < screenWidth - spriteHalfWidth) circle.x = x - n.x;
//     if (y > spriteHalfHeight && y < screenHeight - spriteHalfHeight) circle.y = y - n.y;
// }
