import {BaseBombBallSkill, Ball} from "./BaseBombBallSkill"
import {GraphicConstant as GC} from "../../resource"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
//随机消除一部分果冻
export class Skill4 extends BaseBombBallSkill
{
	private _maxCount = 10;
	constructor()
	{
		super();
	}

	init(game: any)
	{
		super.init(game);
		let desc = PetSkillDesc[3];
		this._maxCount = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;

	}



	getSkillResource()
	{
		let ret = super.getSkillResource();
		ret.push({ id: 'skill/圆形范围指示器', src: 'images/Skill/圆形范围指示器.png' });
		return ret;
	}
	protected _takeEffect()
	{
		
		super._takeEffect();
		var balls = this._currentBombBalls;
		let circleImage = this._game.getImage('skill/圆形范围指示器');
		for (let ball of balls)
		{
			let bitmap = new createjs.Bitmap(circleImage);
			bitmap.set({
				regX: circleImage.width / 2,
				regY: circleImage.height / 2,
				x: ball.position.x,
				y: ball.position.y,
				scaleX: 0, scaleY: 0,
			});
			var toScale = 80 / circleImage.width * 1.5;
			this.spr.addChild(bitmap);
			createjs.Tween.get(bitmap).to({ scaleX: toScale, scaleY: toScale }, 600).call(() => this.spr.removeChild(bitmap));
		}
	}
	protected getBombBalls(): Ball[]
	{
		//选出可以炸的球
		let balls = this._game.balls.filter(x => !x.isBomb && x.status === 'normal');
		//随机一下
		for (let i = 0; i < balls.length; ++i)
		{
			let a = (Math.random() * balls.length) | 0;
			let b = (Math.random() * balls.length) | 0;
			if (a !== b && (a < balls.length && b < balls.length))
			{
				let tmp = balls[a];
				balls[a] = balls[b];
				balls[b] = tmp;
			}
		}
		if (balls.length > this._maxCount)
		{
			balls.length = this._maxCount;
		}
		return balls;
	}
}