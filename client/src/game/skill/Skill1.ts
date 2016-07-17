import {BaseTransformBallSkill, Ball} from "./BaseTransformBallSkill"
import {GraphicConstant as GC} from "../../resource"
import * as util from "../../util"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
//转化画面中央的果冻
export class Skill1 extends BaseTransformBallSkill
{
	private _radius = 160;
	private _effectBitmap = new createjs.Bitmap(null);
	constructor()
	{
		super();
		this.spr.addChildAt(this._effectBitmap, 1);
		this._effectBitmap.visible = false;
	}

	init(game: any)
	{
		super.init(game);
		let desc = PetSkillDesc[0];
		this._radius = desc.skillParam1 / 2 + (this._game.getSkillLevel() - 1) * (desc.skillParamGrown / 2);
	}

	getSkillResource()
	{
		let ret = super.getSkillResource();
		ret.push({ id: 'images/Skill/技能范围指示器.png', src: 'images/Skill/技能范围指示器.png' });
		return ret;
	}

	protected getTransformBalls(): Ball[]
	{
		let balls = this._game.balls;
		let main = this._game.getMainBallDefine();

		let sqrRadius = this._radius * this._radius;

		let center = this._center;
		let ret = [];
		let y0 = this._center.y - this._radius;
		let y1 = this._center.y + this._radius;
		for (let ball of balls)
		{
			let pos = ball.position;
			if (!ball.skillHighlight && ball.status == 'normal' && !ball.isBomb && ball.position.y >= y0 && ball.position.y <= y1)
			{
				ret.push(ball);
			}
		}
		return ret;
	}

	protected showIndicatorEffect(percent: number)
	{
		let bitmap = this._effectBitmap;
		let image: HTMLImageElement;
		if (!bitmap.image)
		{
			image = bitmap.image = this._game.getImage('images/Skill/技能范围指示器.png');
			bitmap.regX = image.width / 2;
			bitmap.regY = image.height / 2;
			bitmap.x = this._center.x;
			bitmap.y = this._center.y;
		}
		else
		{
			image = bitmap.image as HTMLImageElement;
		}

		bitmap.visible = true;
		let sizeX = GC.SCREEN_WIDTH;
		let sizeY = this._radius * 2;

		bitmap.scaleX = sizeX / image.width;
		bitmap.scaleY = sizeY / image.height * percent;
	}

	protected hideIndicatorEffect()
	{
		this._effectBitmap.visible = false;
	}
}