import {BaseSkill} from "./BaseSkill"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"

export class Skill9 extends BaseSkill
{
	_time = 3;
	constructor()
	{
		super();
		this._SKILL_EFFECT_PERCENT = 0.6;
	}
	init(game)
	{
		super.init(game);
		let desc = PetSkillDesc[8];
		this._time = desc.skillParam1 + (this._game.getSkillLevel() - 1) * desc.skillParamGrown;
	}
	startSkill()
	{
		if (!this._isStarted)
		{
			/*let text = new createjs.Text(`+${this._time}s`, '80px SimHei', '#ff78ac');
			text.set({ x: 320, y: 480 });
			text.textAlign = 'center';
			text.shadow = new createjs.Shadow('black', 2, 2, 1);
			this.spr.addChild(text);
			createjs.Tween.get(text).wait(400).to({ x: 65, y: 58 }, 600, createjs.Ease.cubicIn).call(() => { text.parent.removeChild(text) });
			*/
		}
		super.startSkill();
	}
	//在中间的那一帧调用
	protected _takeEffect()
	{
		let bitmap = this._iconBitmap.clone();
		bitmap.visible = true;

		let text = new createjs.Text(`Time+${this._time}s`, '700 40px SimHei', 'white');
		text.set({ x: 74, y: 55 });
		text.textAlign = 'center';
		text.shadow = new createjs.Shadow('black', 2, 2, 1);
		this.spr.addChild(text);
		text.visible = false;

		this.spr.addChild(bitmap);
		createjs.Tween.get(bitmap).to({ x: 74, y: 74, rotation: 360 * 4, scaleX: 0.2, scaleY: 0.2 }, 500).call(() =>
		{
			this.spr.removeChild(bitmap);
			text.visible = true;
		}).wait(500).call(() =>
		{
			createjs.Tween.get(text).to({ y: text.y - 15, alpha: 0 }, 200).call(() =>
			{
				this.spr.removeChild(text);
			});;
		});

	}
	//在最后调用的
	protected _applySkillEffect()
	{
		this._game.addGameTime(this._time);
	}
}