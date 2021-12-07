import '@mszu/pixi-ssr-shim';
import { Texture, Sprite, Application } from 'pixi.js';
import type { InteractionData, InteractionEvent } from 'pixi.js';

import { App } from './pixi';
import { executeAfterTimeout, cancelTimeout } from './utils/timeouts';
import { percent } from './utils/math';

export interface DraggingSprite extends Sprite {
    dragging: { x; y };
    data?: InteractionData;
}

export default class Spawner {
    private _src: Texture;
    private _sprite: Sprite;

    private static _spawners = [];

    private createClone(): Sprite {
        let clone = new Sprite(this._sprite.texture);
        clone.scale = this._sprite.scale;
        

        return clone;
    }

    private clicked(e: InteractionEvent) {

    }

    constructor(src: Texture, app: Application) {
        this._src = src;
        this._sprite = new Sprite(this._src);

        this._sprite.zIndex = 5;

        this._sprite.interactive = true;

        // Registers the spawner into storage
        Spawner._spawners.push(this);

        this._sprite.on('pointerdown', this.clicked);
    }

    // TODO: Move this into a utils file
    checkIfBeyondWorld(sprite: DraggingSprite, x: number, y: any) {
        let spriteMoveX = sprite.position.x + (x - sprite.dragging.x);
        let spriteMoveY = sprite.position.y + (y - sprite.dragging.y);

        // Check if beyond in the x-axis
        if (
            spriteMoveX + sprite.width > App.viewport.worldWidth - App.border.line.width / 2 ||
            spriteMoveX < 0 + App.border.line.width / 2
        )
            return true;

        // Check if beyond in the y-axis
        if (
            spriteMoveY + sprite.height > App.viewport.worldHeight - App.border.line.width / 2 ||
            spriteMoveY < App.border.line.width / 2
        )
            return true;
    }

    spawn() {
        function onDragMove(e: InteractionEvent) {
            const sprite: DraggingSprite = e.currentTarget as DraggingSprite;
            const viewport = App.viewport;

            if (sprite.dragging) {
                let { x, y } = e.data.getLocalPosition(viewport);

                if (!this.checkIfBeyondWorld(sprite, x, y)) {
                    sprite.position.x += x - sprite.dragging.x;
                    sprite.position.y += y - sprite.dragging.y;
                    sprite.dragging = { x, y };
                }
            }
        }

        function onDragStart(e: InteractionEvent) {
            const sprite: DraggingSprite = e.currentTarget as DraggingSprite;
            const viewport = App.viewport;

            console.log(sprite.texture);

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
            App.viewport.drag();
        }

        const clone = this.createClone();

        clone.on('pointerdown', onDragStart);
        clone.on('pointermove', onDragMove);
        clone.on('pointerup', onDragEnd);
        clone.on('pointerupoutside', onDragEnd);
    }

    set x(val: number) {
        this._sprite.x = val;
    }

    set y(val: number) {
        this._sprite.y = val;
    }

    get sprite(): Sprite {
        return this._sprite;
    }
}
