import { cancelTimeout, executeAfterTimeout } from './timeouts';

// Make sure PIXI have enough information so development dev mode works fluently
import '@mszu/pixi-ssr-shim';
import * as PIXI from 'pixi.js';

import Spawner from './Spawner';

function createApp(): PIXI.Application {
    return new PIXI.Application({
        backgroundColor: 0xfaf0f2,
        width: window.innerWidth,
        height: window.innerHeight,
    });
}

function createSprite(src: string): PIXI.Sprite {
    if (!src.startsWith('images/')) throw Error('Images for sprite have to be served from images/ in static/images');
    const sprite = PIXI.Sprite.from(src);
    // sprite.anchor.set(0.5);

    return sprite;
}

// function spawnChair();

export async function run(el: HTMLDivElement) {
    const app = createApp();

    el.appendChild(app.view);

    const circleSpawner = new Spawner('images/seat.svg', app);
    // const circleSpawners = new Spawner('images/seat.svg', app);
    // circleSpawners.sprite.x += 60;

    const line = new PIXI.Graphics();
    // 0xF0D1D9
    line.lineStyle(3.5, 0xdc93a5);
    line.beginFill(0xf0d1d9);
    line.moveTo(0, app.view.height - (15 / 100) * app.view.height);
    line.lineTo(app.view.width, app.view.height - (15 / 100) * app.view.height);
    line.drawRect(0, app.view.height - (15 / 100) * app.view.height, app.view.width, app.view.height);

    // line.moveTo(0, app.stage.height - (15 / 100) * app.view.height);
    // line.lineTo(app.stage.width, app.stage.height - (15 / 100) * app.view.height);
    line.endFill();
    app.stage.addChild(line);

    // const crateSpawner = new Spawner('images/chair.png', app);

    // // Sprite
    // let circle = createSprite('images/chair.png');
    // circle.x = app.view.width / 2;
    // circle.y = app.view.height / 2;
    // app.stage.addChild(circle);

    // // Make stage interactive
    // circle.interactive = true;
    // circle.on('mousedown', userPress);
    // circle.on('mousemove', userMove);
    // circle.on('mouseup', userUp);
    // circle.containerUpdateTransform()
    // window.addEventListener('mouseup', () => circle.dragging = false)

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
    // let n

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

    // 	circle.anchor.set(0)
    //     if (x > spriteHalfWidth && x < screenWidth - spriteHalfWidth) circle.x = x - n.x;
    //     if (y > spriteHalfHeight && y < screenHeight - spriteHalfHeight) circle.y = y - n.y;

    // 	// circle.x = x + d.x;
    // 	// circle.y = y + d.y
    // 	// executeAfterTimeout(() => circle.anchor.set(0), 100, 'anchor-set', true)
    // }
}
