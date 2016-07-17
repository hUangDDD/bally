import {HallUI} from "../HallUI"
import {HorizontalPagePanel} from "../shared/HorizontalPagePanel"
import {PetIcon} from "./PetIcon"
import {GraphicConstant as GC} from "../../resource"
import {GameLink, IPetInfo} from "../../GameLink"
import {PetSkillDesc, IPetSkillDesc} from "../../shared/PetSkillDesc"
import {ProgressBarControl} from "../shared/ProgressBarControl"
import {ImageButton} from "../../ImageButton"
import * as PetRules from "../../shared/PetRules"
import {CutStyleProgressBar} from "../shared/CutStyleProgressBar"
import {BitmapText} from "../shared/BitmapText"
const PAGER_HEIGHT = 340;
const PAGER_WIDTH = 475;
const MAX_PET_COUNT = PetRules.MAX_PET_COUNT;
export class PetPanel
{
	spr = new createjs.Container();
	private _pager: HorizontalPagePanel;
	private _icons: PetIcon[] = [];
	private _selected = -1;
	private _currentPet: IPetInfo;
	private _currentPetSkillDesc: IPetSkillDesc;

	//current pet ui
	private _petIcon: createjs.Bitmap;
	private _petName: createjs.Bitmap;
	private _petExpBar: CutStyleProgressBar;
	private _petSkillExpBar: CutStyleProgressBar;
	private _skillDescText: createjs.Text;
	private _petLvText: BitmapText;
	private _petExpPercentText: BitmapText;
	private _petSkillLvText: BitmapText;
	private _petSkillExpPercentText: BitmapText;
	private _skillUpgradeText: createjs.Text;
	constructor()
	{
		//add background
		let background = new createjs.Bitmap(HallUI.getImage('hall/pet_panel_background'));
		background.set({
			x: 31 - 15, y: 201 - 15
		});
		this.spr.addChild(background);


		let pager = this._pager = new HorizontalPagePanel();
		pager.setPageSize(PAGER_WIDTH, PAGER_HEIGHT);
		pager.setPos(80, 472);

		this._createIcons();
		for (let i = 0; i < PetRules.MAX_PET_COUNT; ++i)
		{
			this._icons[i].setPet(i, 0);
		}
		for (let i = PetRules.MAX_PET_COUNT; i < this._icons.length; ++i)
		{
			this._icons[i].setPetUnknown();
		}

		this._petIcon = new createjs.Bitmap(null);
		this._petIcon.set({ x: 160, y: 314 });
		this.spr.addChild(this._petIcon);

		this._petName = new createjs.Bitmap(null);
		this._petName.set({ x: 160, y: 365 });
		this.spr.addChild(this._petName);

		var petExpBarBg = new createjs.Bitmap(HallUI.getImage('hall/pet_progress_big_bg'));
		petExpBarBg.set({ x: 269, y: 289 });
		this.spr.addChild(petExpBarBg);

		this._petExpBar = new CutStyleProgressBar(HallUI.getImage('hall/pet_progress_big'));
		this._petExpBar.set({ x: 271, y: 291 });
		this.spr.addChild(this._petExpBar);

		var petSkillExpBarBg = new createjs.Bitmap(HallUI.getImage('hall/pet_progress_big_bg'));
		petSkillExpBarBg.set({ x: 269, y: 350 + 14 });
		this.spr.addChild(petSkillExpBarBg);

		this._petSkillExpBar = new CutStyleProgressBar(HallUI.getImage('hall/pet_progress_big'));
		this._petSkillExpBar.set({ x: 271, y: 352 + 14 });
		this.spr.addChild(this._petSkillExpBar);

		this._skillDescText = new createjs.Text('', '20px SimHei', 'black');
		this._skillDescText.textAlign = 'center';
		this._skillDescText.set({ x: 320, y: 398 });
		this.spr.addChild(this._skillDescText);

		var text1 = new createjs.Text('宠物等级：', '21px SimHei', '#364f61');
		text1.set({
			x: 277, y: 265
		});
		this.spr.addChild(text1);

		var text2 = new createjs.Text('技能等级：', '21px SimHei', '#364f61');
		text2.set({
			x: 277, y: 321
		});
		this.spr.addChild(text2);

		var text3 = new createjs.Text('升级效果：', '21px SimHei', '#364f61');
		text3.set({ x: 277, y: 342 });
		this.spr.addChild(text3);

		this._skillUpgradeText = new createjs.Text('', '21px SimHei', '#af0000');
		this._skillUpgradeText.set({
			x: 379, y: 342
		});
		this.spr.addChild(this._skillUpgradeText);
		var buildCharDefines = function (chars, image, width, height)
		{

			var charDefines = [];
			var x = 0;
			for (var c of chars)
			{
				charDefines.push({
					char: c,
					image: image,
					sourceRect: new createjs.Rectangle(x, 0, width, height)
				});
				x += width;
			}
			return charDefines;
		}

		//

		var lv_charDefines = buildCharDefines('0123456789/Lv',
			HallUI.getImage('hall/pet_panel_lv_chars'),
			18, 25)

		var exp_charDefines = buildCharDefines('0123456789%',
			HallUI.getImage('hall/pet_panel_exp_chars'),
			19, 19)

		this._petLvText = new BitmapText(lv_charDefines);
		this._petLvText.set({ x: 380, y: 264 });
		this.spr.addChild(this._petLvText);

		this._petExpPercentText = new BitmapText(exp_charDefines);
		this._petExpPercentText.set({ x: 396, y: 294 });
		this._petExpPercentText.align = 'center';
		this.spr.addChild(this._petExpPercentText);

		this._petSkillLvText = new BitmapText(lv_charDefines);
		this._petSkillLvText.set({ x: 380, y: 320 });
		this.spr.addChild(this._petSkillLvText);

		this._petSkillExpPercentText = new BitmapText(exp_charDefines);
		this._petSkillExpPercentText.set({ x: 396, y: 357 + 14 });
		this._petSkillExpPercentText.align = 'center';
		this.spr.addChild(this._petSkillExpPercentText);

		//“未获得” mask
		{
			let mask = new createjs.Shape();
			let g = mask.graphics;
			g.beginFill('rgba(0,0,0,0.8)');
			g.drawRoundRect(46, 251, 551, 182, 20);
			g.endFill();
			this.spr.addChild(mask);
			let isVisible = () => !this._currentPet || this._currentPet.fake;
			Object.defineProperty(mask, 'visible', {
				get: isVisible
			});

			let text = new createjs.Text('暂未获得', '20px SimHei', '#d4cd0c');
			text.set({ textAlign: 'center', x: 520, y: 391 });
			this.spr.addChild(text);
			Object.defineProperty(text, 'visible', {
				get: isVisible
			});
			Object.defineProperty(text, 'text', {
				get: () =>
				{
					if (!this._currentPet) return '暂未开放';
					if (this._currentPet.fake) return '暂未获得';
					return '';
				}
			})
		}


		this.spr.addChild(pager.spr);
		this.setSelect(0);
		this.setCarry(0);
	}
	private _unlockPetIdx = -1;
	onClickPetUnlock()
	{
		if (typeof this._currentPet.unlockPrice === 'number')
		{
			this._unlockPetIdx = this._currentPet.idx;
			HallUI.instance.showConfirmDialog(`是否花费${this._currentPet.unlockPrice}金币解锁宠物的等级`, () =>
			{
				GameLink.instance.sendUnlockPet(this._unlockPetIdx);
				HallUI.instance.closeConfirmDialog();
			})
		}
	}
	setSelect(idx: number)
	{
		var pet = GameLink.instance.getPetInfo(idx) || GameLink.instance.getFakePetInfo(idx);
		let icons = this._icons;
		for (let i = 0; i < icons.length; ++i)
		{
			icons[i].setSelected(i === idx);
		}
		this._selected = idx;
		this._currentPet = pet;
		this._currentPetSkillDesc = PetSkillDesc[PetRules.PET_SKILL[idx]];
		this._refreshCurrentPet();
	}

