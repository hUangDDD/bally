import {HallUI} from "../HallUI"
import {ImageButton} from "../../ImageButton"
import * as res from "../../resource"
import * as GD from "../../../shared/GiftDefine"
import {GameLink} from "../../GameLink"
import * as util from "../../util"
import * as PetRules from "../../../shared/PetRules"
import {ProgressBarControl} from "../shared/ProgressBarControl"
import {CutStyleProgressBar} from "../shared/CutStyleProgressBar"
import {SoundManager} from "../../SoundManager"
import {BitmapText} from "../shared/BitmapText"
export class ShopUI
{
	spr = new createjs.Container();
	_giftIcon: createjs.Bitmap;
	_buyButton: ImageButton;
	_priceText: BitmapText;
	constructor()
	{
		this.spr.visible = false;
		//mask
		{
			let shape = new createjs.Shape();
			let g = shape.graphics;
			g.beginFill('rgba(0,0,0,0.8)');
			g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
			g.endFill();
			shape.addEventListener('mousedown', () => { });
			this.spr.addChild(shape);
		}
		//bg
		{
			let bg = new createjs.Bitmap(HallUI.getImage('hall/pet_shop_background'));
			bg.x = 20;
			bg.y = 180;
			this.spr.addChild(bg);
		}

		//gift bg
		{
			let bg = new createjs.Bitmap(HallUI.getImage('hall/pet_shop_gift_icon'));
			bg.x = (res.GraphicConstant.SCREEN_WIDTH - bg.image.width) / 2;
			bg.y = 356;
			this.spr.addChild(bg);
			this._giftIcon = bg;
		}
		//button
		{
			let button = new ImageButton(HallUI.getImage('hall/pet_shop_buy_button'));
			//button.addIcon(HallUI.getImage('hall/button_text_buy'));
			button.x = res.GraphicConstant.SCREEN_WIDTH / 2;
			button.y = 751;

			this.spr.addChild(button);
			this._buyButton = button;
			button.onClick = () => this._onClickBuy();
		}
		//field bg
		{
			let field_bg = new createjs.Bitmap(HallUI.getImage('hall/heart_text_bg'));
			field_bg.x = 268;
			field_bg.y = 642;
			//this.spr.addChild(field_bg);
		}
		//$ icon
		{
			let icon = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_prize1'));
			icon.x = 268;
			icon.y = 646;
			//this.spr.addChild(icon);
		}
		//price text
		{
			//let text = new createjs.Text('30000', '24px SimHei', 'white');
			//text.x = 314;
			//text.y = 656;
			//this.spr.addChild(text);
			//this._priceText = text;
			let text = new BitmapText(BitmapText.buildCharDefines('0123456789', HallUI.getImage('hall/pet_shop_price_chars'), 17, 24));
			text.align = 'center';
			text.set({ x: 50, y: -16 });
			this._buyButton.addDisplayObject(text);
			this._priceText = text;
		}
		//close button
		{
			let btnClose = new ImageButton(HallUI.getImage('hall/return_button'));
			btnClose.set({ x: res.GraphicConstant.SCREEN_WIDTH / 2, y: 1005 });
			this.spr.addChild(btnClose);
			btnClose.onClick = () =>
			{
				this.show(false);
			}
		}
	}

	setIsFree(isFree: boolean)
	{
		if (isFree)
		{
			this._priceText.text = '0';
		}
		else
		{
			this._priceText.text = '10000';
		}

	}

	_lastIcon: createjs.DisplayObject;

