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
	//private _nameTextOutline: createjs.Text;
	private _scoreText: createjs.Text;
	//private _indexBitmap0: createjs.Bitmap;
	//private _indexBitmap1: createjs.Bitmap;
	private _btnHeart: ImageButton;
	//private _petBitmap: createjs.Bitmap;
	private _faceIcon: createjs.Bitmap;

	//private _firstOneIcon: createjs.Bitmap;
	private _posIcon: createjs.Bitmap;
	//private _selfIconFrame: createjs.Bitmap;
	constructor()
	{
		let background = new createjs.Bitmap(HallUI.instance.getImage('hall/friend_background'));
		this.width = background.image.width;
		this.height = background.image.height;

		this.spr.setBounds(0, 0, this.width, this.height);

		//let iconFrame = new createjs.Bitmap(HallUI.instance.getImage('hall/friend_icon_background'));
		//iconFrame.set({ x: 100, y: 7 });

		//this._petBitmap = new createjs.Bitmap(null);
		//this._petBitmap.set({ x: 190, y: 95 });
		//this._petBitmap.set({ regX: 40, regY: 40 });
		//this._petBitmap.set({ scaleX: 0.5, scaleY: 0.5 });

		this._posIcon = new createjs.Bitmap(null);
		this._posIcon.set({ x: 60, y: 50 });

		//this._indexBitmap0 = new createjs.Bitmap(null);
		//this._indexBitmap0.set({ x: 30, y: 60 });
		//this._indexBitmap1 = new createjs.Bitmap(null);
		//this._indexBitmap1.set({ x: 75, y: 60 });

		//iconFrame.addEventListener('click', () =>
		//{
		//	if (this._obj && this._obj.key)
		//	{
		//		HallUI.instance.showFriendInfoPanel(this._obj.key)
		//	}
		//})
		//this._selfIconFrame = new createjs.Bitmap(HallUI.getImage('hall/friend_self_frame'));
		//this._selfIconFrame.set({ x: 100, y: 7 });

		this._faceIcon = new createjs.Bitmap(null);
		FixSizeBitmap.MakeSuitableSize(this._faceIcon, 68, 68, HallUI.getImage('hall/default_user_headicon'));
		this._faceIcon.set({ x: 154, y: 12 + 40 + 1 });
		this._faceIcon.hitArea = new createjs.Shape();
		this._faceIcon.mouseEnabled = false;
		
		var hitShape = new createjs.Shape();
		hitShape.x = this._faceIcon.x;
		hitShape.y = this._faceIcon.y; 
		{
			var g = hitShape.graphics;
			g.beginFill('rgba(0,0,0,0.03)');
			g.drawRect(-34, -34, 68, 68);
			g.endFill();
		}
		hitShape.addEventListener('click', () =>
		{
			if (this._obj && this._obj.key)
			{
				HallUI.instance.showFriendInfoPanel(this._obj.key)
			}
		});

		//{
		//let face_mask = new createjs.Bitmap(HallUI.getImage('hall/face_mask'));
		//face_mask.set({
		//	x: 100, y: 7,
		//});

		//this._firstOneIcon = new createjs.Bitmap(HallUI.getImage('hall/friend_first_icon'));
		//this._firstOneIcon.set({ x: 170, y: -10 });


		let nameText = this._nameText = new createjs.Text('名字名字名字', '20px SimHei', 'white')
		nameText.set({ x: 224, y: 22 });

		//this._nameTextOutline = new createjs.Text('', nameText.font, 'white');
		//this._nameTextOutline.outline = 2;
		//this._nameTextOutline.x = nameText.x;
		//this._nameTextOutline.y = nameText.y;

		let _btnHeart = this._btnHeart = new ImageButton(HallUI.instance.getImage('hall/btn_send_heart'));
		_btnHeart.onClick = () => this._onClickHeart();
		_btnHeart.set({ x: 460, y: 55 });

		this._scoreText = new createjs.Text('998,122,222', '30px Arial', 'white');
		this._scoreText.textAlign = 'left';
		this._scoreText.set({ x: 224, y: 60 });
		this.spr.addChild(this._faceIcon);
		
		this.spr.addChild(background);
		this.spr.addChild(hitShape);
		//this.spr.addChild(iconFrame);


		//this.spr.addChild(face_mask);
		//this.spr.addChild(this._selfIconFrame);
		//this.spr.addChild(this._petBitmap);
		//this.spr.addChild(this._indexBitmap0);
		//this.spr.addChild(this._indexBitmap1);
		this.spr.addChild(this._posIcon);
		//this.spr.addChild(this._firstOneIcon);

		//this.spr.addChild(this._nameTextOutline);
		this.spr.addChild(nameText);
		this.spr.addChild(this._scoreText);
		this.spr.addChild(_btnHeart);
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
		this._nameText.text = name;

		//this._firstOneIcon.visible = obj.index === 0;
		var posImage = null;
		switch (obj.index)
		{
			case 0:
				posImage = HallUI.getImage('hall/friend_pos1');
				break;
			case 1:
				posImage = HallUI.getImage('hall/friend_pos2');
				break;
			case 2:
				posImage = HallUI.getImage('hall/friend_pos3');
				break;
			default:
				posImage = null;
				break;
		}
		this._posIcon.image = posImage;
		if (posImage)
		{
			this._posIcon.regX = posImage.width / 2;
			this._posIcon.regY = posImage.height / 2;
		}

		//this._selfIconFrame.visible = obj.key === GameLink.instance.key;
		/*
		let index = (obj.index | 0) + 1;
		let d1 = (index / 10) | 0;
		let d0 = (index % 10);
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
		}*/
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
		this._btnHeart.image = !!obj.canSendHeart ? HallUI.getImage('hall/btn_send_heart') : HallUI.getImage('hall/btn_send_heart_invalid');
		//this._petBitmap.image = HallUI.instance.getPetImage(obj.currentPet);
		//Object.defineProperty(this._petBitmap, 'image', { get: () => HallUI.instance.getPetImage(obj.currentPet) });
		//this.spr.updateCache();
	}

	_onClickHeart()
	{
		if (this._obj && typeof this._obj.key === 'string' &&
			this._btnHeart.image === HallUI.getImage('hall/btn_send_heart'))
		{
			this._playFlyHeartAnimation();
			this._btnHeart.image = HallUI.getImage('hall/btn_send_heart_invalid');
			GameLink.instance.sendFriendHeart(this._obj.key);
		}
	}

	private _playFlyHeartAnimation()
	{
		let from = this.spr.localToGlobal(460, 66);
		let to1 = this._faceIcon.localToGlobal(0, 0),
			to2 = { x: 436, y: 135 };
		to1.x += 20;
		to1.y += 20;

		let bitmap1 = new createjs.Bitmap(HallUI.instance.getImage('hall/full_heart'));
		bitmap1.x = from.x;
		bitmap1.y = from.y;
		bitmap1.regX = bitmap1.image.width / 2;
		bitmap1.regY = bitmap1.image.height / 2;

		let bitmap2 = bitmap1.clone();

		HallUI.instance.spr.addChild(bitmap1);
		HallUI.instance.spr.addChild(bitmap2);
		createjs.Tween.get(bitmap1).to({ y: from.y + 70 }, 300).to(to1, 300).call(() => HallUI.instance.spr.removeChild(bitmap1));
		createjs.Tween.get(bitmap2).to({ x: from.x + 70 }, 300).to(to2, 300).call(() => HallUI.instance.spr.removeChild(bitmap2));
	}
}