import {HallUI} from "./HallUI"
export class BlinkStarEffect
{
	spr = new createjs.Container();
	width = 518;
	height = 114;

	STAR_CREATE_SPAN = 80;
	SIZE_SCALE = [0.5, 1.2];
	ANIM_DURATION = [200, 400];

	private _freeStarList: createjs.Bitmap[] = [];
	private _start = false;
	private _lastCreateStarTime = 0;
	constructor()
	{
		this.spr.addEventListener('tick', () => this.onTick());
	}
	private createStar()
	{
		if (this._freeStarList.length > 0)
		{
			var star = this._freeStarList.pop();
			star.visible = true;
			return star;
		}
		var image = HallUI.instance.getImage('hall/blink_star');
		var star = new createjs.Bitmap(image);
		star.set({
			regX: image.width / 2,
			regY: image.height / 2
		});
		this.spr.addChild(star);
		return star;
	}

	private removeStar(star: createjs.Bitmap)
	{
		if (!this._start)
		{
			this.spr.removeChild(star);
			return;
		}
		star.visible = false;
		this._freeStarList.push(star);
	}

	private onTick()
	{
		if (!this._start) return;
		var now = Date.now();
		if (now > this._lastCreateStarTime + this.STAR_CREATE_SPAN)
		{
			this._lastCreateStarTime = now;
			this._addStar();
		}
	}
	private _addStar()
	{
		var star = this.createStar();
		var scale = this.SIZE_SCALE[0] + (this.SIZE_SCALE[1] - this.SIZE_SCALE[0]) * Math.random();
		var duration = this.ANIM_DURATION[0] + (this.ANIM_DURATION[1] - this.ANIM_DURATION[0]) * Math.random();
		star.set({
			x: this.width * Math.random(),
			y: this.height * Math.random(),
			scaleX: 0,
			scaleY: 0,
			alpha: 0
		});
		createjs.Tween.get(star)
			.to({ scaleX: scale, scaleY: scale, alpha: 1 }, duration)
			.to({ scaleX: 0, scaleY: 0, alpha: 0 }, duration)
			.call(() => { this.removeStar(star) });
	}

	start()
	{
		this._start = true;
	}

	stop()
	{
		if (this._start)
		{
			this._start = false;
			for (var x of this._freeStarList)
			{
				this.spr.removeChild(x);
			}
			this._freeStarList.length = 0;
		}
	}
}
window['BlinkStarEffect'] = BlinkStarEffect;