import '@mszu/pixi-ssr-shim';
import { makeLayout } from 'pixi-layout';
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

    addChild(child: DisplayObject | Sprite, setLayout: boolean = true) {
        this._container.addChild(child);
        if (setLayout) {
            if (child instanceof Sprite) child.anchor.set(0.5);

            child.layout = makeLayout(this._container).x.set('50%').fromLeftInnerEdge();
            child.position.y = percent(88, App.app.view.height) + percent(50, this._container.height / 10);
        }
        this._children.push(child);
        return child;
    }

    get this() {
        return this._container;
    }

    set visible(val: boolean) {
        this._container.visible = val;
    }
}
