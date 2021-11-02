import { cancelTimeout, executeAfterTimeout } from './timeouts';

// Make sure PIXI have enough information so development dev mode works fluently
import '@mszu/pixi-ssr-shim';
import * as PIXI from 'pixi.js';

function createApp(): PIXI.Application {
	return new PIXI.Application({
		backgroundColor: 0xaaaaaa,
		width: window.innerWidth,
		height: window.innerHeight
	});
}

function createSprite(src: string): PIXI.Sprite {
	if (!src.startsWith('images/'))
		throw Error('Images for sprite have to be served from images/ in static/images');
	const sprite = PIXI.Sprite.from(src);
	sprite.anchor.set(0.5);

	return sprite;
}

// function spawnChair();

export async function run(el: HTMLDivElement) {
	const app = createApp();

	el.appendChild(app.view);

	// Sprite
	let circle = createSprite('images/chair.png');
	circle.x = app.view.width / 2;
	circle.y = app.view.height / 2;
	app.stage.addChild(circle);

	// Make stage interactive
	app.stage.interactive = true;
	app.stage.on('mousedown', userPress);
	app.stage.on('mousemove', userMove);
	app.stage.on('mouseup', userUp);

	let spriteHalfHeight = Math.floor(circle.height / 2);
	let spriteHalfWidth = Math.floor(circle.width / 2);

	setTimeout(() => {
		spriteHalfHeight = Math.floor(circle.height / 2);
		spriteHalfWidth = Math.floor(circle.width / 2);
	}, 200);
	const { width: screenWidth, height: screenHeight } = app.screen;

	function userPress(e) {
		let { x, y } = e.data.global;

		if (x > spriteHalfWidth && x < screenWidth - spriteHalfWidth) circle.x = x;
		if (y > spriteHalfHeight && y < screenHeight - spriteHalfHeight) circle.y = y;

		circle.dragging = true;
	}

	function userMove(e) {
		if (circle.dragging) {
			let { x, y } = e.data.global;

			if (x > spriteHalfWidth && x < screenWidth - spriteHalfWidth) circle.x = x;
			if (y > spriteHalfHeight && y < screenHeight - spriteHalfHeight) circle.y = y;

			if (x < 0 || y < 0 || x > screenWidth || y > screenHeight) {
				executeAfterTimeout(
					() => {
						circle.dragging = false;
					},
					1000,
					'sprite-timeout',
					true
				);
			} else {
				cancelTimeout('sprite-timeout');
			}
		}
	}

	function userUp(e) {
		circle.dragging = false;

		let { x, y } = e.data.global;

		if (x > spriteHalfWidth && x < screenWidth - spriteHalfWidth) circle.x = x;
		if (y > spriteHalfHeight && y < screenHeight - spriteHalfHeight) circle.y = y;
	}
}