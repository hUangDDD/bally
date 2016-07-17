import {HallUI} from "../HallUI"
import {ImageButton} from "../../ImageButton"
import * as res from "../../resource"
export class ConfirmDialog
{
	spr = new createjs.Container();
	_onOk: Function;
	_onCancel: Function;
	_text: createjs.Text;
	_btnok: ImageButton;
	_btncancel: ImageButton;

	_defaultOkImage: any;
	_defaultCancelImage: any;
	constructor()
	{
		this.spr.visible = false;
		const ADD = 120;
		//background		
		{
			let shape = new createjs.Shape();
			{
				let g = shape.graphics;
				g.beginFill('rgba(0,0,0,0.8)');
				g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
				g.endFill();
			}
			shape.mouseEnabled = true;
			shape.addEventListener('mousedown', () => { });
			this.spr.addChild(shape);


			let bg = new createjs.Bitmap(HallUI.getImage('hall/dialog_bg'));
			bg.set({
				x: (res.GraphicConstant.SCREEN_WIDTH - bg.image.width) / 2,
				y: 212 + ADD
			});
			this.spr.addChild(bg);


			let title = new createjs.Bitmap(HallUI.getImage('hall/dialog_title'));
			title.x = (res.GraphicConstant.SCREEN_WIDTH - title.image.width) / 2;
			title.y = 76 + 212 + ADD;
			this.spr.addChild(title);
		}
		//test
		{
			let text = new createjs.Text('Some Thing', '30px SimHei', 'white');
			text.set({ x: 140, y: 372 + ADD });
			this._text = text;
			text.lineHeight = 30;
			this.spr.addChild(text);
		}
		//buttons
		{
			this._defaultOkImage = HallUI.getImage('hall/ok_button');
			let btnok = new ImageButton(HallUI.getImage('hall/ok_button'));
			btnok.set({ x: 454, y: 511 + ADD });
			this.spr.addChild(btnok);

			this._defaultCancelImage = HallUI.getImage('hall/return_button');
			let btncancel = new ImageButton(this._defaultCancelImage);
			btncancel.set({ x: 202, y: 511 + ADD });
			this.spr.addChild(btncancel);

			btnok.onClick = () =>
			{
				if (this._onOk) this._onOk();
				else this.hide();
			};
			btncancel.onClick = () =>
			{
				if (this._onCancel) this._onCancel();
				else this.hide();
			};
			this._btnok = btnok;
			this._btncancel = btncancel;
		}
	}

	show(text: string, onOk?: Function, onCancel?: Function, config?)
	{
		this.spr.visible = true;
		this._text.text = text;
		this._onOk = onOk;
		this._onCancel = onCancel;
		this._btnok.image = (config && config.okImage) || this._defaultOkImage;
		this._btncancel.image = (config && config.cancelImage) || this._defaultCancelImage;
	}

	hide()
	{
		this.spr.visible = false;
		this._onOk = null;
		this._onCancel = null;
	}
}