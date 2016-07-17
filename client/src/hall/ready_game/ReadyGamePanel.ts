import {HallUI} from "../HallUI"
import * as GameItemDefine from "../GameItemDefine"
import {SoundManager} from "../../SoundManager"
import {ImageButton} from "../../ImageButton"
const BASE_POS = { x: 17, y: 202 - 14 };
export class ReadyGamePanel
{
	spr = new createjs.Container();
	private _items: any[] = [];
	constructor()
	{
		let background = new createjs.Bitmap(HallUI.getImage('hall/friend_panel_background'));
		background.set(BASE_POS);
		this.spr.addChild(background);

		let title_text = new createjs.Bitmap(HallUI.getImage('hall/game_item_title_text'));
		title_text.set({
			regX: title_text.image.width / 2,
			x: 320,
			y: 302
		});
		this.spr.addChild(title_text);

		let bg2 = new createjs.Bitmap(HallUI.getImage('hall/game_ready_item_bg'));
		bg2.set({ x: 44, y: 341 });
		this.spr.addChild(bg2);

		let cover = new createjs.Bitmap(HallUI.getImage('hall/panel_conver'));
		cover.set({ x: 44, y: 293 });
		this.spr.addChild(cover);
		//let readyTextImage = new createjs.Bitmap(HallUI.getImage('hall/ready_text'));
		//readyTextImage.set({
		//	x: BASE_POS.x + 214,
		//	y: BASE_POS.y + 95
		//});
		//this.spr.addChild(readyTextImage);


		//let bgbg = new createjs.Bitmap(HallUI.getImage('hall/friend_background'));
		//bgbg.set({
		//	x: BASE_POS.x + 24,
		//	y: BASE_POS.y + 162
		//});
		//this.spr.addChild(bgbg);

		//let text2 = new createjs.Bitmap(HallUI.getImage('hall/game_item_sel_text'));
		//text2.set({
		//	x: BASE_POS.x + 180,
		//	y: BASE_POS.y + 200
		//});
		//this.spr.addChild(text2);

		for (let i = 0; i < 8; ++i)
		{
			let item = this._createItem(i, GameItemDefine.GAME_ITEM_DEFINES[i]);
			this._items.push(item);
			this.spr.addChild(item);
			item.onClick = () =>
			{
				this._onClickItem(i);
				this._save();
			};
		}

		//let btn = new ImageButton(HallUI.getImage('hall/game_item_help_button'));
		//btn.set({ x: 459, y: 316 });
		//this.spr.addChild(btn);
		//btn.onClick = () => HallUI.instance.showGameItemHelp();
	}
	private _onClickItem(idx)
	{
		this._items[idx].setSelect(!this._items[idx].isSelected)
	}
	private _save()
	{
		localStorage.setItem('__selected_game_item', JSON.stringify(this.getSelectItems()));
	}

	private _load()
	{
		let arr;
		try
		{
			arr = JSON.parse(localStorage.getItem('__selected_game_item'));
		}
		catch (e)
		{

		}
		if (Array.isArray(arr))
		{
			for (let i = 0; i < this._items.length; ++i)
			{
				let obj = GameItemDefine.GAME_ITEM_DEFINES[i];
				if (obj && arr.indexOf(obj.type) >= 0)
				{
					this._items[i].setSelect(true);
				}
				else
				{
					this._items[i].setSelect(false);
				}
			}
		}
	}
	show(isShow: boolean = true)
	{
		if ((isShow && !this.spr.visible) || !isShow)
		{
			//this.clearSelect();
			this._load();
		}
		this.spr.visible = isShow;
	}

	clearSelect()
	{
		this._items.forEach(item =>
		{
			item.setSelect(false);
		});
	}

	getSelectItems(): string[]
	{
		let ret = [];
		for (let i = 0; i < this._items.length; ++i)
		{
			if (this._items[i].isSelected)
			{
				let obj = GameItemDefine.GAME_ITEM_DEFINES[i];
				if (obj)
				{
					ret.push(obj.type);
				}
			}
		}
		return ret;
	}

	_createItem(i, obj?): any
	{
		/*
		let c = new createjs.Container();
		let bgImage = obj ? HallUI.getImage('hall/game_item_background') : HallUI.getImage('hall/game_item_empty_background');
		let selBgImage = obj ? HallUI.getImage('hall/game_item_background_sel') : null;
		let background = new createjs.Bitmap(bgImage);
		let icon;
		if (obj)
		{
			icon = new createjs.Bitmap(HallUI.getImage('hall/game_item_' + i));
		}
		let price_bg = new createjs.Bitmap(HallUI.getImage('hall/game_item_price_background'))
		price_bg.set({ x: -20, y: 106 });

		let price_text = new createjs.Text('11', '28px SimHei', 'white');
		price_text.textAlign = 'center';
		price_text.text = obj ? obj.price : '';
		price_text.set({ x: 62, y: 120 });

		c.addChild(background);
		if (icon) c.addChild(icon);
		c.addChild(price_bg);
		c.addChild(price_text);

		if (obj)
		{
			let mark = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_prize1'));
			mark.x = -15;
			mark.y = 108;
			c.addChild(mark);
		}

		c['isSelected'] = false;
		c['setSelect'] = function (sel)
		{
			if (obj)
			{
				background.image = sel ? selBgImage : bgImage;
			}
			this.isSelected = sel;
		}

		const X = 77;
		const Y = 375;
		const X_SPAN = 135;
		const Y_SPAN = 163;
		c.x = X + (i % 4) * X_SPAN;
		c.y = Y + (i > 3 ? Y_SPAN : 0);
		*/
		let c = new createjs.Container();
		if (obj)
		{
			var image_sel = HallUI.getImage('hall/game_item_' + i + '_sel');
			var image_blur = HallUI.getImage('hall/game_item_' + i);
			var button = new ImageButton(image_blur);
			button.onClick = () =>
			{
				if (c['onClick'])
				{
					c['onClick']();
				}
			}

			c['isSelected'] = false;
			c['setSelect'] = function (sel)
			{
				button.image = sel ? image_sel : image_blur;
				this.isSelected = sel;
			}
			button.x = image_sel.width / 2;
			button.y = image_sel.height / 2;
			c.addChild(button);
		}
		else
		{
			c['isSelected'] = false;
			c['setSelect'] = function (sel)
			{
				//this.isSelected = sel;
			}
			var lockBitmap = new createjs.Bitmap(HallUI.getImage('hall/game_item_locked'));
			c.addChild(lockBitmap);
		}

		let price_bg = new createjs.Bitmap(HallUI.getImage('hall/game_item_price_bg'));
		price_bg.set({ x: 0, y: 146 });
		c.addChild(price_bg);

		if (obj)
		{
			let price_icon = new createjs.Bitmap(HallUI.getImage('hall/game_item_price_icon'));
			price_icon.set({ x: 4, y: 139 });
			c.addChild(price_icon);

			let price_text_image = HallUI.getImage('hall/game_item_price_' + obj.price);
			if (price_text_image)
			{
				let price_text = new createjs.Bitmap(price_text_image);
				price_text.set({ x: 64, y: 156, regX: price_text_image.width / 2 });
				c.addChild(price_text);
			}
		}


		const X = 88;
		const Y = 380;
		const X_SPAN = 122;
		const Y_SPAN = 208;
		c.x = X + (i % 4) * X_SPAN;
		c.y = Y + (i > 3 ? Y_SPAN : 0);
		return c;
	}
}