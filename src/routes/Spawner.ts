import '@mszu/pixi-ssr-shim';
import * as PIXI from 'pixi.js';

import { executeAfterTimeout, cancelTimeout } from './timeouts';

export default class Spawner {
    private _src: string;
    private _sprite: PIXI.Sprite;

    constructor(src: string, app: PIXI.Application) {
        if (!src.startsWith('images/'))
            throw Error('Images for sprite have to be served from images/ in static/images');

        this._src = src;
        let texture = PIXI.Texture.from(src);
        this._sprite = new PIXI.Sprite(texture);
        this._sprite.scale.set(0.18)
        this._sprite.anchor.set(0.5);

        this._sprite.x = app.view.width / 2;
        this._sprite.y = app.view.height / 2;

        app.stage.addChild(this._sprite);

        this._sprite.interactive = true;
    }

    get sprite(): PIXI.Sprite {
        return this._sprite;
    }
}
