import '@mszu/pixi-ssr-shim';
import { Container as PIXI_Container, Graphics, DisplayObject } from 'pixi.js';

export default class Container {
    private _container: PIXI_Container;
    private _children: DisplayObject[] = [];

    constructor() {
        this._container = new PIXI_Container();
        this._container.visible = true;
        // this._container.mask = new Graphics().beginFill(0xffffff).drawCircle(20, 20, 10).endFill();
    }

    addChild(child: DisplayObject) {
        this._container.addChild(child);
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
