import {HallUI} from "../HallUI"
import {OneFriendEntry} from "../friend/OneFriendEntry"
import * as GameUtil from "../game/GameUtil"
import * as util from "../util"
import {ImageButton} from "../../ImageButton"
import * as share from "../../ShareFunctions"
import {GraphicConstant as GC} from "../../resource"
export class HighScorePositionUpAnimation
{
	spr = new createjs.Container();
	private _onAnimationEnd: Function;
	private _animEnd = false;
	constructor(obj: {
		me: any,
		friend: any,
		oldScore: number,
		newScore: number,
		oldIndex: number,
		newIndex: number,
		onAnimationEnd?: Function
	})
	{
		let spr = this.spr;

		let mask = new createjs.Shape()
		{
			let g = mask.graphics;
			g.beginFill('rgba(0,0,0,0.7)');
			g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
			g.endFill();
		}
		spr.addChild(mask);

		obj.friend.index = obj.newIndex + 1;
		let friendEntry = new OneFriendEntry();
		friendEntry.spr.mouseChildren = false;
		friendEntry.spr.regX = friendEntry.width / 2;
		friendEntry.spr.regY = friendEntry.height / 2;
		friendEntry.spr.x = 320;
		friendEntry.spr.y = 541;
		friendEntry.setFriendInfo(obj.friend);
		spr.addChild(friendEntry.spr);


		obj.me.index = obj.oldIndex;
		obj.me.score = obj.oldScore;
		let selfEntry = new OneFriendEntry();
		selfEntry.spr.mouseChildren = false;
		selfEntry.spr.regX = selfEntry.width / 2;
		selfEntry.spr.regY = selfEntry.height / 2;
		selfEntry.spr.x = 320;
		selfEntry.spr.y = 676;
		selfEntry.setFriendInfo(obj.me);
		spr.addChild(selfEntry.spr);

		var shareButton = new ImageButton(HallUI.getImage('hall/share_button_text2'));
		shareButton.set({ x: 320, y: 685 });
		shareButton.visible = false;
		spr.addChild(shareButton);
		shareButton.onClick = () =>
		{
			share.share();
			this.onClick();
		}
		createjs.Tween.get(selfEntry.spr).wait(1000).to({ y: 373 }, 1000, createjs.Ease.getBackOut(1.5)).call(() =>
		{
			obj.me.index = obj.newIndex;
			obj.me.score = obj.newScore;
			selfEntry.setFriendInfo(obj.me);
		}).to({ scaleX: 1.1, scaleY: 1.1 }, 400).call(() =>
		{
			//发光特效
			let image = HallUI.getImage('hall/position_up_light_effect');
			let bitmap = new createjs.Bitmap(image);
			bitmap.set({
				regX: image.width / 2,
				regY: image.height / 2,
				x: selfEntry.spr.x,
				y: selfEntry.spr.y,
				scaleX: selfEntry.spr.scaleX,
				scaleY: selfEntry.spr.scaleY
			});
			bitmap.alpha = 0;
			spr.addChildAt(bitmap, spr.getChildIndex(selfEntry.spr));
			createjs.Tween.get(bitmap).to({ alpha: 1 }, 300).call(() =>
			{
				this._animEnd = true;
				shareButton.visible = true;
				setTimeout(() => this.close(), 10 * 1000);
			});

			//文字
			let textSpr = this._createPositionUpText(obj.oldIndex - obj.newIndex);
			spr.addChild(textSpr);
			textSpr.set({ x: 329, y: 240, alpha: 0 });
			createjs.Tween.get(textSpr).to({ alpha: 1 }, 200);
		});
		mask.addEventListener('mousedown', () => this.onClick());
		this._onAnimationEnd = obj.onAnimationEnd;
	}

	private _createPositionUpText(n)
	{
		var spr = new createjs.Text(`周排名上升${n}`, '30px SimHei', "white");
		/*
		let spr = new createjs.Container();
		let digits = util.cutRowImages(HallUI.getImage('hall/position_up_digits'), 10);
		let x = 0;
		{
			let image = HallUI.getImage('hall/position_up_text');
			let bitmap = new createjs.Bitmap(image);
			spr.addChild(bitmap);
			x += image.width;
		}
		{
			let bitmaps = GameUtil.createDigitBitmap(n | 0, digits, false);
			let offset = 0;
			if (bitmaps.length > 0)
			{
				let lastX = x;
				offset = -bitmaps[0].x;
				for (let bmp of bitmaps)
				{
					bmp.x += offset + x;
					bmp.y = 0;
					spr.addChild(bmp);
					lastX = bmp.x + bmp.image.width;
				}
				x = lastX;
			}
		}
		{
			let image = HallUI.getImage('hall/position_up_arrow');
			let bitmap = new createjs.Bitmap(image);
			bitmap.set({ x: x, y: 0 });
			spr.addChild(bitmap);
		}*/
		return spr;
	}
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