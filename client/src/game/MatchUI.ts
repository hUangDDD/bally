import {VSBar} from "./VSBar"
import {MakeSuitableSize} from "../FixSizeBitmap"
import {HallUI} from "../hall/HallUI"
const ADD_Y = 65;
export class MatchUI
{
	spr = new createjs.Container();
	private _vsbar: VSBar;
	private _vsbar2: VSBar;
	private _faceIcons: createjs.Bitmap[] = [];
	private _scoresText: createjs.Text[] = [];
	private _scores: number[] = [];
	private _vsbarPercent = 0.5;
	private _vsbarPercentAnimation: createjs.Tween;
	private _vsbarPercent2 = 0.5;
	private _vsbarPercentAnimation2: createjs.Tween;
	constructor(type: string)
	{
		this._vsbar = new VSBar();
		this._vsbar.x = 320 - this._vsbar.width / 2;
		this._vsbar.y = 143 + ADD_Y;
		this.spr.addChild(this._vsbar);

		var defaultIcon = HallUI.getImage('hall/default_user_headicon');

		var icon1 = new createjs.Bitmap(null);
		icon1.set({ x: 320 - 219, y: 152 + ADD_Y });
		MakeSuitableSize(icon1, 61, 61, defaultIcon);
		icon1.hitArea = new createjs.Shape();
		this.spr.addChild(icon1);
		this._faceIcons.push(icon1);

		var icon2 = new createjs.Bitmap(null);
		icon2.set({ x: 320 + 219, y: 152 + ADD_Y });
		MakeSuitableSize(icon2, 61, 61, defaultIcon);
		icon2.hitArea = new createjs.Shape();
		this.spr.addChild(icon2);
		this._faceIcons.push(icon2);

		var score1 = new createjs.Text('0', '20px SimHei', 'white');
		score1.set({
			textAlign: 'left',
			x: 320 - 163,
			y: 151 + ADD_Y
		});
		this.spr.addChild(score1);
		this._scoresText.push(score1);
		this._scores.push(0);

		var score2 = new createjs.Text('0', '20px SimHei', 'white');
		score2.set({
			textAlign: 'right',
			x: 320 + 163,
			y: 151 + ADD_Y
		});
		this.spr.addChild(score2);
		this._scoresText.push(score2);
		this._scores.push(0);

		if (['44', 'master'].indexOf(type) >= 0)
		{
			var DOWN_PIXELS = 70;
			this._vsbar2 = new VSBar();
			this._vsbar2.set({
				x: 320 - this._vsbar.width / 2,
				y: 143 + DOWN_PIXELS + ADD_Y
			});
			this.spr.addChild(this._vsbar2);


			var icon3 = new createjs.Bitmap(null);
			icon3.set({ x: 320 - 219, y: 152 + DOWN_PIXELS + ADD_Y });
			MakeSuitableSize(icon3, 61, 61, defaultIcon);
			icon3.hitArea = new createjs.Shape();
			this.spr.addChild(icon3);
			this._faceIcons.push(icon3);

			var icon4 = new createjs.Bitmap(null);
			icon4.set({ x: 320 + 219, y: 152 + DOWN_PIXELS + ADD_Y });
			MakeSuitableSize(icon4, 61, 61, defaultIcon);
			icon4.hitArea = new createjs.Shape();
			this.spr.addChild(icon4);
			this._faceIcons.push(icon4);


			var score3 = new createjs.Text('0', '20px SimHei', 'white');
			score3.set({
				textAlign: 'left',
				x: 320 - 163,
				y: 151 + DOWN_PIXELS + ADD_Y
			});
			this.spr.addChild(score3);
			this._scoresText.push(score3);
			this._scores.push(0);

			var score4 = new createjs.Text('0', '20px SimHei', 'white');
			score4.set({
				textAlign: 'right',
				x: 320 + 163,
				y: 151 + DOWN_PIXELS + ADD_Y
			});
			this.spr.addChild(score4);
			this._scoresText.push(score4);
			this._scores.push(0);
		}
	}

	setFaceUrl(idx: number, url: string)
	{
		if (this._faceIcons[idx])
		{
			var image = new Image();
			image.src = url;
			this._faceIcons[idx].image = image;
		}
	}

	setScore(idx: number, score: number)
	{
		if (this._scoresText[idx])
		{
			this._scores[idx] = score;
			this._scoresText[idx].text = (score | 0).toString();
			//update percent;
			var s1 = this._scores[0];
			var s2 = this._scores[1];
			var percent = calcPercent(s1, s2);
			if (percent !== this._vsbarPercent)
			{
				this._vsbarPercent = percent;
				if (this._vsbarPercentAnimation)
				{
					this._vsbarPercentAnimation.setPaused(true);
				}
				this._vsbarPercentAnimation = createjs.Tween.get(this._vsbar).to({ _percent: percent }, 200, createjs.Ease.cubicInOut);
			}

			if (this._vsbar2)
			{
				var percent2 = calcPercent(this._scores[2], this._scores[3]);
				if (percent2 !== this._vsbarPercent2)
				{
					this._vsbarPercent2 = percent2;
					if (this._vsbarPercentAnimation2)
					{
						this._vsbarPercentAnimation2.setPaused(true);
					}
					this._vsbarPercentAnimation2 = createjs.Tween.get(this._vsbar2).to({ _percent: percent2 }, 200, createjs.Ease.cubicInOut);
				}
			}
		}
		function calcPercent(s1, s2)
		{
			var percent = 0.5;
			if (s1 == s2)
			{
				percent = 0.5;
			}
			else if (s1 <= 0)
			{
				percent = 0;
			}
			else if (s2 <= 0)
			{
				percent = 1;
			}
			else
			{
				percent = s1 / (s1 + s2);
			}
			return percent;
		}
	}
}

window['MatchUI'] = MatchUI;