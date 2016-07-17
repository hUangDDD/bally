///<reference path="../../../typings/tsd.d.ts"/>
import {GameStage} from "../../GameStage";
//todo: 惯性
export class VerticalScrollPanel
{
	spr = new createjs.Container();
	container = new createjs.Container();
	private _hitArea = new createjs.Shape();
	private _mask = new createjs.Shape();
	private _width = 0;
	private _height = 0;
	private _contentHeight = 0;
	private _lastX = 0;
	private _lastY = 0;
	private _isDragging = false;
	/**一个设置选项，是否允许在拖动的过程中，临时拖出限制的范围 */
	private _allowDragOutside = true;
	constructor()
	{
		//this.spr.addChild(this._mask);
		//this._mask.visible = false;
		this.spr.addChild(this._hitArea);
		this.spr.addChild(this.container);

		this._hitArea.hitArea = new createjs.Shape(this._mask.graphics);
		this.spr.mask = this._mask;
		this._mask.transformMatrix = this.spr.transformMatrix;
		this.spr.addEventListener('mousedown', e => this.onMouseDown(e as any));
		this.spr.addEventListener('pressmove', e => this.onPressMove(e as any));
		this.spr.addEventListener('pressup', e => this.onPressUp(e as any));
	}
	get height() { return this._height; }
	setVisualizeMask(x: boolean)
	{
		this._hitArea.graphics = x ? this._mask.graphics : null;
	}

	addChild(c: createjs.DisplayObject)
	{
		this.container.addChild(c);
	}

	removeChild(c: createjs.DisplayObject)
	{
		this.container.removeChild(c);
	}

	_checkVisible(c: createjs.DisplayObject)
	{
		let bounds = c.getBounds();
		let y0 = c.y + bounds.y;
		let y1 = y0 + bounds.height;
		let pos = this.position;
		let pos2 = pos + this._height;
		return (pos <= y0 && y0 <= pos2) || (pos <= y1 && y1 <= pos2);
	}

	_updateVisibility()
	{
		let children = this.container.children;
		for (let c of children)
		{
			c.visible = this._checkVisible(c);
		}
	}

	setPos(pos: { x: number, y: number })
	{
		this.spr.set(pos);
		this._mask.set(pos);
		//this._hitArea.set(pos);
	}
	setSize(width: number, height: number)
	{
		if (this._width != width || this._height != width)
		{
			this._width = width;
			this._height = height;

			let g = this._mask.graphics;
			g.clear();
			g.beginFill('rgba(0,0,0,0.2)');
			g.drawRect(0, 0, width, height);
			g.endFill();
		}
	}

	get contentHeight() { return this._contentHeight; }
	set contentHeight(val)
	{
		if (this._contentHeight !== val)
		{
			this._contentHeight = val;
			if (!this._isDragging || !this._allowDragOutside)
			{
				this._constrainPosition();
			}
		}
	}

	get position() { return -this.container.y; }
	/**设置position的时候，不会限制position的取值范围 */
	set position(val)
	{
		if (this.container.y !== -val)
		{
			this.container.y = -val;
			this._updateVisibility();
		}
	}

	get maxPosition()
	{
		if (this._height >= this._contentHeight) return 0;
		return this._contentHeight - this._height;
	}

	get minPosition()
	{
		return 0;
	}



	//events
	private onMouseDown(e: createjs.MouseEvent)
	{
		this._lastX = e.stageX;
		this._lastY = e.stageY;
	}

	private onPressMove(e: createjs.MouseEvent)
	{
		this._isDragging = true;

		let dy = e.stageY - this._lastY;

		if (dy !== 0)
		{
			this.position -= dy;
			if (!this._allowDragOutside)
			{
				this._constrainPosition();
			}
			GameStage.instance.makeDirty();
		}

		this._lastX = e.stageX;
		this._lastY = e.stageY;
	}

	private onPressUp(e: createjs.MouseEvent)
	{
		this._isDragging = false;
		this._constrainPosition();
	}

	private _constrainPosition()
	{
		if (this.position < this.minPosition) this.position = this.minPosition;
		else if (this.position > this.maxPosition) this.position = this.maxPosition;
	}
}