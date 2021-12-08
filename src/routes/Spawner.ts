import '@mszu/pixi-ssr-shim';
import { Texture, Sprite, Application } from 'pixi.js';
import type { InteractionData, InteractionEvent } from 'pixi.js';

import { App } from './pixi';
import { executeAfterTimeout, cancelTimeout } from './utils/timeouts';
import { percent } from './utils/math';

class SpawnedObject {
    private _sprite: Sprite;
    private _objectName: string;

    constructor(sprite: Sprite) {
        this._sprite = sprite;
    }

    get name() {
        return this._objectName;
    }

    get sprite() {
        return this._sprite;
    }
}

export interface DraggingSprite extends Sprite {
    dragging: { x; y };
    data?: InteractionData;
}

// TODO: Move this into a utils file
function checkIfBeyondWorld(sprite: DraggingSprite, x: number, y: any) {
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

export default class Spawner {
    private _src: Texture;
    private _sprite: Sprite;
    private _name: string;

    private static spawners = [];

    private createClone(): Sprite {
        let clone = new Sprite(this._sprite.texture);
        clone.scale = this._sprite.scale;

        return clone;
    }

    private spawnObject() {
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

        function onDragStart(e: InteractionEvent) {
            const sprite: DraggingSprite = e.currentTarget as DraggingSprite;
            const viewport = App.viewport;

            console.log(sprite.texture);

            sprite.data = e.data;
            sprite.alpha = 0.5;
            let { x, y } = e.data.getLocalPosition(viewport);
            sprite.dragging = { x, y };
            clone.sprite.cursor = 'grabbing';
            viewport.drag({ pressDrag: false });
        }

        function onDragEnd(e: InteractionEvent) {
            const sprite: DraggingSprite = e.currentTarget as DraggingSprite;

            sprite.alpha = 1;
            sprite.dragging = null;
            sprite.data = null;
            clone.sprite.cursor = 'grab';
            App.viewport.drag();
        }

        const clone = new SpawnedObject(this.createClone());

        clone.sprite.x = App.viewport.center.x;
        clone.sprite.y = App.viewport.center.y;

        App.viewport.addChild(clone.sprite);
        clone.sprite.interactive = true;
        clone.sprite.cursor = 'grab';

        clone.sprite.on('pointerdown', onDragStart);
        clone.sprite.on('pointermove', onDragMove);
        clone.sprite.on('pointerup', onDragEnd);
        clone.sprite.on('pointerupoutside', onDragEnd);

        return true;
    }

    private clicked() {
        App.app.renderer.plugins.interaction.setCursorMode('pointer');
        this.spawnObject();
    }

    constructor(src: Texture, name: string) {
        this._src = src;
        this._sprite = new Sprite(this._src);
        this._name = name;
        this._sprite.buttonMode = true;
        this._sprite.cursor = 'pointer';

        this._sprite.interactive = true;

        // Registers the spawner into storage
        Spawner.spawners.push(this);

        this._sprite.on('pointerdown', () => this.clicked());
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