	getSelect()
	{
		return this._selected;
	}

	setCarry(idx: number)
	{
		let icons = this._icons;
		for (let i = 0; i < icons.length; ++i)
		{
			icons[i].setCarry(i === idx);
		}
	}
	private _refreshCurrentPet()
	{
		var pet = this._currentPet;
		var bpet = !!pet;
		var uiToSetVisible = [
			this._petIcon,
			this._petName,
			this._petExpBar,
			this._petSkillExpBar,
			this._skillDescText,
			this._petLvText,
			this._petExpPercentText,
			this._petSkillLvText,
			this._petSkillExpPercentText,
			this._skillUpgradeText
		];
		for (let ui of uiToSetVisible)
		{
			ui.visible = bpet;
		}
		var toPercentText = function (n)
		{
			return `${(n * 100) | 0}%`;
		}
		if (pet)
		{
			var petIconImage = HallUI.instance.getPetImage(pet.idx);
			this._petIcon.image = petIconImage;
			this._petIcon.regX = petIconImage.width / 2;
			this._petIcon.regY = petIconImage.height / 2;
			var petNameImage = HallUI.instance.getImage('pet_name_' + pet.idx);
			this._petName.image = petNameImage;
			this._petName.regX = petNameImage.width / 2;

			this._petExpBar.percent = pet.exp / pet.expTotal;
			this._petSkillExpBar.percent = pet.skillExp / pet.skillExpTotal;


			var desc = this._currentPetSkillDesc.desc;
			if (typeof desc === 'string')
			{
				this._skillDescText.text = desc;
			}
			else
			{
				this._skillDescText.text = desc[(pet.skill - 1) | 0];
			}


			this._petLvText.text = `${pet.level}/${pet.maxLevel}`;
			this._petExpPercentText.text = toPercentText(pet.exp / pet.expTotal);

			this._petSkillLvText.text = `${pet.skill}/${this._currentPetSkillDesc.maxLevel}`;
			this._petSkillExpPercentText.text = toPercentText(pet.skillExp / pet.skillExpTotal);
			this._skillUpgradeText.text = this._currentPetSkillDesc.upgradeDesc;
		}
	}
	/**创建所有宠物的icon */
	_createIcons()
	{
		let id = 0;
		let onclick = id => this._onClickPet(id);
		for (let i = 0; i < 8; ++i)
		{
			let page = new createjs.Container();
			//icon 的初始位置
			let X = 0;
			let Y = 0;
			let X_SPAN = 122;
			let Y_SPAN = 175;
			for (let i = 0; i < 8; ++i)
			{
				let petIcon = new PetIcon();
				petIcon.id = id++;
				petIcon.spr.set({
					x: X + (i % 4) * X_SPAN,
					y: Y + (i >= 4 ? Y_SPAN : 0)
				});
				petIcon.onClick = onclick;
				this._icons.push(petIcon)
				page.addChild(petIcon.spr);
			}

			this._pager.addPage(page);
		}
	}

