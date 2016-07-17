import {BaseBombBallSkill, Ball} from "./BaseBombBallSkill"
import {GraphicConstant as GC} from "../../resource"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
//随机消除一种宠物（被消除宠物不会增加技能条）
export class Skill3 extends BaseBombBallSkill
{
	private _maxCount = 998;
	constructor()
	{
		super();
	}

	init(game: any)
	{
		super.init(game);
		let desc = PetSkillDesc[2];
		//this._maxCount = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
		this._energy = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
		//console.log('当前技能所需能量为:' + this._energy);
		this._isBallNoEnergy = true;
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
		let balls = this._game.balls.filter(x => !x.isBomb);
		//随机选一个颜色
		if (balls.length === 0) return [];
		let color = balls[(Math.random() * balls.length) | 0].color;
		balls = balls.filter(x => x.color === color && x.status === 'normal');
		if (balls.length > this._maxCount)
		{
			let count = balls.length;
			for (let i = 0; i < count; ++i)
			{
				let j = (Math.random() * count) | 0;
				if (i != j)
				{
					let tmp = balls[i];
					balls[i] = balls[j];
					balls[j] = tmp;
				}
			}
			balls.length = this._maxCount;
		}
		return balls;
	}
}