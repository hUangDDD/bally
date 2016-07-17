import {HallUI} from "../HallUI"
import {CutStyleProgressBar} from "../shared/CutStyleProgressBar"
export class PetIcon
{
	spr = new createjs.Container();

	private UNSELECTED_BACKGROUND = HallUI.getImage('hall/pet_icon_background_unselected');
	private SELEDTED_BACKGROUND = HallUI.getImage('hall/pet_icon_background_selected');

	private _background: createjs.Bitmap;
	private _petOutlineIcon: createjs.Bitmap;
	private _petIcon: createjs.Bitmap;
	private _questionMark: createjs.Bitmap;
	private _currentPetTip: createjs.Bitmap;

	private _progressBg: createjs.Bitmap;
	private _progress: CutStyleProgressBar;
	private _notGetText: createjs.Bitmap;
	width = 0;
	height = 0;
	id = -1; /**由外部程序随便设置 */
	onClick: (id: number) => void;
	constructor()
	{
		this._background = new createjs.Bitmap(this.UNSELECTED_BACKGROUND);
		this.spr.addChild(this._background);
		this.width = this.UNSELECTED_BACKGROUND.width;
		this.height = this.SELEDTED_BACKGROUND.height;

		this._petOutlineIcon = new createjs.Bitmap(null);
		this._petOutlineIcon.set({
			x: 55,
			y: 72
		});
		this.spr.addChild(this._petOutlineIcon);

		this._petIcon = new createjs.Bitmap(null);
		this._petIcon.set({
			x: 55,
			y: 72
		});
		this.spr.addChild(this._petIcon);

		let qmImage = HallUI.getImage('hall/pet_question_mark_2');
		this._questionMark = new createjs.Bitmap(qmImage);
		this._questionMark.set({
			x: 55, y: 72,
			regX: qmImage.width / 2,
			regY: qmImage.height / 2
		});
		this.spr.addChild(this._questionMark);

		this._progressBg = new createjs.Bitmap(HallUI.getImage('hall/pet_progress_small_bg'));
		this._progressBg.set({ x: -1, y: 139 });
		this.spr.addChild(this._progressBg);

		this._progress = new CutStyleProgressBar(HallUI.getImage('hall/pet_progress_small'));
		this._progress.set({
			x: 1, y: 141
		});
		this.spr.addChild(this._progress);


		this._notGetText = new createjs.Bitmap(HallUI.getImage('hall/pet_not_get_text'));
		this._notGetText.set({ x: 23, y: 136 });
		this.spr.addChild(this._notGetText);

		this._currentPetTip = new createjs.Bitmap(HallUI.getImage('hall/pet_icon_current_tip'));
		this._currentPetTip.set({ x: 64, y: 83 });
		this.spr.addChild(this._currentPetTip);

		this.spr.addEventListener('click', () =>
		{
			if (this.onClick) this.onClick(this.id);
		});
	}
	//等级已经被限制
	setLockIcon(show: boolean)
	{

	}

	setPetUnknown()
	{
		this._petIcon.visible = false;
		this._petOutlineIcon.visible = false;
		this._questionMark.visible = true;
		this._progressBg.visible = false;
		this._progress.visible = false;
		this._notGetText.visible = false;
	}

	setPetNotGet(iconId: number)
	{
		this._petIcon.visible = false;
		this._petOutlineIcon.visible = true;
		this._questionMark.visible = true;
		this._progressBg.visible = false;
		this._progress.visible = false;
		this._notGetText.visible = true;
		let icon = HallUI.getImage('pet_outline_' + iconId);
		this._petOutlineIcon.image = icon;
		if (icon)
		{
			this._petOutlineIcon.set({
				regX: icon.width / 2,
				regY: icon.height / 2,
			});
		}
	}

	setPet(iconId: number, expPercent: number)
	{
		this._petIcon.visible = true;
		this._petOutlineIcon.visible = false;
		this._questionMark.visible = false;
		this._progressBg.visible = true;
		this._progress.visible = true;
		this._notGetText.visible = false;
		let icon = HallUI.instance.getPetImage(iconId);
		this._petIcon.image = icon;
		if (icon)
		{
			this._petIcon.set({
				regX: icon.width / 2,
				regY: icon.height / 2,
			});
		}
		this._progress.percent = expPercent;
	}

	setSelected(isSelected: boolean)
	{
		this._background.image = isSelected ? this.SELEDTED_BACKGROUND : this.UNSELECTED_BACKGROUND;
	}

	setCarry(isCarry: boolean)
	{
		this._currentPetTip.visible = isCarry;
	}
}