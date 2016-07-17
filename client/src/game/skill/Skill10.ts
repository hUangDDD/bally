import {BaseSkill} from "./BaseSkill"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
//随机选几个球，变成炸弹
export class Skill10 extends BaseSkill
{

	constructor()
	{
		super();
	}
	init(game)
	{
		super.init(game);
		//	let desc = PetSkillDesc[8];
		//	this._time = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
	}
	getSkillResource()
	{
		let ret = super.getSkillResource();
		ret.push({ id: 'skill/圆形范围指示器', src: 'images/Skill/圆形范围指示器.png' });
		return ret;
	}
	//在中间的那一帧调用
	protected _takeEffect()
	{
		let count = 0;
		let desc = PetSkillDesc[9];
		let p1 = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
		let p2 = desc.skillParam2 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
		count = (p1 + (p2 - p1 + 1) * Math.random()) | 0; //[p1,p2]之间的整数
		//选出可以变成炸弹的球
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
		if (balls.length > count)
			balls.length = count;
		for (let ball of balls)
		{
			ball.skillHighlight = true;
		}
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
	//在最后调用的
	protected _applySkillEffect()
	{
		let balls = [];
		for (let ball of this._game.balls)
		{
			if (ball.skillHighlight)
			{
				ball.skillHighlight = false;
				balls.push(ball);
			}
		}
		this._game.turnBallToBomb(balls);
	}
}