	showBuyGiftAnimation(obj)
	{
		let petid = obj.id;
		let isNewPet = false;
		let isShowPetExp = false;
		let petExp1 = 1.2;
		let petExp2 = 2.4;

		if (obj['new'])
		{
			isNewPet = true;
		}

		if (typeof obj.skillExp1 === 'number' && typeof obj.skillExp2 === 'number')
		{
			isShowPetExp = true;
			petExp1 = obj.skillExp1;
			petExp2 = obj.skillExp2;
		}

		let center = { x: 640 / 2, y: 400 };
		let anim_container = new createjs.Container();
		this.spr.addChild(anim_container);

		let mask = new createjs.Shape();
		{
			let g = mask.graphics;
			g.beginFill('rgba(0,0,0,0.8)');
			g.drawRect(0, 0, res.GraphicConstant.SCREEN_WIDTH, res.GraphicConstant.SCREEN_HEIGHT);
			g.endFill();
		}

		anim_container.addChild(mask);
		//一直在抖啊抖的礼物盒子
		let box = new createjs.Bitmap(HallUI.getImage('hall/pet_shop_gift_icon'));
		box.regX = box.image.width / 2;
		box.regY = box.image.height / 2;
		box.x = center.x;
		box.y = center.y;
		anim_container.addChild(box);
		//一直在缩放的“点击”字
		let shake_text = new createjs.Bitmap(HallUI.getImage('hall/click_gift_text'));
		shake_text.regX = shake_text.image.width / 2;
		shake_text.regY = shake_text.image.height / 2;
		shake_text.x = 320;
		shake_text.y = 570;
		anim_container.addChild(shake_text);
		let shake_anim = createjs.Tween.get(box, { loop: true }).to({ y: center.y - 60 }, 200).to({ y: center.y }, 800, createjs.Ease.elasticOut).wait(3000);
		let text_scale_anim = createjs.Tween.get(shake_text, { loop: true }).to({ scaleX: 1.1, scaleY: 1.1 }, 800).to({ scaleX: 1, scaleY: 1 }, 800);

		let spr = this.spr;
		let clickPhase = 0;
		function onClick()
		{
			//if (clicked) { onEnd(); return; }
			if (clickPhase === 0)
			{
				clickPhase = 1;
				shake_anim.setPaused(true);
				text_scale_anim.setPaused(true);
				//图标
				let icon = new createjs.Bitmap(HallUI.instance.getPetImage(petid));
				icon.x = box.x;
				icon.y = box.y;
				icon.regX = icon.image.width / 2;
				icon.regY = icon.image.height / 2;
				icon.scaleX = 0;
				icon.scaleY = 0;
				anim_container.addChild(icon);
				//宠物名字
				let pet_name_text = new createjs.Text(PetRules.PET_NAMES[petid], '33px SimHei', 'white');
				pet_name_text.textAlign = 'center';
				pet_name_text.x = 320;
				pet_name_text.y = 500;
				pet_name_text.visible = false;
				anim_container.addChild(pet_name_text);
				shake_text.visible = false;
				//显示icon
				SoundManager.playEffect('openPet');
				let show_icon_anim = createjs.Tween.get(icon, { paused: true })
					.to({ scaleX: 2, scaleY: 2 }, 200)
					.call(() =>
					{
						pet_name_text.visible = true;
						//new 
						if (isNewPet)
						{
							let newicon = new createjs.Bitmap(HallUI.getImage('hall/new_text_tip'));
							newicon.set({ x: 373, y: 441 });
							anim_container.addChild(newicon);
						}

						if (isShowPetExp)
						{
							let tt = showLevelUpProgress(petExp1, petExp2);
							tt.call(() => { clickPhase = 2; })
						}
						else
						{
							clickPhase = 2;
						}
					})
					.wait(5000)
					.call(onEnd);
				//消失盒子
				createjs.Tween.get(box).to({ scaleX: 0, scaleY: 0 }, 200).call(() => { show_icon_anim.setPaused(false) });
			}
			else if (clickPhase === 2)
			{
				clickPhase = 3;
				onEnd();
			}
		}
		anim_container.addEventListener('mousedown', onClick);

		function onEnd()
		{
			spr.removeChild(anim_container);
		}

		function showLevelUpProgress(s1: number, s2: number)
		{
			let spr = anim_container;
			let text = new createjs.Text('技能等级', '31px SimHei', '#eebe00');
			text.set({ x: 120, y: 576 });
			spr.addChild(text);

			//progress bg
			//let pro_bg = new createjs.Bitmap(HallUI.getImage('pet/levelup_progress_background'));
			//pro_bg.set({ x: 265, y: 580 });
			//anim_container.addChild(pro_bg);

			let progressBg = new createjs.Bitmap(HallUI.getImage('hall/pet_progress_small_bg'));
			progressBg.set({ x: 280, y: 582 });
			spr.addChild(progressBg);

			let progressBar = new CutStyleProgressBar(HallUI.getImage('hall/pet_progress_small'));
			progressBar.set({ x: progressBg.x + 3, y: progressBg.y + 2 });
			progressBar.percent = 0;
			spr.addChild(progressBar);

			let animObj: any = {};
			animObj._value = s1;
			Object.defineProperty(animObj, 'value', {
				get: function ()
				{
					return this._value;
				},
				set: function (value) 
				{
					if ((this._value | 0) !== (value | 0))
					{
						showLevelUpText();
					}
					if (value === null) return;
					this._value = value;

					progressBar.percent = value - (value | 0);
				}
			});

			animObj.value = s1;
			let tween = createjs.Tween.get(animObj).to({ value: s2 }, 1000);
			return tween;
		}

		function showLevelUpText()
		{
			let x0 = 371, x1 = 294;
			let image = HallUI.getImage('pet/levelup_text');
			let text = new createjs.Bitmap(image);
			text.set({
				regX: image.width / 2,
				regY: image.height / 2
			});
			text.set({ x: x0 + text.regX, y: 594 });
			text.alpha = 0;

			createjs.Tween.get(text)
				.to({
					x: x1 + text.regX, alpha: 1
				}, 300, createjs.Ease.cubicOut)
				.wait(300)
				.to({
					alpha: 0,
					scaleY: 0
				}, 100)
				.call(() =>
				{
					anim_container.removeChild(text);
				});

			anim_container.addChild(text);
		}

	}

	show(bShow)
	{
		if (!this.spr.visible && bShow)
		{
			this._giftIcon.visible = true;
			if (this._lastIcon)
			{
				this.spr.removeChild(this._lastIcon);
				this._lastIcon = null;
			}
		}
		this.spr.visible = bShow;
	}

	_onClickBuy()
	{
		GameLink.instance.sendBuyGift(0);
	}


}