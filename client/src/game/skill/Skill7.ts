import {BaseBombBallSkill, Ball} from "./BaseBombBallSkill"
import {GraphicConstant as GC} from "../../resource"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
//将中间两排高度的所有宠物转化为自身宠物。（被转化的宠物被消除不会增加宠物技能条）两个球的直径
export class Skill7 extends BaseBombBallSkill
{
	private _height = 150;
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
		let desc = PetSkillDesc[6];
		this._height = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
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

		let height = this._height;

		let y0 = this._center.y - height / 2;
		let y1 = this._center.y + height / 2;
		let ret = [];
		for (let ball of balls)
		{
			let pos = ball.position;
			if (!ball.skillHighlight && pos.y >= y0 && pos.y <= y1 && ball.status == 'normal' && !ball.isBomb)
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
		var image;//= this._game.getImage('images/Skill/技能范围指示器.png');
		if (!bitmap1.image)
		{
			image = bitmap1.image = bitmap2.image = this._game.getImage('images/Skill/技能范围指示器.png');
			bitmap1.scaleX = bitmap2.scaleX = GC.SCREEN_WIDTH / image.width;
			bitmap1.regY = bitmap2.regY = image.height / 2;
			bitmap2.scaleY = -1;
		}
		image = bitmap1.image;
		var centery = this._center.y;
		bitmap1.y = centery - (percent * this._height / 2);
		bitmap2.y = centery + (percent * this._height / 2);

		bitmap1.visible = bitmap2.visible = true;
		/*
		let bitmap = this._effectBitmap;
		let image: HTMLImageElement;
		if (!bitmap.image)
		{
			image = bitmap.image = this._game.getImage('images/Skill/技能范围指示器.png');
			bitmap.regX = 0;
			bitmap.regY = image.height / 2;
			bitmap.x = 0;
			bitmap.y = this._center.y;
			bitmap.scaleY = this._height / image.height;
		}
		else
		{
			image = bitmap.image as HTMLImageElement;
		}
		let maxscale = GC.SCREEN_WIDTH / image.width;
		bitmap.visible = true;
		bitmap.scaleX = maxscale * percent;*/
	}

	protected hideIndicatorEffect()
	{
		this._effectBitmap1.visible = false;
		this._effectBitmap2.visible = false;
	}
}