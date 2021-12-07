import '@mszu/pixi-ssr-shim';
import { Align, makeLayout } from 'pixi-layout';
import { Container as PIXI_Container, Graphics, DisplayObject, Sprite } from 'pixi.js';
import { xlink_attr } from 'svelte/internal';
import { App } from './pixi';
import { percent } from './utils/math';

export default class Container {
    private _container: PIXI_Container;
    private _children: DisplayObject[] = [];

    public flex: boolean;

    constructor() {
        this.flex = false;
        this._container = new PIXI_Container();
        this._container.visible = true;
    }

    calculateLayout() {}

    addChild(child: DisplayObject | Sprite, customFunction?: Function) {
        if (customFunction) return customFunction(this._container, child);
        this._container.addChild(child);

        this._children.push(child);
        return child;
    }

    get this() {
        return this._container;
    }
}
