import {HallUI} from "../HallUI"
import {ImageButton} from "../../ImageButton"
import * as util from "../../util"
import {GameLink} from "../../GameLink"
export class BuyDiamondEntry
{
	spr = new createjs.Container();
	width = 0;
	height = 0;
	obj = null;
	private _promoteBitmap: createjs.Bitmap; //bg
	private _promoteBitmap2: createjs.Bitmap;//text

	private _amountText: createjs.Text;
	private _priceText: createjs.Text;
	private _onceTag: createjs.Bitmap;
	constructor()
	{
		let background = new createjs.Bitmap(HallUI.getImage('hall/mail/bkg'));
		this.width = background.image.width;
		this.height = background.image.height;
		this.spr.addChild(background);

		//diamond icon
		let diamond = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_prize0'));
		diamond.set({ x: 24, y: 27 });
		this.spr.addChild(diamond);
		//amount text
		this._amountText = new createjs.Text('x198,564', '24px SimHei', '#142d3e');
		this._amountText.set({ x: 75, y: 58 });

		/*{
			let text = this._amountText;
			let outline = text.clone();
			outline.outline = 3;
			outline.color = 'white';
			Object.defineProperty(outline, 'text', { get: () => text.text });
			this.spr.addChild(outline);
		}*/
		this.spr.addChild(this._amountText);

		//price bg
		let price_bg = new createjs.Bitmap(HallUI.getImage('hall/game_item_price_background'));
		price_bg.set({ x: 216, y: 42 });
		this.spr.addChild(price_bg);

		//price text
		this._priceText = new createjs.Text('900', '25px SimHei', 'white');
		this._priceText.set({ x: 282, y: 51 });
		this._priceText.textAlign = 'center';
		this.spr.addChild(this._priceText);


		/*this._promoteBitmap = new createjs.Bitmap(HallUI.getImage('hall/payment/promote_red_bg'));
		this._promoteBitmap.set({
			//regX: this._promoteBitmap.image.width / 2,
			//regY: this._promoteBitmap.image.height / 2,
			x: 89 + 100,
			y: 6
		});
		this.spr.addChild(this._promoteBitmap);*/

		this._promoteBitmap2 = new createjs.Bitmap(HallUI.getImage('hall/payment/promote_20%'));
		this._promoteBitmap2.set({
			//regX: this._promoteBitmap2.image.width / 2,
			//regY: this._promoteBitmap2.image.height / 2,
			x: 325,
			y: 52
		});
		this.spr.addChild(this._promoteBitmap2);



		//button
		let button = new ImageButton(util.scaleImage(HallUI.getImage('hall/payment/buy_button'), 0.8));
		button.set({ x: 440, y: 60 });
		button.onClick = () => this.onClick();
		this.spr.addChild(button);

		//once tag
		let oncetag = new createjs.Bitmap(HallUI.getImage('hall/payment/promote_once'));
		oncetag.set({ x: 386, y: -13 });
		this.spr.addChild(oncetag);
		oncetag.visible = false;
		this._onceTag = oncetag;
	}

	setContent(obj)
	{
		this.obj = obj;
		this._amountText.text = 'x' + util.intToString(obj.diamond);
		this._priceText.text = '￥' + util.intToString(obj.cash) + '.00';
		this._promoteBitmap2.visible = false;
		//this._promoteBitmap.visible = false;
		if (obj.promote)
		{
			let image = HallUI.getImage('hall/payment/promote_' + obj.promote);
			if (image)
			{
				this._promoteBitmap2.set({
					image: image,
					//regX: image.width / 2,
					//regY: image.height / 2,
				});
				this._promoteBitmap2.visible = true;
				//this._promoteBitmap.visible = true;
			}

		}
		this._onceTag.visible = !!obj.onlyonce;
	}

	onClick()
	{
		if (this.obj && typeof this.obj.id === 'string')
		{
			GameLink.instance.sendBuyDiamond(this.obj.id)
		}
	}
}