import {HallUI} from "./HallUI"
import {ImageButton} from "../ImageButton"
import {GameLink} from "../GameLink"

export class HeartBarUI
{
	spr: createjs.Container = new createjs.Container();

	private FULL_HEART = HallUI.instance.getImage('hall/full_heart');
	private EMPTY_HEART = HallUI.instance.getImage('hall/empty_heart');
	private _heartBitmaps: createjs.Bitmap[] = [];
	private _heartText: createjs.Text;
	private _btnAddHeart: ImageButton;
	private _btnMail: ImageButton;


	private _mailTip: createjs.Bitmap;
	private _mailCount: createjs.Text;

	private _isClock = false;
	private _clockStartTime = 0;
	private _countDownTime = 0;
	constructor()
	{
		//create hearts
		{
			let x = 0;
			let y = -3;
			const HEART_SPAN = 60;//this.FULL_HEART.width + 10;
			for (let i = 0; i < 5; ++i)
			{
				let bitmap = new createjs.Bitmap(this.EMPTY_HEART);
				bitmap.x = x + HEART_SPAN * i;
				bitmap.y = y;
				this._heartBitmaps.push(bitmap);
				this.spr.addChild(bitmap);
			}
		}
		//some bg
		//let bg_panel = new createjs.Bitmap(HallUI.instance.getImage('hall/heart_text_bg'));
		//bg_panel.set({ x: 317, y: 0 });
		//this.spr.addChild(bg_panel);

		let _heartText = this._heartText = new createjs.Text('00:00', '22px SimHei', 'white');
		_heartText.set({ x: 377, y: 10 });
		_heartText.textAlign = 'right';
		this.spr.addChild(_heartText);

		let _btnAddHeart = this._btnAddHeart = new ImageButton(HallUI.instance.getImage('hall/add_heart_btn'));
		_btnAddHeart.set({ x: 479 - 80, y: 20 });
		this.spr.addChild(_btnAddHeart);
		_btnAddHeart.onClick = () =>
		{
			HallUI.instance.showBuyHeart();
		}
		let _btnMail = this._btnMail = new ImageButton(HallUI.instance.getImage('hall/mail'));
		_btnMail.set({ x: 457, y: 23 });
		this.spr.addChild(_btnMail);
		_btnMail.onClick = () =>
		{
			HallUI.instance.showMailPanel();
		}
		//mail count tip
		{
			let mailTip = this._mailTip = new createjs.Bitmap(HallUI.getImage('hall/mail/tip'));
			mailTip.set({ x: 5, y: -40 });
			mailTip.scaleX = mailTip.scaleY = 0.9;
			mailTip.mouseEnabled = false;
			_btnMail.addChild(mailTip);

			let mailCount = this._mailCount = new createjs.Text('88', '22px SimHei', 'white');
			mailCount.set({ x: 23, y: -33 });
			mailCount.textAlign = 'center';
			_btnMail.addChild(mailCount);
		}

		this.spr.set({ x: 80, y: 222 });
		this.spr.addEventListener('tick', () => this.tick());

		this.setHeartCount(3);
		this.setCountDown(2 * 3600 * 1000);

		this.setMailCount(0);
	}

	setMailCount(n)
	{
		if (n > 0)
		{
			this._mailTip.visible = true;
			this._mailCount.visible = true;
			this._mailCount.text = n.toString();
		}
		else
		{
			this._mailTip.visible = false;
			this._mailCount.visible = false;
		}
	}

	setHeartCount(n)
	{
		for (let i = 0; i < 5; ++i)
		{
			this._heartBitmaps[i].image = i < n ? this.FULL_HEART : this.EMPTY_HEART;
		}
	}
	//一个心往上飘的动画。游戏开始的时候放一下，表示失去了一颗心
	playMinusHeartAnimation(callback?: Function)
	{
		let heart: createjs.Bitmap;
		if (GameLink.instance.heart > 5)
		{
			heart = new createjs.Bitmap(this.FULL_HEART);
			heart.set({
				x: 390, y: 17,
				regX: this.FULL_HEART.width / 2,
				regY: this.FULL_HEART.height / 2
			});
		}
		else if (GameLink.instance.heart > 0)
		{
			heart = this._heartBitmaps[GameLink.instance.heart - 1].clone();
			this._heartBitmaps[GameLink.instance.heart - 1].image = this.EMPTY_HEART;
		}
		this.spr.addChild(heart);
		heart.alpha = 1;
		let pt = this.spr.globalToLocal(326, 892);
		createjs.Tween.get(heart).to({ y: heart.y - 50 }, 300).to({
			x: pt.x, y: pt.y
		}, 500, createjs.Ease.cubicIn).wait(200).call(() =>
		{
			heart.parent.removeChild(heart);
			if (callback) callback();
		})
	}

	setExtraHeartCount(n)
	{
		this._isClock = false;
		this._heartText.text = n;
	}

	/**设置倒计时，单位：毫秒*/
	setCountDown(n: number)
	{
		this._isClock = true;
		this._countDownTime = n;
		this._clockStartTime = Date.now();
	}

	show(isShow: boolean = true)
	{
		this.spr.visible = isShow;
	}

	refresh()
	{
		let link = GameLink.instance;
		this.setHeartCount(link.heart)
		if (link.nextHeartTime > 0)
		{
			this.setCountDown(link.nextHeartTime);
		}
		else
		{
			this.setExtraHeartCount(link.heart >= 5 ? link.heart - 5 : 0);
		}
	}
	private _refreshSent = false;
	tick()
	{
		if (this._isClock)
		{

			let now = Date.now();
			let remainTime = this._clockStartTime + this._countDownTime - now;

			if (remainTime <= 0)
			{
				this._heartText.text = '00:00';
				if (remainTime < -2000 && !this._refreshSent)
				{
					GameLink.instance.sendRefresh();
					this._refreshSent = true;
				}
			}
			else
			{
				this._refreshSent = false;
				let seconds: any = (remainTime / 1000) | 0;
				let minutes: any = (seconds / 60) | 0;
				let hours: any = (minutes / 60) | 0;

				minutes = minutes % 60;
				seconds = seconds % 60;
				if (minutes < 10) minutes = '0' + minutes.toString();
				if (seconds < 10) seconds = '0' + seconds.toString();
				let mm = remainTime % 1000;
				let mark = (mm >= 500 && mm < 1000) ? ':' : ' ';
				this._heartText.text = (minutes + mark + seconds);
			}
		}
	}
}