import {IGameSkill, EmptySkill} from "./IGameSkill"
import {Game} from "../Game"
import {GraphicConstant as GC} from "../../resource"
import * as res from "../../resource"
import {PetSkillDesc} from "../../../shared/PetSkillDesc"

//消除动画持续时间
const SKILL_DURATION = 0.5;

//根据玩家点击方向消除一列果冻
export class Skill13 extends EmptySkill
{
	spr = new createjs.Container();
	protected game: Game;
	protected width = 160;
	//isWaitClick表示用户点击了一下技能按钮，下一次点击会触发消除
	protected isWaitClick = false;
	protected blinkBitmap: createjs.Bitmap;
	protected blinkTween: createjs.Tween;
	protected clickPt;
	//isStarted表示开始消除了
	protected isStarted = false;
	protected startTick = 0;
	protected endTick = 0;
	protected effectBitmap: createjs.Bitmap;
	protected _center = {
		x: GC.SCREEN_WIDTH / 2,
		y: GC.SCREEN_HEIGHT / 2 + 50 * res.GLOBAL_SCALE
	}
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

		this.effectBitmap = new createjs.Bitmap(null);
		this.spr.addChild(this.effectBitmap);


		let desc = PetSkillDesc[12];
		this.width = desc.skillParam1 + (this.game.getSkillLevel() - 1) * desc.skillParamGrown;
	}

	clear()
	{
		if (this.blinkBitmap)
		{
			this.blinkBitmap.visible = false;
			this.blinkTween.setPaused(true);
		}
	}
	getSkillResource()
	{
		return [
			{ id: 'time_skill_blink_bitmap', src: 'images/Game/_0054_图层-7.png' },
			{ id: 'images/Skill/技能范围指示器.png', src: 'images/Skill/技能范围指示器.png' }
		];
	}

	isPreventUserInteract()
	{
		return this.isCasting();
	}

	isPreventPhysics()
	{
		return this.isCasting();
	}
	isCasting()
	{
		return this.isStarted;
	}

	update()
	{
		if (this.isStarted)
		{
			let t0 = this.startTick;
			let t1 = this.endTick;
			let t = this.game.tick;
			let p = (t - t0) / (t1 - t0);
			if (t >= t1)
			{
				this.isStarted = false;
				this.applyFinal();
				this.hideIndicator();
			}
			else
			{
				this.showIndicator(p);
			}
		}
	}

	startSkill()
	{
		if (!this.isWaitClick)
		{
			this.isWaitClick = true;
			this.blinkBitmap.visible = true;
			this.blinkTween.setPaused(false);

			if (!this.blinkBitmap.image)
			{
				let image = this.blinkBitmap.image = this.game.getImage('time_skill_blink_bitmap');
				this.blinkBitmap.scaleX = GC.SCREEN_WIDTH / image.width;
				this.blinkBitmap.scaleY = GC.SCREEN_HEIGHT / image.height;
			}

			this.game.skillWantNextClick = true;
		}
	}

	triggerClick(pt)
	{
		if (this.isWaitClick)
		{
			this.clickPt = pt;
			this.isWaitClick = false;
			this.blinkBitmap.visible = false;
			this.blinkTween.setPaused(true);

			//开始技能
			this.isStarted = true;
			this.startTick = this.game.tick;
			this.endTick = (this.startTick + SKILL_DURATION / res.GraphicConstant.TICK_TIME) | 0;
			this.applyFirst();

		}
	}
	//在技能释放的一开始调用，选中将要爆炸的球
	applyFirst()
	{
		let x0 = this.clickPt.x - this.width / 2;
		let x1 = x0 + this.width;
		for (let ball of this.game.balls)
		{
			if (!ball.isBomb && ball.status === 'normal' &&
				ball.position.x >= x0 && ball.position.x <= x1)
			{
				ball.skillHighlight = true;
			}
		}
	}
	//技能结束的时候调用，炸掉球
	applyFinal()
	{
		let arr = [];
		for (let ball of this.game.balls)
		{
			if (ball.skillHighlight)
			{
				ball.skillHighlight = false;
				if (ball.status === 'normal' && !ball.isBomb)
				{
					arr.push(ball);
				}
			}
		}
		this.game.bombTheBalls(arr);
	}

	showIndicator(percent: number)
	{
		let bitmap = this.effectBitmap;
		bitmap.visible = true;
		if (!bitmap.image)
		{
			let image = bitmap.image = this.game.getImage('images/Skill/技能范围指示器.png');
			bitmap.regX = image.width / 2;
			bitmap.regY = 0;
			bitmap.scaleX = this.width / image.width;
		}
		bitmap.x = this.clickPt.x;
		bitmap.scaleY = (percent * GC.SCREEN_HEIGHT) / bitmap.image.height;
	}

	hideIndicator()
	{
		this.effectBitmap.visible = false;
	}
}