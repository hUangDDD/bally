///<reference path="../../../typings/tsd.d.ts"/>

export class BitmapText extends createjs.Container
{
	private _align: 'left' | 'center' | 'right' = 'left';
	private _charDefines = {};
	private _bitmaps: createjs.Bitmap[] = [];
	private _text: string;

	static buildCharDefines(chars: string, image, width: number, height: number)
	{

		var charDefines = [];
		var x = 0;
		for (var c of chars)
		{
			charDefines.push({
				char: c,
				image: image,
				sourceRect: new createjs.Rectangle(x, 0, width, height)
			});
			x += width;
		}
		return charDefines;
	}


	constructor(defines?: { char: string; image: any; sourceRect?: any }[])
	{
		super();
		if (defines)
		{
			for (var d of defines)
			{
				this.addChar(d.char, d.image, d.sourceRect);
			}
		}
	}
	get align() { return this._align }
	set align(val: 'left' | 'center' | 'right') { this._align = val }
	
	addChars(defines: { char: string; image: any; sourceRect?: any }[])
	{
		for (var d of defines)
		{
			this.addChar(d.char, d.image, d.sourceRect);
		}
	}

	addChar(char: string, image, sourceRect?)
	{
		this._charDefines[char] = { image, sourceRect };
	}
	get text() { return this._text; }
	set text(val: string)
	{
		if (val !== this._text)
		{
			this._text = val;
			this.repaint();
		}
	}

	private repaint()
	{
		this.removeChild.apply(this, this._bitmaps);
		this._bitmaps.length = 0;
		var totalwidth = 0;
		for (var c of this._text)
		{
			var define = this._charDefines[c]
			if (define)
			{
				var bmp = new createjs.Bitmap(define.image);
				bmp.sourceRect = define.sourceRect;
				if (bmp.sourceRect)
				{
					totalwidth += bmp.sourceRect.width;
				}
				else
				{
					totalwidth += bmp.image.width;
				}
				this._bitmaps.push(bmp);
			}
		}
		var x = 0;
		var align = this._align;
		if (align === 'center')
		{
			x = -totalwidth / 2;
		}
		else if (align === 'right')
		{
			x = -totalwidth;
		}
		for (var bmp of this._bitmaps)
		{
			var width = bmp.sourceRect ? bmp.sourceRect.width : bmp.image.width;
			bmp.x = x;
			x += width;
		}
		this.addChild.apply(this, this._bitmaps);
	}
}