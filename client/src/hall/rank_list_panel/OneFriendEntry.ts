import {HallUI} from "../HallUI"
import {ImageButton} from "../../ImageButton"
import {GameLink} from "../../GameLink"
import * as util from "../../util"
import * as FixSizeBitmap from "../../FixSizeBitmap"
export class OneFriendEntry
{
	spr = new createjs.Container();
	width = 0;
	height = 0;

	private _nameText: createjs.Text;
	private _nameTextOutline: createjs.Text;
	private _scoreText: createjs.Text;
	private _indexBitmap0: createjs.Bitmap;
	private _indexBitmap1: createjs.Bitmap;
	private _faceIcon: createjs.Bitmap;

	private _firstOneIcon: createjs.Bitmap;
	private _selfIconFrame: createjs.Bitmap;
	constructor()
	{
		let background = new createjs.Bitmap(HallUI.instance.getImage('hall/friend_background'));
		this.width = background.image.width;
		this.height = background.image.height;

		this.spr.setBounds(0, 0, this.width, this.height);

		let iconFrame = new createjs.Bitmap(HallUI.instance.getImage('hall/friend_icon_background'));
		iconFrame.set({ x: 100, y: 7 });

		this._indexBitmap0 = new createjs.Bitmap(null);
		this._indexBitmap0.set({ x: 30, y: 60 });
		this._indexBitmap1 = new createjs.Bitmap(null);
		this._indexBitmap1.set({ x: 75, y: 60 });

		iconFrame.addEventListener('click', () =>
		{
			if (this._obj && this._obj.key)
			{
				HallUI.instance.showFriendInfoPanel(this._obj.key)
			}
		})
		this._selfIconFrame = new createjs.Bitmap(HallUI.getImage('hall/friend_self_frame'));
		this._selfIconFrame.set({ x: 100, y: 7 });

		this._faceIcon = new createjs.Bitmap(null);
		FixSizeBitmap.MakeSuitableSize(this._faceIcon, 90, 90, HallUI.getImage('hall/default_user_headicon'));
		this._faceIcon.set({ x: 105 + 45, y: 12 + 45 });
		this._faceIcon.mouseEnabled = false;
		this._faceIcon.hitArea = new createjs.Shape();


		//{
		let face_mask = new createjs.Bitmap(HallUI.getImage('hall/face_mask'));
		face_mask.set({
			x: 100, y: 7,
		});

		this._firstOneIcon = new createjs.Bitmap(HallUI.getImage('hall/friend_first_icon'));
		this._firstOneIcon.set({ x: 170, y: -10 });


		let nameText = this._nameText = new createjs.Text('名字名字名字', '20px SimHei', '#ff3a8b')
		nameText.set({ x: 224, y: 22 });

		this._nameTextOutline = new createjs.Text('', nameText.font, 'white');
		this._nameTextOutline.outline = 2;
		this._nameTextOutline.x = nameText.x;
		this._nameTextOutline.y = nameText.y;


		this._scoreText = new createjs.Text('998,122,222', '30px Arial', 'white');
		this._scoreText.textAlign = 'right';
		this._scoreText.set({ x: 420, y: 60 });

		this.spr.addChild(background);
		this.spr.addChild(iconFrame);

		this.spr.addChild(this._faceIcon);
		this.spr.addChild(face_mask);
		this.spr.addChild(this._selfIconFrame);
		this.spr.addChild(this._indexBitmap0);
		this.spr.addChild(this._indexBitmap1);

		this.spr.addChild(this._firstOneIcon);

		this.spr.addChild(this._nameTextOutline);
		this.spr.addChild(nameText);
		this.spr.addChild(this._scoreText);
		//this.spr.cache(0, 0, this.width, this.height);
	}
	_obj: any;
	setFriendInfo(obj: any)
	{
		this._obj = obj;
		let name = obj.name || "";
		if (name.length > 9)
		{
			name = name.substr(0, 9) + "...";
		}
		this._nameTextOutline.text = this._nameText.text = name;

		this._firstOneIcon.visible = obj.index === 0;
		this._selfIconFrame.visible = obj.key === GameLink.instance.key;
		let index = (obj.index | 0) + 1;
		let d1 = (index / 10) | 0;
		let d0 = (index % 10);
		
		if (index > 99)
		{
			d0 = d1 = 99;
		}

		if (d1 >= 0 && d1 <= 9)
		{
			let image = this._indexBitmap0.image = HallUI.getImage('hall/friend_' + d1);
			this._indexBitmap0.set({
				regX: image.width / 2,
				regY: image.height / 2
			});
		}
		else
		{
			this._indexBitmap0.image = null;
		}
		if (d0 >= 0 && d0 <= 9)
		{
			let image = this._indexBitmap1.image = HallUI.getImage('hall/friend_' + d0);
			this._indexBitmap1.set({
				regX: image.width / 2,
				regY: image.height / 2
			});
		}
		else
		{
			this._indexBitmap1.image = null;
		}
		if (!obj.faceurl)
		{
			this._faceIcon.visible = true;
			this._faceIcon.image = null;
		}
		else
		{
			let image = new Image();
			image.src = obj.faceurl;
			this._faceIcon.image = image;
			this._faceIcon.visible = true;
		}
		this._scoreText.text = util.intToString((obj.score | 0));
	}
}