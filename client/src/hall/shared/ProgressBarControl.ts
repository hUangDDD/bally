///<reference path="../../../typings/tsd.d.ts"/>
import * as res from "../../resource"
import {HallUI} from "../HallUI"
interface ProgressBarControlDefine
{
	imageSrc: string;
	leftWidth: number;
	centerWidth: number;
	rightWidth: number;
}

var defaultDefine: ProgressBarControlDefine = {
	imageSrc: 'hall/progressbar',
	leftWidth: 12,
	centerWidth: 3,
	rightWidth: 11
};

export class ProgressBarControl extends createjs.DisplayObject
{
	private _image: HTMLImageElement;
	private _LEFT_WIDTH = 0;
	private _CENTER_WIDTH = 0;
	private _RIGHT_WIDTH = 0;
	private _MaxWidth = 233;
	private _percent = 0.5;

	get percent() { return this._percent; }
	set percent(val)
	{
		if (this._percent !== val)
		{
			this._percent = val;
		}
	}

	get maxWidth() { return this._MaxWidth; }
	set maxWidth(val)
	{
		if (val !== this._MaxWidth)
		{
			this._MaxWidth = val;
		}
	}

	constructor(define?: ProgressBarControlDefine)
	{
		super();
		if (!define) define = defaultDefine;

		this._image = HallUI.instance.getImage(define.imageSrc);
		this._LEFT_WIDTH = define.leftWidth;
		this._CENTER_WIDTH = define.centerWidth;
		this._RIGHT_WIDTH = define.rightWidth;
	}
	draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean)
	{
		if (!this.isVisible) return false;
		if (this._percent <= 0) return false;
		let totalDrawWidth = this._MaxWidth;
		const image = this._image;
		const SCALE = res.GLOBAL_SCALE;
		const DRAW_HEIGHT = (this._image.height * SCALE) | 0;
		const IMAGE_HEIGHT = this._image.height;
		let x //= this.x | 0;
		let y //= this.y | 0;
		if (this.parent)
		{
			let pt = this.parent.localToGlobal(this.x,this.y);
			x = pt.x | 0;
			y = pt.y | 0;
		}
		else
		{
			x = this.x | 0;
			y = this.y | 0;
		}

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		//draw left
		{
			let DRAW_WIDTH = (this._LEFT_WIDTH * SCALE) | 0;
			ctx.drawImage(image, 0, 0, this._LEFT_WIDTH, IMAGE_HEIGHT, x, y, DRAW_WIDTH, DRAW_HEIGHT);
			x += DRAW_WIDTH;
		}
		//draw center
		{
			let DRAW_WIDTH = ((totalDrawWidth - this._LEFT_WIDTH - this._RIGHT_WIDTH) * this._percent * SCALE) | 0;
			if (DRAW_WIDTH > 0)
			{
				ctx.drawImage(image, this._LEFT_WIDTH, 0, this._CENTER_WIDTH, IMAGE_HEIGHT, x, y, DRAW_WIDTH, DRAW_HEIGHT);
				x += DRAW_WIDTH;
			}
		}
		//draw right
		{
			let DRAW_WIDTH = (this._RIGHT_WIDTH * SCALE) | 0;
			ctx.drawImage(image, this._LEFT_WIDTH + this._CENTER_WIDTH, 0, this._RIGHT_WIDTH, IMAGE_HEIGHT, x, y, DRAW_WIDTH, DRAW_HEIGHT);
			x += DRAW_WIDTH;
		}
		return true;
	}
	isVisible() { return this.visible && this._percent > 0; }
}