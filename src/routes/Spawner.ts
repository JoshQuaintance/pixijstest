import '@mszu/pixi-ssr-shim';
import * as PIXI from 'pixi.js';

import { executeAfterTimeout, cancelTimeout } from './utils/timeouts';
import { percent } from './utils/math';

export default class Spawner {
    private _src: string;
    private _sprite: PIXI.Sprite;

    private static _spawners = [];

    constructor(src: string, app: PIXI.Application) {
        if (!src.startsWith('images/'))
            throw Error('Images for sprite have to be served from images/ in static/images');

        this._src = src;
        let texture = PIXI.Texture.from(src);
        this._sprite = new PIXI.Sprite(texture);

        this._sprite.scale.set(percent(1.5, percent(15, app.view.height)) / 10);
        this._sprite.anchor.set(0, 0.5);

        // executeAfterTimeout(
        //     () => {
        //         console.log(this._sprite.width);
        //     },
        //     200,
        //     'width-height'
        // );

        // this._sprite.x = app.view.width / 2;
        this._sprite.y = app.view.height - percent(50, percent(15, app.view.height));
        this._sprite.zIndex = 5;

        this._sprite.interactive = true;

        // Registers the spawner into storage
        Spawner._spawners.push(this);
    }

    set x(val: number) {
        this._sprite.x = val;
    }

    set y(val: number) {
        this._sprite.y = val;
    }

    get sprite(): PIXI.Sprite {
        return this._sprite;
    }
}
