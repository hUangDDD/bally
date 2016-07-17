///<reference path="../../typings/tsd.d.ts"/>
import {HallUI} from "./HallUI"
import {ProgressBarControl} from "./shared/ProgressBarControl"
import {ImageButton} from "../ImageButton"
import {GameLink} from "../GameLink"
export class HeadBarUI
{
	spr = new createjs.Container();

	private _taskProgress: createjs.Bitmap;
	private _taskNumberText: createjs.Text;
	private _coinNumberText: createjs.Text;
	private _diamondNumberText: createjs.Text;
	private _btnAddCoin: ImageButton;
	private _btnAddDiamond: ImageButton;
	private _levelText: createjs.Text;
	private _petIcon: createjs.Bitmap;
	constructor()
	{
		let background = new createjs.Bitmap(HallUI.instance.getImage('hall/headbar_background'));
		//background.set({ x: 18, y: 14 });

		let taskProgress = this._taskProgress = new createjs.Bitmap(HallUI.getImage('hall/headbar_exp_progress'));
		taskProgress.set({ x: 60, y: 86 });
		//taskProgress.maxWidth = 149;
		//taskProgress.percent = 0.5;
		taskProgress.scaleX = 0.8;
		//text
		let taskNumberText = this._taskNumberText = new createjs.Text('0%', '22px SimHei', 'white');
		taskNumberText.set({ x: 166, y: 97 });

		taskNumberText.textAlign = 'right';

		let coinNumberText = this._coinNumberText = new createjs.Text('0000', '22px SimHei', 'white');
		coinNumberText.set({ x: 356, y: 97 });
		coinNumberText.textAlign = 'right'

		let diamondNumberText = this._diamondNumberText = new createjs.Text('0000', '22px SimHei', 'white');
		diamondNumberText.set({ x: 572, y: 97 });
		diamondNumberText.textAlign = 'right';

		diamondNumberText.shadow = coinNumberText.shadow = taskNumberText.shadow = new createjs.Shadow('#e61c65', 2, 2, 1);

		//let star = new createjs.Bitmap(HallUI.instance.getImage('hall/star'));
		//star.set({ x: 19, y: 13 });
		this._petIcon = new createjs.Bitmap(null);
		this._petIcon.set({ x: 51, y: 104 });
		//buttons
		let btnAddCoin = this._btnAddCoin = new ImageButton(HallUI.instance.getImage('hall/plus'));
		btnAddCoin.set({ x: 382, y: 108 });

		let btnAddDiamond = this._btnAddDiamond = new ImageButton(HallUI.instance.getImage('hall/plus'));
		btnAddDiamond.set({ x: 599, y: 108 });

		btnAddCoin.onClick = () => this._onClickAddCoin();
		btnAddDiamond.onClick = () => this._onClickAddDiamond();

		//let levelText = this._levelText = new createjs.Text('99', '22px SimHei', 'white');
		//levelText.textAlign = 'center';
		//levelText.x = 54;
		//levelText.y = 37;
		//levelText.shadow = new createjs.Shadow('black', 2, 2, 1);

		//下面开始各种addChild，注意层次。
		this.spr.addChild(background);
		this.spr.addChild(taskProgress);
		this.spr.addChild(this._petIcon);
		this.spr.addChild(taskNumberText);
		this.spr.addChild(coinNumberText);
		this.spr.addChild(diamondNumberText);
		this.spr.addChild(btnAddCoin);
		this.spr.addChild(btnAddDiamond);
		//this.spr.addChild(levelText);
		this.setTaskProgress(0.23);
	}


	setTaskProgress(percent: number)
	{
		//this._taskProgress.percent = percent;
		if (!this._taskProgress.mask)
		{
			this._taskProgress.mask = new createjs.Shape();
		}
		var g = this._taskProgress.mask.graphics;
		var image = this._taskProgress.image;
		g.clear();
		g.beginFill('white');
		g.drawRect(this._taskProgress.x, this._taskProgress.y, image.width * percent, image.height);
		g.endFill();

		let n = ((percent * 100) | 0).toString() + '%';
		this._taskNumberText.text = n;
	}

	show(isShow: boolean = true)
	{
		this.spr.visible = isShow;
	}

	refresh()
	{
		let link = GameLink.instance;
		this._coinNumberText.text = link.coin.toString();
		this._diamondNumberText.text = link.diamond.toString();
		let pet = link.getPetInfo(link.currentPet);
		if (pet)
		{
			this.setTaskProgress(pet.exp / pet.expTotal);
		}
		else
		{
			this.setTaskProgress(0);
		}
		var petImage = HallUI.instance.getPetImage(link.currentPet);
		if (petImage)
		{
			this._petIcon.image = petImage;
			this._petIcon.regX = petImage.width / 2;
			this._petIcon.regY = petImage.height / 2;
		}
	}

	private _onClickAddCoin()
	{
		HallUI.instance.showBuyCoin();
	}
	private _onClickAddDiamond()
	{
		HallUI.instance.showBuyDiamond();
	}
}