	show(isShow: boolean = true)
	{
		if (isShow && !this.spr.visible)
		{
			this.setSelect(GameLink.instance.currentPet);
		}
		this.spr.visible = isShow;
	}
	/** 由HallUI调用，当用户点击的携带按钮 */
	onClickCarry()
	{
		let sel = this.getSelect();
		if (GameLink.instance.getPetInfo(sel))
		{
			GameLink.instance.sendSelectPet(sel);
		}
	}

	refresh()
	{
		let link = GameLink.instance;
		this.setCarry(link.currentPet);
		for (let i = 0; i < this._icons.length; ++i)
		{
			let pet = link.getPetInfo(i);
			let canUnlock = false;
			if (!pet)
			{
				if (i < PetRules.MAX_PET_COUNT)
				{
					this._icons[i].setPetNotGet(i);
				}
				else
				{
					this._icons[i].setPetUnknown();
				}
			}
			else
			{
				if (typeof pet.unlockPrice === 'number')
				{
					canUnlock = true;
				}
				this._icons[i].setPet(i, pet.exp / pet.expTotal);
			}
			this._icons[i].setLockIcon(canUnlock);
		}
		this.setSelect(this.getSelect());
	}

	private _onClickPet(id: number)
	{
		//if (id < PetRules.MAX_PET_COUNT)
		{
			this.setSelect(id);
		}
	}
}