import {HallUI} from "../HallUI"
import {ImageButton} from "../../ImageButton"
import * as util from "../../util"
import {GameLink} from "../../GameLink"
export class BuyHeartEntry
{
	spr = new createjs.Container();
	width = 0;
	height = 0;
	obj = null;
	private _promoteBitmap: createjs.Bitmap; //bg
	private _promoteBitmap2: createjs.Bitmap;//text

	private _amountText: createjs.Text;
	private _priceText: createjs.Text;
	constructor()
	{
		let background = new createjs.Bitmap(HallUI.getImage('hall/mail/bkg'));
		this.width = background.image.width;
		this.height = background.image.height;
		this.spr.addChild(background);

		//heart icon
		let heart = new createjs.Bitmap(HallUI.getImage('hall/full_heart'));
		heart.set({ x: 24, y: 27 });
		this.spr.addChild(heart);
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

		//price icon (diamond)
		let diamond = new createjs.Bitmap(HallUI.getImage('hall/new_weekly_task_prize1'));
		diamond.set({ x: 215, y: 41 });
		this.spr.addChild(diamond);

		/*this._promoteBitmap = new createjs.Bitmap(HallUI.getImage('hall/payment/promote_yellow_bg'));
		this._promoteBitmap.set({
			regX: this._promoteBitmap.image.width / 2,
			regY: this._promoteBitmap.image.height / 2,
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
	}
	_tempPromotion: createjs.Bitmap;
	_tempPromotionAnimation: createjs.Tween;
	setContent(obj)
	{
		this.obj = obj;
		this._amountText.text = 'x' + util.intToString(obj.heart);
		this._priceText.text = util.intToString(obj.diamond);
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

		if (/_double$/.exec(obj.id))
		{
			if (!this._tempPromotion)
			{
				this._tempPromotion = new createjs.Bitmap(HallUI.getImage('hall/limit_sale_text_tip'));
				this._tempPromotion.set({ regX: this._tempPromotion.image.width / 2, regY: this._tempPromotion.image.height / 2 });
				this._tempPromotion.set({ x: 100, y: 25 });
				this.spr.addChild(this._tempPromotion);

				this._tempPromotionAnimation = createjs.Tween.get(this._tempPromotion, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
			}
			this._tempPromotion.visible = true;
		}
		else
		{
			if (this._tempPromotion)
			{
				this._tempPromotion.visible = false;
			}
		}
	}

	onClick()
	{
		if (this.obj && typeof this.obj.id === 'string')
		{
			GameLink.instance.sendBuyHeart(this.obj.id);
		}
	}

	clear()
	{
		if (this._tempPromotionAnimation)
		{
			this._tempPromotionAnimation.setPaused(true);
		}
	}
}