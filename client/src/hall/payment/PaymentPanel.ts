import {HallUI} from "../HallUI"
import {GraphicConstant as GC} from "../../resource"
import {ImageButton} from "../../ImageButton"
import {VerticalScrollPanel} from "../shared/VerticalScrollPanel"
import {BuyCoinEntry} from "./BuyCoinEntry"
import {BuyDiamondEntry} from "./BuyDiamondEntry"
import {BuyHeartEntry} from "./BuyHeartEntry"
import * as PD from "../../shared/PaymentDefine"
import {GameLink} from "../../GameLink"
export class PaymentPanel
{
	spr = new createjs.Container();
	private _listPanel: VerticalScrollPanel;
	private _items: any[];
	private _titleBitmap: createjs.Bitmap;
	private _currentType: string;
	constructor()
	{
		const ADD_TO_Y = 110;
		//black mask
		{
			let bgMask = new createjs.Shape();
			let g = bgMask.graphics;
			g.beginFill('rgba(0,0,0,0.8)');
			g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
			g.endFill();
			this.spr.addChild(bgMask);
			bgMask.addEventListener('mousedown', () => { });
		}

		//background
		{
			let bg = new createjs.Bitmap(HallUI.getImage('hall/panel_background'));
			bg.set({ x: 35, y: 89 + ADD_TO_Y });
			this.spr.addChild(bg);
		}

		//title text
		{
			let title = new createjs.Bitmap(HallUI.getImage('hall/mail/title'));
			title.set({ x: 640 / 2, y: 215 + ADD_TO_Y });
			this.spr.addChild(title);
			this._titleBitmap = title;
		}
		let extra_height = 0;
		let panel = this._listPanel = new VerticalScrollPanel();
		panel.setVisualizeMask(false);
		panel.setPos({ x: 49, y: 246 - extra_height + ADD_TO_Y });
		panel.setSize(539, 446 + extra_height);
		this.spr.addChild(panel.spr);

		//close button
		{
			let btnClose = new ImageButton(HallUI.getImage('hall/mail/btnclose'));
			btnClose.set({ x: GC.SCREEN_WIDTH / 2, y: 885 + ADD_TO_Y });
			this.spr.addChild(btnClose);
			btnClose.onClick = () =>
			{
				this.hide();
			}
		}
		this.spr.visible = false;
	}

	private _setItemPanels(items: any[])
	{
		if (this._items)
		{
			for (let item of this._items)
			{
				if (typeof item['clear'] === 'function')
				{
					item['clear']();
				}
				this._listPanel.removeChild(item.spr);
			}
		}
		this._listPanel.position = 0;
		this._listPanel.contentHeight = 0;
		this._items = items;
		if (items.length > 0)
		{
			//const HEIGHT = 112;
			const SPAN = 6;
			let x = 13;
			let y = SPAN;
			for (let i = 0; i < items.length; ++i)
			{
				this._listPanel.addChild(items[i].spr);
				items[i].spr.set({ x: x, y: y });
				y += items[i].height + SPAN;
			}
			this._listPanel.contentHeight = y;
		}

	}
	showAsBuyCoin()
	{
		this._currentType = 'BuyCoin';
		let image = this._titleBitmap.image = HallUI.getImage('hall/payment/buy_coin_title');
		this._titleBitmap.set({
			regX: image.width / 2,
			regY: image.height / 2
		});
		let arr = [];
		for (let d of PD.BUY_COIN_DEFINE)
		{
			let entry = new BuyCoinEntry();
			entry.setContent(d);
			arr.push(entry);
		}
		this._setItemPanels(arr);
		this.spr.visible = true;
	}
	showAsBuyDiamond()
	{
		this._moveUp();
		this._currentType = 'BuyDiamond';
		let image = this._titleBitmap.image = HallUI.getImage('hall/payment/buy_diamond_title');
		this._titleBitmap.set({
			regX: image.width / 2,
			regY: image.height / 2
		});
		let arr = [];
		for (let d of PD.BUY_DIAMOND_DEFINE)
		{
			if (d.onlyonce)
			{
				if (GameLink.instance.boughtItems && GameLink.instance.boughtItems.indexOf(d.id) >= 0)
				{
					continue;
				}
			}
			let entry = new BuyDiamondEntry();
			entry.setContent(d);
			arr.push(entry);
		}
		this._setItemPanels(arr);
		this.spr.visible = true;
	}
	showAsBuyHeart()
	{
		this._currentType = 'BuyHeart';
		let image = this._titleBitmap.image = HallUI.getImage('hall/payment/buy_heart_title');
		this._titleBitmap.set({
			regX: image.width / 2,
			regY: image.height / 2
		});
		let arr = [];
		for (let d of PD.BUY_HEART_DEFINE)
		{
			let entry = new BuyHeartEntry();
			entry.setContent(d);
			arr.push(entry);
		}
		this._setItemPanels(arr);
		this.spr.visible = true;
	}

	private _moveUp()
	{
		if (this.spr.parent)
		{
			let idx = this.spr.parent.numChildren - 1;
			this.spr.parent.setChildIndex(this.spr, idx);
		}
	}
	hide()
	{
		this.spr.visible = false;
	}

	refresh()
	{
		if (this.spr.visible)
		{
			if (typeof this['showAs' + this._currentType] === 'function')
			{
				this['showAs' + this._currentType]();
			}
		}
	}
}