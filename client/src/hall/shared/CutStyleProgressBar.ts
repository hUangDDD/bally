///<reference path="../../../typings/tsd.d.ts"/>
export class CutStyleProgressBar extends createjs.Bitmap
{
	percent = 1;
	constructor(image)
	{
		super(image);
	}

	get sourceRect()
	{
		if (this.image)
		{
			return new createjs.Rectangle(0, 0, this.image.width * this.percent, this.image.height);
		}
		return null;
	}
}