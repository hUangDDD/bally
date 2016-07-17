import {HallUI} from "../HallUI"
import {GameLink} from "../../GameLink"
import {GraphicConstant as GC} from "../../resource"
import * as util from "../../util"
let digit_images: HTMLCanvasElement[];
export class PetScoreChangeScene
{
	spr = new createjs.Container();
	onAnimationEnd: Function;

	_score2StartX: number;
	_score2StartY: number;
	_score2Image: createjs.Bitmap[] = [];
	_upArrow: createjs.Bitmap;

	_score1: number;
	_score2: number;

	_current_score2 = 0;

	_canClickToClose = false;
	constructor(petid: number, score1: number, score2: number)
	{

		if (!digit_images)
		{
			digit_images = util.cutRowImages(HallUI.getImage('hall/petlv/num_digits'), 10);
		}

		this._score1 = score1 < 0 ? 0 : (score1 | 0);
		this._score2 = score2 < 0 ? 0 : (score2 | 0);

		let mask = new createjs.Shape();
		{
			let g = mask.graphics;
			g.beginFill('rgba(0,0,0,0.5)');
			g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
			g.endFill();
		}
		mask.addEventListener('mousedown', () => this._onClick());
		this.spr.addChild(mask);

		let icon = new createjs.Bitmap(HallUI.instance.getPetImage(petid));
		icon.set({
			regX: icon.image.width / 2,
			regY: icon.image.height / 2,
			x: 320,
			y: 422
		});
		this.spr.addChild(icon);

		const ICON_SHOW_DURATION = 400;
		const SCORE_CHANGE_DURATION = 1000;
		//宠物放大动画
		let iconScaleAnimation = createjs.Tween.get(icon).to({ scaleX: 2.5, scaleY: 2.5 }, ICON_SHOW_DURATION, createjs.Ease.elasticOut);
		//数字变化动画

		let scoreChangeAnimation = createjs.Tween.get(this)
			.wait(iconScaleAnimation.duration)  //等宠物放大结束
			.call(() =>  //开始数字动画
			{
				this._showText();
				this.score2 = this._score1;
			})
			.to({ score2: this._score2 }, SCORE_CHANGE_DURATION)//数字动画过程
			.call(() =>       //动画结束，允许鼠标点击结束
			{
				this._canClickToClose = true;
			}).wait(3000).call(() => this._close());//3秒后自动结束
	}

	private _showText()
	{
		let xx = 77;
		let yy = 574;

		let text = new createjs.Bitmap(HallUI.getImage('hall/petlv/text'));
		text.set({ x: xx, y: yy });
		this.spr.addChild(text);
		xx += text.image.width;
		// 第一个数字
		for (let c of this._score1.toString())
		{
			let bmp = new createjs.Bitmap(digit_images[parseInt(c)]);
			bmp.set({ x: xx, y: yy + 5 });
			this.spr.addChild(bmp);
			xx += bmp.image.width;
		}
		//→
		let right_arrow = new createjs.Bitmap(HallUI.getImage('hall/petlv/right_arrow'));
		right_arrow.set({ x: xx, y: yy + 12 });
		this.spr.addChild(right_arrow);
		xx += right_arrow.image.width;

		this._score2StartX = xx;
		this._score2StartY = yy;
	}

	get score2() { return this._current_score2; }
	set score2(val)
	{
		this._current_score2 = val;
		this._setScore2(val);
	}

	private _setScore2(n: number)
	{
		if (typeof this._score2StartX === 'undefined') return;
		let ss = n < 0 ? '0' : (n | 0).toString();
		let arr = this._score2Image;
		if (ss.length !== arr.length)
		{
			for (let c of arr)
			{
				this.spr.removeChild(c);
			}

			arr.length = 0;
			for (let i = 0; i < ss.length; ++i)
			{
				let c = new createjs.Bitmap(null);
				arr.push(c);
				this.spr.addChild(c);
			}
		}
		let xx = this._score2StartX;
		let yy = this._score2StartY;
		for (let i = 0; i < arr.length; ++i)
		{
			arr[i].image = digit_images[parseInt(ss[i])];
			arr[i].x = xx;
			arr[i].y = yy + 5;
			xx += arr[i].image.width;
		}
		if (!this._upArrow)
		{
			this._upArrow = new createjs.Bitmap(HallUI.getImage('hall/petlv/up_arrow'));
			this.spr.addChild(this._upArrow);
		}
		this._upArrow.x = xx;
		this._upArrow.y = yy;
	}

	private _onClick()
	{
		if (this._canClickToClose)
		{
			this._close();
		}
	}

	private _close()
	{
		if (this.spr.parent)
		{
			this.spr.parent.removeChild(this.spr);
			if (this.onAnimationEnd) this.onAnimationEnd();
			this.onAnimationEnd = null;
		}
	}
}

window['testme'] = function ()
{
	window['stage'].stage.addChild(new PetScoreChangeScene(0, 567, 1024).spr);
}