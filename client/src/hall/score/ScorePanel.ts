import {HallUI} from "../HallUI"
import * as util from "../../util"
import * as GameUtil from "../../game/GameUtil"
import {BlinkStarEffect} from "../BlinkStarEffect"
import {ImageButton} from "../../ImageButton"
import {GameLink} from "../../GameLink"
import {BitmapText} from "../shared/BitmapText"
const ADD_FOR_NEW_UI = 98
const BASE_POS = { x: 43, y: 95 + ADD_FOR_NEW_UI };

export class ScorePanel
{
	spr = new createjs.Container();
	private _petAddPercentText: BitmapText;
	private _itemAddPercentText: BitmapText;
	private _petAddScoreText: BitmapText;
	private _itemAddScoreText: BitmapText;
	private _petScoreText: BitmapText;
	private _coinText: BitmapText;
	private _weekScoreText: BitmapText;
	private _historicalScoreText: BitmapText;
	//private _scoreDigitContainer: createjs.Container;
	//private _score: number = null;
	//private _scoreDigits: HTMLCanvasElement[];
	private _scoreText: BitmapText;
	private _petIcon: createjs.Bitmap;
	private _blinkStar: BlinkStarEffect;
	private _titleBitmap: createjs.Bitmap;
	private _petLvText: BitmapText;
	constructor()
	{
		const BASE_X = 90;
		const BASE_Y = 263;

		let background = new createjs.Bitmap(HallUI.getImage('hall/score_panel_background'));
		background.set({ x: BASE_X, y: BASE_Y });
		this.spr.addChild(background);

		//先来一层静态的背景
		{
			let add = (name, x, y) =>
			{
				let bitmap = new createjs.Bitmap(HallUI.getImage(name));
				bitmap.x = x;
				bitmap.y = y;
				this.spr.addChild(bitmap);
				return bitmap;
			};
			//add('hall/score/title_text', 220, 190);
			this._titleBitmap = new createjs.Bitmap(HallUI.getImage('hall/score/title_text'));
			this.spr.addChild(this._titleBitmap);
			this._titleBitmap.set({ x: 320, y: BASE_Y - 30, regX: this._titleBitmap.image.width / 2 });

			this._petIcon = new createjs.Bitmap(null);
			this._petIcon.set({
				x: 173, y: 482
			});
			this._petIcon.image = HallUI.instance.getPetImage(0);
			this.spr.addChild(this._petIcon);
		}
		//各种text
		{
			let add = (sampleText, size, color, x, y, align) =>
			{
				let text = new createjs.Text(sampleText, `${size}px sans-serif`, color);
				text.set({ x, y });
				text.textAlign = align;
				this.spr.addChild(text);
				return text;
			}

			let addBitmapText = (sampleText, defines, x, y, align) =>
			{
				let text = new BitmapText(defines);
				text.set({ x, y });
				text.align = align;
				this.spr.addChild(text);
				return text;
			}
			var percentChars = BitmapText.buildCharDefines('0123456789%', HallUI.getImage('hall/score/percent_chars'), 20, 20);
			var stdChars = BitmapText.buildCharDefines('0123456789,+', HallUI.getImage('hall/score/std_score_chars'), 20, 20)
			this._petAddPercentText = addBitmapText('(18%)', percentChars, 269, 393, 'left');
			this._itemAddPercentText = addBitmapText('(10%)', percentChars, 269, 429, 'left');
			this._petAddScoreText = addBitmapText('22,222', stdChars, 471, 393, 'right');
			this._itemAddScoreText = addBitmapText('1,234', stdChars, 471, 429, 'right');
			this._petScoreText = addBitmapText('99', stdChars, 445, 505, 'right');
			this._coinText = addBitmapText('600', stdChars, 445, 550, 'right');
			this._weekScoreText = addBitmapText('99,999', stdChars, 485, 620, 'right');
			this._historicalScoreText = addBitmapText('999,999', stdChars, 485, 647, 'right');

			var scoreChars = BitmapText.buildCharDefines('0123456789,', HallUI.getImage('hall/score/score_chars'), 35, 40);
			this._scoreText = addBitmapText('99,999,999', scoreChars, 320, 314, 'center');

			var lvChars = BitmapText.buildCharDefines('0123456789', HallUI.getImage('hall/score/pet_lv_chars'), 20, 20);
			this._petLvText = addBitmapText('11', lvChars, 221, 560, 'left');
		}


		this.setScore(987654);

		this._blinkStar = new BlinkStarEffect();
		this._blinkStar.spr.set({
			x: 128, y: 313
		});
		this._blinkStar.width = 381;
		this._blinkStar.height = 76;
		this.spr.addChild(this._blinkStar.spr);
	}
	//private _lastMatchType: string;
	private setScore(score: number)
	{
		this._scoreText.text = util.intToString(score);
	}
	show(isShow: boolean = true)
	{
		this.spr.visible = isShow;
		if (isShow)
		{
			this._blinkStar.start();
		}
		else
		{
			this._blinkStar.stop();
		}
	}
	showData(obj: {
		pet: number;
		score: number;
		petAddPercent: number;
		itemAddPercent: number;
		petAddScore: number;
		itemAddScore: number;
		petScore: number;
		coin: number;
		weekHighScore: number;
		historicalHighScore: number;
		isMatch?: boolean;
		win?: boolean;
		matchType?: string;
	})
	{
		this._petIcon.image = HallUI.instance.getPetImage(obj.pet | 0);
		var petinfo = GameLink.instance.getFakePetInfo(obj.pet | 0);
		if (petinfo)
		{
			this._petLvText.text = (petinfo.level | 0).toString();
		}
		this._petScoreText.text = '+' + (obj.petScore | 0).toString();
		this.setScore(obj.score);
		this._petAddPercentText.text = `${(obj.petAddPercent * 100) | 0}%`;
		this._itemAddPercentText.text = `${(obj.itemAddPercent * 100) | 0}%`;
		this._petAddScoreText.text = (obj.petAddScore | 0).toString();
		this._itemAddScoreText.text = (obj.itemAddScore | 0).toString();
		this._weekScoreText.text = util.intToString(obj.weekHighScore | 0);
		this._historicalScoreText.text = util.intToString(obj.historicalHighScore | 0);
		this._coinText.text = '+' + (obj.coin | 0).toString();

		/*
		this._mask.visible = obj.isMatch;
		this._btnMatchAgain.visible = obj.isMatch;
		this._btnToMatch.visible = obj.isMatch;
		this._lastMatchType = obj.matchType;
		*/
	}
}