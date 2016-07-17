import {HallUI} from "../hall/HallUI"

export class VSBar extends createjs.DisplayObject
{
	_width = 355;
	_height = 38;
	_redBar: HTMLCanvasElement;
	_yellowBar: HTMLCanvasElement;
	_percent = 0.5;
	get width() { return this._width; }
	get height() { return this._height; }

	constructor()
	{
		super();
		this.hitArea = new createjs.Shape();
	}
	private prepare()
	{
		var redDotImage = HallUI.getImage('hall/pager_point_empty');
		var yellowDotImage = HallUI.getImage('hall/pager_point_full');
		var orgImageWidth = [9, 2, 9];
		var orgImageHeight = 20;
		var width = this._width;
		var height = this._height;
		this._redBar = create(redDotImage);
		this._yellowBar = create(yellowDotImage);
		function create(image: HTMLImageElement)
		{
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			var ww = [
				orgImageWidth[0] * height / orgImageHeight,
				width,
				orgImageWidth[2] * height / orgImageHeight,
			];
			ww[1] = width - ww[0] - ww[2];
			var ctx = canvas.getContext('2d');
			var dx = 0;
			var sx = 0;
			ctx.drawImage(image, sx, 0, orgImageWidth[0], orgImageHeight, dx, 0, ww[0], height);
			dx += ww[0];
			sx += orgImageWidth[0];
			ctx.drawImage(image, sx, 0, orgImageWidth[1], orgImageHeight, dx, 0, ww[1], height);
			dx += ww[1];
			sx += orgImageWidth[1];
			ctx.drawImage(image, sx, 0, orgImageWidth[2], orgImageHeight, dx, 0, ww[2], height);
			return canvas;
		}
	}

	draw(ctx: CanvasRenderingContext2D, ignoreCache?: boolean)
	{
		if (!this._redBar)
		{
			this.prepare();
			if (!this._redBar) return false;
		}
		var x = this.x | 0;
		var y = this.y | 0;
		var width1 = (this._width * this._percent) | 0;
		var width2 = this._width - width1;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.save();
		ctx.beginPath();
		ctx.rect(x, y, width1, this._height);
		ctx.clip();
		ctx.drawImage(this._yellowBar, x, y);
		ctx.restore();

		ctx.save();
		ctx.beginPath();
		ctx.rect(x + width1, y, width2, this._height);
		ctx.clip();
		ctx.drawImage(this._redBar, x, y);
		ctx.restore();

		return true;
	}
}

