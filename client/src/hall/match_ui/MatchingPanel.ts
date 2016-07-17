import {HallUI} from "../HallUI"
import {GameLink} from "../../GameLink"
import {ImageButton} from "../../ImageButton"
import {MakeSuitableSize} from "../../FixSizeBitmap"

const ICON_POSES = [
	{ x: 320, y: 843 },
	{ x: 121, y: 384 },
	{ x: 320, y: 284 },
	{ x: 509, y: 384 },
];

export class MatchingPanel
{
	spr = new createjs.Container();
	icons: createjs.Bitmap[] = [];
	private _iconFrames: createjs.Bitmap[] = [];
	private _matchingPlayerCountText: createjs.Text;
	private _dotAnimation: createjs.Tween;
	private _names: createjs.Text[] = [];
	private _iconContainer: createjs.Container[] = [];
	private _roundAnimation: createjs.Tween;
	constructor()
	{
		let background = new createjs.Bitmap(HallUI.getImage('hall/matching_background'));
		background.addEventListener('mousedown', () => { });
		this.spr.addChild(background);

		var roundBitmap = new createjs.Bitmap(HallUI.getImage('hall/matching_round_anim'));
		roundBitmap.set({
			regX: 292,
			regY: 293,
			x: 320, y: 569
		});
		this.spr.addChild(roundBitmap);
		var roundAnim = createjs.Tween.get(roundBitmap, { loop: true }).to({ rotation: 360 }, 2710);
		this._roundAnimation = roundAnim;

		this._matchingPlayerCountText = new createjs.Text('999名玩家正在', '27px SimHei', 'white');
		this._matchingPlayerCountText.set({
			textAlign: 'center',
			x: 320,
			y: 529
		});
		this.spr.addChild(this._matchingPlayerCountText);

		let matching_text = new createjs.Bitmap(HallUI.getImage('hall/match/matching_text'));
		matching_text.set({
			x: 200,
			y: 565
		});
		this.spr.addChild(matching_text);

		var dots = [];
		var dotImage = HallUI.getImage('hall/match/matching_text_dot');
		for (var i = 0; i < 6; ++i)
		{
			var bmp = new createjs.Bitmap(dotImage);
			bmp.set({
				x: 349 + i * 16,
				y: 565 + 20,
			});
			dots.push(bmp);
			this.spr.addChild(bmp);
		}
		{
			var ppp = -1;
			var obj = {};
			var setPPP = function (x)
			{
				ppp = x;
				var i;
				for (i = 0; i < x && i < 6; ++i)
				{
					dots[i].visible = true;
				}
				for (; i < 6; ++i)
				{
					dots[i].visible = false;
				}
			}
			Object.defineProperty(obj, 'ppp', { set: setPPP, get: () => ppp });
			this._dotAnimation = createjs.Tween.get(obj, { loop: true }).to({ ppp: 7 }, 3000);
		}

		var iconPoses = ICON_POSES;

		//face icons
		for (var i = 0; i < 4; ++i)
		{
			let cc = new createjs.Container();
			let pos = iconPoses[i];
			cc.set(pos);
			let iconframe_image = HallUI.getImage('hall/matching_face_frame');
			let icon = new createjs.Bitmap(null);
			let iconframe = new createjs.Bitmap(iconframe_image);
			let iconMask = new createjs.Shape();
			let nameText = new createjs.Text('XXXX', '27px SimHei', 'white');
			nameText.set({ x: 0, y: 65 });
			nameText.textAlign = 'center';

			MakeSuitableSize(icon, 105, 105, HallUI.getImage('hall/default_user_headicon'));
			icon.hitArea = new createjs.Shape();
			iconframe.set({
				regX: iconframe_image.width / 2,
				regY: iconframe_image.height / 2,
			});
			cc.addChild(iconframe);
			cc.addChild(icon);
			cc.addChild(nameText);
			this._iconFrames.push(iconframe)
			this.icons.push(icon);
			this._names.push(nameText);
			icon.mask = iconMask;
			let g = iconMask.graphics;
			g.beginFill('white');
			g.drawCircle(icon.x, icon.y, 52);
			g.endFill();
			this._iconContainer.push(cc);
			this.spr.addChild(cc);
		}

		//exit button
		let button = new ImageButton(HallUI.getImage('hall/cross_button'));
		button.set({ x: 590, y: 50 });
		this.spr.addChild(button);

		this.spr.visible = false;

		button.onClick = () =>
		{
			this.hide();
			GameLink.instance.sendLeaveMatch();
		}


		this.setTwoPlayersMode();
	}
	setTwoPlayersMode()
	{
		var cc = this._iconContainer;
		cc[0].set(ICON_POSES[0]);
		cc[1].set(ICON_POSES[2]);
		cc[2].visible = false;
		cc[3].visible = false;
	}

	setFourPlayersMode()
	{
		for (var i = 0; i < 4; ++i)
		{
			this._iconContainer[i].set(ICON_POSES[i]);
			this._iconContainer[i].visible = true;
		}
	}

	show()
	{
		this.spr.visible = true;
		let myimage = new Image();
		myimage.src = GameLink.instance.faceurl;
		this.icons[0].image = myimage;
		for (var i = 1; i < this.icons.length; ++i)
			this.icons[i].image = new Image();
		this._dotAnimation.setPaused(false);
		this._names[0].text = GameLink.instance.nickname;
		this._names[1].text = '等待玩家';
		this._names[2].text = '等待玩家';
		this._names[3].text = '等待玩家';
		this._roundAnimation.setPaused(false);
	}
	update(players:any[])
	{
		for (let i=0; i<(players.length>3?3:players.length); i++){
			this._names[i+1].text=players[i].nickname;
			let _ico=new Image();
			_ico.src=players[i].faceurl;
			this.icons[i+1].image=_ico;
		}
	}

	hide()
	{
		this.spr.visible = false;
		this._dotAnimation.setPaused(true);
		this._roundAnimation.setPaused(true);
	}

	setMatchingPlayerCount(count: number)
	{
		this._matchingPlayerCountText.text = `${count}名玩家正在`;
	}
}