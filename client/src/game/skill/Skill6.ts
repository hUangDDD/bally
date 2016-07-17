import {BaseBombBallSkill, Ball} from "./BaseBombBallSkill"
import {GraphicConstant as GC} from "../../resource"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
//消除屏幕两列宠物
export class Skill6 extends BaseBombBallSkill
{
	private _x0 = 0;
	private _x1 = 1;
	private _width = 70;
	private _effectBitmap1 = new createjs.Bitmap(null);
	private _effectBitmap2 = new createjs.Bitmap(null);
	constructor()
	{
		super();
		this.spr.addChildAt(this._effectBitmap1, 1);
		this._effectBitmap1.visible = false;
		this.spr.addChildAt(this._effectBitmap2, 1);
		this._effectBitmap2.visible = false;
	}

	init(game: any)
	{
		super.init(game);
		let desc = PetSkillDesc[5];
		this._width = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
		this._x0 = GC.SCREEN_WIDTH / 3;
		this._x1 = GC.SCREEN_WIDTH / 3 * 2;
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
		let main = this._game.getMainBallDefine();

		let x0 = this._x0;
		let x1 = this._x1;
		let radius = this._width / 2;

		let ret = [];
		for (let ball of balls)
		{
			let pos = ball.position;
			if (!ball.skillHighlight &&
				(Math.abs(pos.x - x0) <= radius || Math.abs(pos.x - x1) <= radius) &&
				ball.status == 'normal' && !ball.isBomb)
			{
				ret.push(ball);
			}
		}
		return ret;
	}

	protected showIndicatorEffect(percent: number)
	{
		let bitmap1 = this._effectBitmap1;
		let bitmap2 = this._effectBitmap2;
		let image: HTMLImageElement;
		if (!bitmap1.image)
		{
			image = bitmap1.image = bitmap2.image = this._game.getImage('images/Skill/技能范围指示器.png');
			bitmap1.regX = bitmap2.regX = image.width / 2;
			bitmap1.regY = bitmap2.regY = 0;
			bitmap1.scaleX = bitmap2.scaleX = this._width / image.width;
			bitmap1.x = this._x0;
			bitmap2.x = this._x1;
		}
		else
		{
			image = bitmap1.image as HTMLImageElement;
		}
		bitmap1.visible = true;
		bitmap2.visible = true;
		let pp = (percent * GC.SCREEN_HEIGHT) / image.height;
		bitmap1.scaleY = bitmap2.scaleY = pp;
	}

	protected hideIndicatorEffect()
	{
		this._effectBitmap1.visible = false;
		this._effectBitmap2.visible = false;
	}
}