import {HallUI} from "../HallUI"
import {ProgressBarControl} from "../shared/ProgressBarControl"
import {CutStyleProgressBar} from "../shared/CutStyleProgressBar"
import {BitmapText} from "../shared/BitmapText"

interface IPetLevelUpDefine
{
	pet: number;    //宠物序号
	num: number;    //多少“消”
	delay: number;  //延迟多少时间开始动画
	speed: number;
	from: number;   //-1表示，不能获取经验
	to: number;
}

export class PetLevelUpEntry
{
	spr = new createjs.Container();
	width = 0;
	height = 0;
	private _define: IPetLevelUpDefine;
	private _progress: number = 0;
	private _progressText: BitmapText;
	private _lvTextBar: BitmapText
	private _expProgressBar: CutStyleProgressBar;
	constructor(define: IPetLevelUpDefine)
	{
		this._define = define;

		let background = new createjs.Bitmap(HallUI.getImage('pet/levelup_background'));
		this.width = background.image.width;
		this.height = background.image.height;
		this.spr.addChild(background);

		let hw = this.width / 2;
		let hh = this.height / 2;
		background.set({ x: -hw, y: -hh });
		//icon
		{
			let icon = new createjs.Bitmap(HallUI.instance.getPetImage(define.pet));
			this.spr.addChild(icon);
			icon.set({ x: 74 - hw - icon.image.width / 2, y: 60 - hh - icon.image.height / 2 });
		}
		//XX消
		{
			let text = new createjs.Text(`${define.num}消`, '24px SimHei', 'white');
			text.textAlign = 'right';
			text.x = 289 - hw;
			text.y = 22 - hh;
			this.spr.addChild(text);
		}

		if (define.from < 0)
		{
			let text = new createjs.Bitmap(HallUI.getImage('hall/pet_lvup_not_get_text'));
			text.set({ x: 165 - hw, y: 64 - hh });
			this.spr.addChild(text);
		}
		else
		{
			this._lvTextBar = new BitmapText(BitmapText.buildCharDefines(
				'LV:0123456789',
				HallUI.getImage('hall/pet_lvup_lv_text'),
				12, 14
			));
			this._lvTextBar.align = 'center';
			this._lvTextBar.set({ x: 154 - hw, y: 26 - hh });
			this.spr.addChild(this._lvTextBar);

			//progress bg
			//let pro_bg = new createjs.Bitmap(HallUI.getImage('pet/levelup_progress_background'));
			//pro_bg.set({ x: 143 - hw, y: 73 - hh });
			//this.spr.addChild(pro_bg);

			//progress bar
			let _expProgressBar = this._expProgressBar = new CutStyleProgressBar(HallUI.getImage('hall/pet_lvup_progress'))
			_expProgressBar.set({ x: 117 - hw, y: 58 - hh });
			_expProgressBar.percent = 1;
			this.spr.addChild(_expProgressBar);

			let progressText = new BitmapText(BitmapText.buildCharDefines('0123456789%', HallUI.getImage('hall/pet_lvup_progress_chars'), 14, 19));
			progressText.set({ x: 260 - hw, y: 62 - hh });
			progressText.align = 'center';
			this.spr.addChild(progressText);
			this._progressText = progressText;


			this.progress = define.from;
			if (define.to !== define.from)
			{
				createjs.Tween.get(this).wait(define.delay * 1000).to({ progress: define.to },
					Math.abs(define.to - define.from) / define.speed * 1000
				);
			}
		}
	}
	//为了动画方便，使用一个变量来控制，等级和经验
	//例如： 4.5表示，lv4和经验50%
	get progress() { return this._progress; }
	set progress(val)
	{
		if (this._progress === val) return;
		let lv = Math.floor(val);
		let p = val - lv;
		this._lvTextBar.text = `LV:${lv}`;
		this._expProgressBar.percent = p;
		this._progressText.text = `${(p * 100) | 0}%`;
		let lvOld = Math.floor(this._progress);
		if (this._progress !== 0 && lv !== lvOld)
		{
			this._showLvUp();
		}
		this._progress = val;
	}

	private _showLvUp()
	{
		let x0 = 365 - this.width / 2, x1 = 155 - this.width / 2;
		let image = HallUI.getImage('pet/levelup_text');
		let text = new createjs.Bitmap(image);
		text.set({
			regX: image.width / 2,
			regY: image.height / 2
		});
		text.set({ x: x0 + text.regX, y: 58 + text.regY - this.height / 2 });
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
				this.spr.removeChild(text);
			});

		this.spr.addChild(text);
	}
}