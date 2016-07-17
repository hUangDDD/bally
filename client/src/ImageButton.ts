///<reference path="../typings/createjs/createjs.d.ts"/>
import {GameStage} from "./GameStage"
import {SoundManager} from "./SoundManager"
/** 当按下的时候的缩放值 */
const SCALED_FACTOR = 0.9;

export class ImageButton extends createjs.Container
{
	scaledContainer: createjs.Container = new createjs.Container();
	width: number = 0;
	height: number = 0;
	onClick: Function;

	private _oldScaleX = 1;
	private _oldScaleY = 1;
	private _background: createjs.Bitmap;
	constructor(image: HTMLImageElement | HTMLCanvasElement)
	{
		super();

		let background = new createjs.Bitmap(image);
		this.width = image.width;
		this.height = image.height;
		background.regX = this.width / 2;
		background.regY = this.height / 2;
		this.hitArea = background;
		this.scaledContainer.addChild(background);
		this.addChild(this.scaledContainer);
		this.addEventListener('mousedown', e => this._onMouseDown(e));
		this.addEventListener('pressup', e => this._onPressUp(e));
		this.addEventListener('click', e => this._onClick(e));
		this._background = background;
	}

	get image() { return this._background.image; }
	set image(image)
	{
		if (image !== this._background.image)
		{
			this._background.image = image;
			if (image)
			{
				this.width = image.width;
				this.height = image.height;
				this._background.regX = this.width / 2;
				this._background.regY = this.height / 2;
			}
		}
	}

	/**返回的Bitmap可以随意修改属性 */
	addIcon(image: HTMLImageElement | HTMLCanvasElement, offset?: any)
	{
		let icon = new createjs.Bitmap(image);
		icon.regX = image.width / 2;
		icon.regY = image.height / 2;
		if (offset)
		{
			icon.x = offset.x || 0;
			icon.y = offset.y || 0;
		}
		this.scaledContainer.addChild(icon);
		return icon;
	}

	addDisplayObject<T extends createjs.DisplayObject>(obj: T): T
	{
		this.scaledContainer.addChild(obj);
		return obj;
	}


	private _onClick(e: any)
	{
		if (this.onClick) this.onClick();
	}
	private _onMouseDown(e: any)
	{
		let cc = this.scaledContainer;
		this._oldScaleX = cc.scaleX;
		this._oldScaleY = cc.scaleY;
		cc.scaleX *= SCALED_FACTOR;
		cc.scaleY *= SCALED_FACTOR;
		GameStage.instance.makeDirty();
		SoundManager.playEffect('click');
	}

	private _onPressUp(e: any)
	{
		let cc = this.scaledContainer;
		cc.scaleX = this._oldScaleX;
		cc.scaleY = this._oldScaleY;
		GameStage.instance.makeDirty();
	}
}