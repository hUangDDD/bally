import {IGameSkill, EmptySkill} from "./IGameSkill"
import {Game} from "../Game"
import {GraphicConstant as GC} from "../../resource"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"
//下次连接可同种类果冻消除
//下一次连接不会受到颜色的限制，任意的球都能互相连接
export class Skill12 extends EmptySkill
{
	spr = new createjs.Container();
	protected game: Game;
	protected isStarted = false;
	protected blinkBitmap: createjs.Bitmap;
	protected blinkTween: createjs.Tween;
	constructor()
	{
		super();
	}

	init(game: any)
	{
		this.game = game;
		{
			let bitmap = this.blinkBitmap = new createjs.Bitmap(null);
			bitmap.alpha = 0;
			bitmap.visible = false;
			this.spr.addChild(bitmap);
		}

		this.blinkTween = createjs.Tween.get(this.blinkBitmap, { loop: true, paused: true })
			.to({ alpha: 1 }, 300)
			.to({ alpha: 0 }, 300);
	}

	clear()
	{
		this.triggerSkillEnd();
	}
	getSkillResource()
	{
		return [
			{ id: 'time_skill_blink_bitmap', src: 'images/Game/_0054_图层-7.png' }
		];
	}

	update()
	{

	}

	startSkill()
	{
		if (!this.isStarted)
		{
			this.isStarted = true;
			this.blinkBitmap.visible = true;
			this.blinkTween.setPaused(false);

			if (!this.blinkBitmap.image)
			{
				let image = this.blinkBitmap.image = this.game.getImage('time_skill_blink_bitmap');
				this.blinkBitmap.scaleX = GC.SCREEN_WIDTH / image.width;
				this.blinkBitmap.scaleY = GC.SCREEN_HEIGHT / image.height;
			}
			this.game.nextLinkIgnoreColor = true;
			let desc = PetSkillDesc[11];

			this.game.nextLinkIgnoreColor_MaxCount = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
			console.log(`技能开始，下一次消除忽略颜色，最大长度${this.game.nextLinkIgnoreColor_MaxCount}`);
		}
	}
	triggerSkillEnd()
	{
		if (this.isStarted)
		{
			this.isStarted = false;
			this.blinkBitmap.visible = false;
			this.blinkTween.setPaused(true);
		}
	}
}