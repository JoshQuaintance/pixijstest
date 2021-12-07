import type {
    InteractionData,
    InteractionEvent,
    utils as P_Utils,
    Container as PIXIContainer,
    DisplayObject,
} from 'pixi.js';

// Make sure PIXI have enough information so development dev mode works fluently
import '@mszu/pixi-ssr-shim';
import { Application, Sprite, LoaderResource, Graphics } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { percent } from './utils/math';
import Spawner from './Spawner';
import Container from './Container';
import { cancelTimeout, executeAfterTimeout } from './utils/timeouts';

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

    const border = viewport.addChild(new Graphics());
    border.lineStyle(20, 0xff0000).drawRect(0, 0, viewport.worldWidth, viewport.worldHeight);

    app.stage.addChild(viewport);

    app.start();

    // @ts-ignore

    // viewport.addChild(circleSpawner.sprite);
    interface DraggingSprite extends Sprite {
        dragging: { x; y };
        data?: InteractionData;
    }

    function onDragStart(e: InteractionEvent) {
        const sprite: DraggingSprite = e.currentTarget as DraggingSprite;
        const viewport = App.viewport;

        sprite.data = e.data;
        sprite.alpha = 0.5;
        let { x, y } = e.data.getLocalPosition(viewport);
        sprite.dragging = { x, y };
        viewport.drag({ pressDrag: false });
    }

    function onDragEnd(e: InteractionEvent) {
        const sprite: DraggingSprite = e.currentTarget as DraggingSprite;

        sprite.alpha = 1;
        sprite.dragging = null;
        sprite.data = null;
        viewport.drag();
    }

    function checkIfBeyondWorld(sprite: DraggingSprite, x: number, y: any) {
        let spriteMoveX = sprite.position.x + (x - sprite.dragging.x);
        let spriteMoveY = sprite.position.y + (y - sprite.dragging.y);

        // Check if beyond in the x-axis
        if (
            spriteMoveX + sprite.width > viewport.worldWidth - border.line.width / 2 ||
            spriteMoveX < 0 + border.line.width / 2
        )
            return true;

        // Check if beyond in the y-axis
        if (
            spriteMoveY + sprite.height > viewport.worldHeight - border.line.width / 2 ||
            spriteMoveY < border.line.width / 2
        )
            return true;
    }

    function onDragMove(e: InteractionEvent) {
        const sprite: DraggingSprite = e.currentTarget as DraggingSprite;
        const viewport = App.viewport;

        if (sprite.dragging) {
            let { x, y } = e.data.getLocalPosition(viewport);

            if (!checkIfBeyondWorld(sprite, x, y)) {
                sprite.position.x += x - sprite.dragging.x;
                sprite.position.y += y - sprite.dragging.y;
                sprite.dragging = { x, y };
            }
        }
    }

    let seatingContainer = new Container();

    // seatingContainer.this.height = percent(22, app.view.height);
    const rect = new Graphics();

    rect.beginFill(0xdea3f8)
        .drawRect(0, percent(88, app.view.height), app.view.width, percent(85, app.view.height))
        .endFill();

    function seatingContainerFunction(container: PIXIContainer, child: DisplayObject) {
        if (!(child instanceof Sprite)) return;

        child.anchor.set(0.5);
        child.scale.set(0.15);
        child.x = container.width / 2;
        child.y = percent(88, app.view.height) + percent(50, percent(12, app.view.height))

        container.addChild(child);
    }

    seatingContainer.addChild(rect);

    let texture = App.resources.rounded_seat.texture;

    const circleSpawner = new Spawner(texture, app);

    circleSpawner.sprite.on('pointerdown', onDragStart);
    circleSpawner.sprite.on('pointermove', onDragMove);
    circleSpawner.sprite.on('pointerup', onDragEnd);
    circleSpawner.sprite.on('pointerupoutside', onDragEnd);

    seatingContainer.addChild(circleSpawner.sprite, seatingContainerFunction);
    app.stage.addChild(seatingContainer.this);
}
