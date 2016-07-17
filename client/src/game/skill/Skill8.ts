import {BaseBombBallSkill, Ball} from "./BaseBombBallSkill"
import {GraphicConstant as GC} from "../../resource"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
import * as res from "../../resource"
import * as util from "../../util"
/**
 * 返回一个函数，用来计算点到直线的距离
 */
function distanceCalc(x1, y1, x2, y2): (x0: number, y0: number) => number 
{
	let dx = x2 - x1;
	let dy = y2 - y1;
	let length = Math.sqrt(dx * dx + dy * dy);
	return (x0, y0) =>
	{
		return Math.abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / length;
	}
}

//消除一个X形
export class Skill8 extends BaseBombBallSkill
{
	private _y0 = 283;
	private _y1 = 767;
	private _width = 60;
	//	private _effectBitmap1 = new createjs.Bitmap(null);
	//	private _effectBitmap2 = new createjs.Bitmap(null);
	private _effectBitmaps: createjs.Bitmap[] = [];
	constructor()
	{
		super();
		//		this.spr.addChildAt(this._effectBitmap1, 1);
		//		this._effectBitmap1.visible = false;
		//		this.spr.addChildAt(this._effectBitmap2, 1);
		//		this._effectBitmap2.visible = false;
		//this._SKILL_EFFECT_PERCENT = 0.1;
		//this._SKILL_DURATION = 5;
		this._SKILL_DURATION = 2;
	}

	init(game: any)
	{
		super.init(game);
		let desc = PetSkillDesc[7];
		this._width = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
		this._y0 *= res.GLOBAL_SCALE;
		this._y1 *= res.GLOBAL_SCALE;
	}

	getSkillResource()
	{
		let ret = super.getSkillResource();
		ret.push({ id: 'images/Skill/技能范围指示器.png', src: 'images/Skill/技能范围指示器.png' });
		return ret;
	}

	protected getBombBalls(): Ball[]
	{
		let balls = this._game.balls;
		//let main = this._game.getMainBallDefine();

		let radius = this._width / 2;
		let y0 = this._y0;
		let y1 = this._y1;
		let calc1 = distanceCalc(0, y0, GC.SCREEN_WIDTH, y1);
		let calc2 = distanceCalc(GC.SCREEN_WIDTH, y0, 0, y1);

		let ret = [];
		for (let ball of balls)
		{
			let pos = ball.position;
			if (!ball.skillHighlight &&
				(calc1(pos.x, pos.y) <= radius || calc2(pos.x, pos.y) <= radius) &&
				ball.status == 'normal' && !ball.isBomb)
			{
				ret.push(ball);
			}
		}
		return ret;
	}

	protected showIndicatorEffect(percent: number)
	{
		let bitmap1: createjs.Bitmap;
		let bitmap2: createjs.Bitmap;
		let bitmap3: createjs.Bitmap;
		let bitmap4: createjs.Bitmap;
		let y0 = this._y0;
		let y1 = this._y1;
		let center = {
			x: GC.SCREEN_WIDTH / 2,
			y: (this._y0 + this._y1) / 2
		}
		if (this._effectBitmaps.length == 0)
		{
			let image = this._game.getImage('images/Skill/技能范围指示器.png');
			let wantLength = Math.sqrt(GC.SCREEN_WIDTH * GC.SCREEN_WIDTH + (y1 - y0) * (y1 - y0)) + 80;

			bitmap1 = new createjs.Bitmap(image);
			bitmap1.set({
				regX: image.width / 2,
				regY: image.height / 2,
				scaleX: wantLength / image.width,
				scaleY:2,
				x: center.x,
				y: center.y,
				visible: false,
			});
			bitmap2 = bitmap1.clone();
			bitmap3 = bitmap1.clone();
			bitmap4 = bitmap1.clone();

			bitmap1.rotation = Math.atan2(this._y1 - this._y0, GC.SCREEN_WIDTH) * 180 / Math.PI;
			bitmap2.rotation = Math.atan2(this._y1 - this._y0, -GC.SCREEN_WIDTH) * 180 / Math.PI + 180;
			bitmap3.rotation = Math.atan2(this._y1 - this._y0, GC.SCREEN_WIDTH) * 180 / Math.PI + 180;
			bitmap4.rotation = Math.atan2(this._y1 - this._y0, -GC.SCREEN_WIDTH) * 180 / Math.PI;
			this.spr.addChild(bitmap1, bitmap2, bitmap3, bitmap4);
			this._effectBitmaps.push(bitmap1, bitmap2, bitmap3, bitmap4);
		}
		else
		{
			bitmap1 = this._effectBitmaps[0];
			bitmap2 = this._effectBitmaps[1];
			bitmap3 = this._effectBitmaps[2];
			bitmap4 = this._effectBitmaps[3];
		}
		let lerp = function (pos1, pos2, pp)
		{
			return {
				x: pos1.x + pp * (pos2.x - pos1.x),
				y: pos1.y + pp * (pos2.y - pos1.y),
			};
		}

		bitmap1.visible = true;
		bitmap2.visible = true;
		bitmap3.visible = true;
		bitmap4.visible = true;
		let vx = GC.SCREEN_WIDTH;
		let vy = y1 - y0;
		let vlen = Math.sqrt(vx * vx + vy * vy);
		vx /= vlen;
		vy /= vlen;
		let v1 = { x: vy, y: -vx };
		let moveDist = this._width * 0.5;
		let pos1 = {
			x: center.x + v1.x * moveDist,
			y: center.y + v1.y * moveDist,
		}
		let pos3 = {
			x: center.x - v1.x * moveDist,
			y: center.y - v1.y * moveDist,
		}
		bitmap1.set(lerp(center, pos1, percent));
		bitmap3.set(lerp(center, pos3, percent));

		let v2 = { x: -v1.x, y: v1.y };
		let pos2 = {
			x: center.x + v2.x * moveDist,
			y: center.y + v2.y * moveDist,
		}
		let pos4 = {
			x: center.x - v2.x * moveDist,
			y: center.y - v2.y * moveDist,
		}
		bitmap2.set(lerp(center, pos2, percent));
		bitmap4.set(lerp(center, pos4, percent));

	
	}

	protected hideIndicatorEffect()
	{
		for (let bmp of this._effectBitmaps)
		{
			bmp.visible = false;
		}
	}
}
