import {HallUI} from "../HallUI"
import * as GameUtil from "../../game/GameUtil"
import * as util from "../../util"
import {ImageButton} from "../../ImageButton"
import * as share from "../../ShareFunctions"
export class HighScoreUpAnimation
{
	spr = new createjs.Container();
	constructor(obj: {
		scoreFrom: number,
		scoreTo: number,
		type: string,
		onAnimationEnd: Function
	})
	{
		let digits = util.cutRowImages(HallUI.getImage('hall/score/score_chars'), 11);
		let spr = this.spr;
		let mask = new createjs.Shape()
		{
			let g = mask.graphics;
			g.beginFill('rgba(0,0,0,0.7)');
			g.drawRect(0, 0, 640, 1136);
			g.endFill();
		}
		spr.addChild(mask);
		//light effect
		{
			let image = HallUI.getImage('hall/high_score_up_light_effect');
			let bitmap = new createjs.Bitmap(image);
			bitmap.set({
				x: 320, y: 322,
				regX: image.width / 2, regY: image.height / 2
			});
			spr.addChild(bitmap);
		}

		//up arrow
		{
			let image = HallUI.getImage('hall/up_arrow');
			let bitmap = new createjs.Bitmap(image);
			bitmap.set({
				x: 320, y: 421,
				regX: image.width / 2
			});
			spr.addChild(bitmap);
		}

		//up text
		let up_text: createjs.Text;
		{
			let image = HallUI.getImage(obj.type === 'weekly' ? 'hall/weekly_high_score_up_text' : 'hall/historical_high_score_up_text');
			up_text = new createjs.Text(obj.type === 'weekly' ? '周纪录UP' : '历史纪录UP', '40px SimHei', 'white');
			up_text.set({ x: 413, y: 213 });
			spr.addChild(up_text);
			up_text.alpha = 0;
		}

		//from score
		{
			let bitmaps = GameUtil.createDigitBitmap(obj.scoreFrom, digits, true);
			for (let bmp of bitmaps)
			{
				bmp.x += 320;
				bmp.y += 619;
				spr.addChild(bmp);
			}
		}
		//to score
		let toScoreBitmapArray = [];
		function setToScore(score: number)
		{
			score = score | 0;
			for (let bmp of toScoreBitmapArray)
			{
				spr.removeChild(bmp);
			}
			toScoreBitmapArray.length = 0;
			let bitmaps = GameUtil.createDigitBitmap(score, digits, true);
			for (let bmp of bitmaps)
			{
				toScoreBitmapArray.push(bmp);
				bmp.x += 320;
				bmp.y += 358;
				spr.addChild(bmp);
			}
		}

		var shareButton = new ImageButton(HallUI.getImage('hall/share_button_text2'));
		shareButton.set({ x: 320, y: 685 });
		shareButton.visible = false;
		spr.addChild(shareButton);
		shareButton.onClick = () =>
		{
			share.share();
			this.onClick();
		}

		let animObject: any = {};
		animObject._score = obj.scoreFrom;
		Object.defineProperty(animObject, 'score', {
			get: function () { return this._score; },
			set: function (val) { this._score = val; setToScore(val | 0) }
		});
		//分数变化的动画
		createjs.Tween.get(animObject).to({ score: obj.scoreTo }, 600).wait(200).call(() =>
		{
			//第二阶段动画
			createjs.Tween.get(up_text).to({ alpha: 1 }, 500).wait(200).call(() =>
			{
				this._animEnd = true;
				shareButton.visible = true;
				setTimeout(() => this.close(), 10 * 1000);
			});
		});
		this._onAnimationEnd = obj.onAnimationEnd;
		mask.addEventListener('mousedown', () => this.onClick());
	}
	private _animEnd = false;
	private _onAnimationEnd: Function;
	private onClick()
	{
		if (this._animEnd)
		{
			this.close();
		}
	}
	private close()
	{
		if (this.spr.parent)
		{
			if (this._onAnimationEnd) this._onAnimationEnd();
			this.spr.parent.removeChild(this.spr);
		}
	}
}