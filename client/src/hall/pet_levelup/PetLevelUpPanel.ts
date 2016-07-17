import {HallUI} from "../HallUI"
import {PetLevelUpEntry} from "./PetLevelUpEntry"
import {GameLink} from "../../GameLink"
import {PetScoreChangeScene} from "./PetScoreChangeScene"
const PROGRESS_ANIM_TIME = 2; //涨经验动画时间的长度

export class PetLevelUpPanel
{
	static SAMPLE_DATA = [
		{ pet: 0, num: 30, from: 1.1, to: 1.1 },
		{ pet: 1, num: 31, from: 2.1, to: 3.5 },
		{ pet: 2, num: 32, from: 1.9, to: 3.1 },
		{ pet: 3, num: 33, from: -1, to: -1 },
		{ pet: 4, num: 34, from: -1, to: -1 },
	];

	spr: createjs.Container = new createjs.Container();

	onAnimationEnd: Function;

	private delay = 6;//这个东西显示时间多长（秒）
	private _pendingScoreChangeAnimation: any[] = [];
	private _entries: PetLevelUpEntry[] = [];
	constructor(petLevelUpInfo: {
		pet: number,
		num: number,
		from: number,
		to: number
	}[])
	{
		let i = 0;
		let maxProgress = 0;
		let speed = 1;
		for (let info of petLevelUpInfo)
		{
			if (info.from >= 0)
			{
				let pp = Math.abs(info.to - info.from);
				if (pp > maxProgress) maxProgress = pp;
			}
		}

		if (maxProgress > 0)
		{
			speed = maxProgress / PROGRESS_ANIM_TIME;
		}

		for (let info of petLevelUpInfo)
		{
			let e = this._create(i, info, speed);
			this.spr.addChild(e.spr);
			this._entries.push(e);
			++i;

			if (info.from >= 1 && info.to >= 1 && (info.from | 0) !== (info.to | 0))
			{
				this._pendingScoreChangeAnimation.push({
					petid: info.pet,
					score1: GameLink.instance.getPetScoreByLevel(info.pet, info.from | 0),
					score2: GameLink.instance.getPetScoreByLevel(info.pet, info.to | 0),
				});
			}
		}

		window.setTimeout(() => this._checkScoreChangeAnimation(), this.delay * 1000);

	}
	//往上收起的动画开始播放
	private _startHide()
	{
		for (let c of this._entries)
		{
			c['_startHideAnimation']();
		}
	}
	//检查是否还有，升级动画
	private _checkScoreChangeAnimation()
	{
		//如果没有了
		if (this._pendingScoreChangeAnimation.length === 0)
		{
			//则播放收起的动画
			this._startHide();
			//然后结束自己
			setTimeout(() =>
			{
				this._close();
			}, 300);
			return;
		}
		let obj = this._pendingScoreChangeAnimation.shift();
		let cc = new PetScoreChangeScene(obj.petid, obj.score1, obj.score2);
		this.spr.addChild(cc.spr);
		cc.onAnimationEnd = () => this._checkScoreChangeAnimation();
	}

	private _create(i: number, info: any, speed: number)
	{
		const DELAY = 0.4;
		const SHOW_DELAY_SPAN = 0.03;//延迟的间隔
		const SHOW_ANIM = 0.2;       //显示出来的动画
		const HIDE_ANIM = 0.2;
		const x = 640 / 2;
		const y = 150 + 142 * i;

		info.delay = DELAY;
		info.speed = speed;
		let e = new PetLevelUpEntry(info);
		e.spr.set({ x, y });
		e.spr.set({ scaleX: 0, scaleY: 0 });
		let twn = createjs.Tween.get(e.spr);
		twn.wait(SHOW_DELAY_SPAN * i * 1000);
		twn.to({ scaleX: 1, scaleY: 1 }, SHOW_ANIM * 1000, createjs.Ease.backOut);
		twn.wait((PROGRESS_ANIM_TIME + 1) * 1000);

		//twn.to({ y: y - 200, alpha: 0 }, HIDE_ANIM * 1000, createjs.Ease.backIn);
		e['_startHideAnimation'] = () =>
		{
			//twn.setPaused(false);
			createjs.Tween.get(e.spr).to({ y: y - 200, alpha: 0 }, HIDE_ANIM * 1000, createjs.Ease.backIn);
		}
		return e;
	}
	private _close()
	{
		if (this.spr.parent)
		{
			this.spr.parent.removeChild(this.spr);
			if (this.onAnimationEnd)
			{
				this.onAnimationEnd();
			}
			this.onAnimationEnd = null;
		}
	}
}