import {HallUI} from "./HallUI"
import {ImageButton} from "../ImageButton"
import {GameLink} from "../GameLink"
/*
let BASE_POS = { x: 0, y: 810  + 150 };
let LEFT_POS = { x: 107, y: 81 };
let CENTER_POS = { x: 323, y: 81 };
let RIGHT_POS = { x: 538, y: 81 };
export class BottomBarUI
{
	spr = new createjs.Container();

	onButtonClick: (buttonName: string) => void;

	//private _btnWeeklyTask: ImageButton;
	private _btnMatch:ImageButton;
	private _btnGame: ImageButton;
	private _btnPet: ImageButton;
	private _btnCarry: ImageButton;
	private _btnShop: ImageButton;
	private _btnStart: ImageButton;
	private _shopFreeIcon: createjs.Bitmap;
	private _shopFreeIconAnimation: createjs.Tween;
	//private _weeklyTaskTipAnimation: createjs.Tween;
	private _btnPetLockIcon: createjs.DisplayObject;
	//private _weeklyTaskNewIcon: createjs.DisplayObject;
	constructor()
	{
		this.spr.set(BASE_POS);

		this._btnGame = new ImageButton(HallUI.getImage('hall/center_button'));
		this._btnGame.addIcon(HallUI.getImage('hall/button_text_game'));
		this._btnGame.set(CENTER_POS);
		this.spr.addChild(this._btnGame);

		this._btnMatch = new ImageButton(HallUI.getImage('hall/side_button'));
		this._btnMatch.addIcon(HallUI.getImage('hall/button_text_match'));
		this._btnMatch.set(LEFT_POS);
		this.spr.addChild(this._btnMatch);

		//let newTextIcon = this._btnWeeklyTask.addIcon(HallUI.instance.getImage('hall/new_text_tip'), { x: -55, y: -30 });
		//this._weeklyTaskTipAnimation = createjs.Tween.get(newTextIcon, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
		//this._weeklyTaskNewIcon = newTextIcon;

		this._btnPet = new ImageButton(HallUI.getImage('hall/side_button'));
		let petBitmap = this._btnPet.addIcon(HallUI.getImage('hall/pet0'));
		this._btnPet.set(RIGHT_POS);
		this.spr.addChild(this._btnPet);

		let giftTip = this._btnPet.addIcon(HallUI.getImage('hall/pet_button_tip_when_coin>1w'), { x: 55, y: -36 });
		createjs.Tween.get(giftTip, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
		Object.defineProperty(giftTip, 'visible', {
			get: () =>
			{
				return GameLink.instance && GameLink.instance.coin >= 10000;
			}
		})

		{
			Object.defineProperty(petBitmap, 'image', {
				get: function ()
				{
					let idx = -1;
					idx = GameLink.instance.currentPet;
					return HallUI.instance.getPetImage(idx);
				}
			});
			let y0 = petBitmap.y;
			let y1 = y0 - 20;
			createjs.Tween.get(petBitmap, { loop: true }).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(100).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(5000);
		}

		this._btnPetLockIcon = this._btnPet.addIcon(HallUI.getImage('hall/pet_lock_icon_tip'), { x: 55, y: -0 });

		this._btnCarry = new ImageButton(HallUI.getImage('hall/center_button'));
		this._btnCarry.addIcon(HallUI.getImage('hall/button_text_carry'))
		this._btnCarry.set(CENTER_POS);
		this.spr.addChild(this._btnCarry);

		this._btnShop = new ImageButton(HallUI.getImage('hall/side_button'));
		this._btnShop.addIcon(HallUI.getImage('hall/button_text_shop'))
		this._btnShop.set(RIGHT_POS);
		this.spr.addChild(this._btnShop);

		this._btnStart = new ImageButton(HallUI.getImage('hall/center_button'));
		this._btnStart.addIcon(HallUI.getImage('hall/button_start'));
		this._btnStart.set(CENTER_POS);
		this.spr.addChild(this._btnStart);

		let shopFreeIcon = this._btnShop.addIcon(HallUI.getImage('hall/shop_first_free'));
		shopFreeIcon.set({ x: 50, y: -30 });
		let shopFreeIconAnimation = createjs.Tween.get(shopFreeIcon, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);

		this._shopFreeIcon = shopFreeIcon;
		this._shopFreeIconAnimation = shopFreeIconAnimation;


		let giftTip2 = this._btnShop.addIcon(HallUI.getImage('hall/pet_button_tip_when_coin>1w'), { x: 55, y: -36 });
		createjs.Tween.get(giftTip2, { loop: true }).to({ scaleX: 0.8, scaleY: 0.8 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);
		Object.defineProperty(giftTip2, 'visible', {
			get: () =>
			{
				return GameLink.instance && GameLink.instance.coin >= 10000 && !this._shopFreeIcon.visible;
			}
		})

		//addevent
		this._btnGame.onClick = () => this._onButtonClick('game');
		//this._btnWeeklyTask.onClick = () => this._onButtonClick('weekly_task');
		this._btnMatch.onClick = ()=>this._onButtonClick('match');
		this._btnPet.onClick = () => this._onButtonClick('pet');
		this._btnCarry.onClick = () => this._onButtonClick('carry');
		this._btnShop.onClick = () => this._onButtonClick('shop');
		this._btnStart.onClick = () => this._onButtonClick('start');
		this.showWeeklyTaskNewIcon(false);
	}
	showWeeklyTaskNewIcon(isshow: boolean)
	{
		//this._weeklyTaskNewIcon.visible = isshow;
		//this._weeklyTaskTipAnimation.setPaused(!isshow);
	}
	
	showShopFreeIcon(isshow: boolean)
	{
		this._shopFreeIcon.visible = isshow;
		this._shopFreeIconAnimation.setPaused(!isshow);
	}
	
	show(isShow: boolean = true)
	{
		this.spr.visible = isShow;
	}

	//由HallUI调用，当面板改变的时候
	onPanelTypeChanged(panelType: string)
	{
		if (panelType === 'pet')
		{
			this._btnCarry.visible = true;
			this._btnGame.visible = false;
			this._btnPet.visible = false;
			this._btnShop.visible = true;
			this._btnStart.visible = false;
		}
		else
		{
			this._btnCarry.visible = false;

			this._btnPet.visible = true;
			this._btnShop.visible = false;
			if (panelType === 'ready_game')
			{
				this._btnGame.visible = false;
				this._btnStart.visible = true;
			}
			else
			{
				this._btnGame.visible = true;
				this._btnStart.visible = false;
			}
		}
	}

	private _onButtonClick(name)
	{
		if (this.onButtonClick) this.onButtonClick(name);
	}

	setPetLockIcon(show: boolean)
	{
		this._btnPetLockIcon.visible = show;
	}
}*/