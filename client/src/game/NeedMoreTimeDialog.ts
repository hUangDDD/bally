import {HallUI} from "../hall/HallUI"
import {GraphicConstant as GC} from "../resource"
import {ImageButton} from "../ImageButton"
import {GameLink} from "../GameLink"
import {ConfirmDialog} from "../hall/confirm_dialog/ConfirmDialog"
export class NeedMoreTimeDialog
{
	spr = new createjs.Container();
	private _diamondText: createjs.Text;

	constructor(game)
	{
		let mask = new createjs.Shape();
		{
			let g = mask.graphics;
			g.beginFill('rgba(0,0,0,0.5)');
			g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
			g.endFill();
		}
		this.spr.addChild(mask);

		//background
		let bg = new createjs.Bitmap(HallUI.getImage('hall/dialog_bg'));
		bg.set({ x: 45, y: 266 });
		this.spr.addChild(bg);

		//title
		let title = new createjs.Bitmap(game.getImage('more_time_title'));
		title.set({ x: 270, y: 340 });
		this.spr.addChild(title);

		//text1
		let text1 = new createjs.Bitmap(game.getImage('more_time_text1'));
		text1.set({ x: 148, y: 414 });
		this.spr.addChild(text1);

		//text2
		let text2 = new createjs.Bitmap(game.getImage('more_time_text2'));
		text2.set({ x: 69, y: 467 });
		this.spr.addChild(text2);

		let btnGiveUp = new ImageButton(game.getImage('more_time_giveup'));
		btnGiveUp.set({ x: 221, y: 588 });
		this.spr.addChild(btnGiveUp);
		btnGiveUp.onClick = () => this._onClickGiveUp();

		let btnNeed = new ImageButton(game.getImage('more_time_need'));
		btnNeed.set({ x: 426, y: 588 });
		this.spr.addChild(btnNeed);
		btnNeed.onClick = () => this._onClickNeed();

		this._diamondText = new createjs.Text('999', '23px SimHei', 'white');
		this._diamondText.set({
			x: 278, y: 494,
			textAlign: 'right'
		});
		this.spr.addChild(this._diamondText);
	}
	private _onOk;
	private _onCancel;
	show(onOk, onCancel)
	{
		this._diamondText.text = GameLink.instance.diamond.toString();
		this._onOk = onOk;
		this._onCancel = onCancel;
	}

	private _onClickGiveUp()
	{
		if (this._onCancel) this._onCancel();
		this._close();
	}

	private _onClickNeed()
	{
		if (GameLink.instance.diamond < 5)
		{
			let dlg = new ConfirmDialog();
			dlg.show('钻石不足');
			this.spr.addChild(dlg.spr);
			return;
		}
		if (this._onOk) this._onOk();
		this._close();
	}

	private _close()
	{
		if (this.spr.parent)
		{
			this.spr.parent.removeChild(this.spr);
		}
	}
}