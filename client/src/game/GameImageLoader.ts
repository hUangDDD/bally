///<reference path="../../typings/tsd.d.ts"/>
import * as res from "../resource"
import {GraphicConstant as GC} from "../resource"
import {ImageLoader, ILoadItem} from "../ImageLoader"
import {cacheImageRotate,clearImageCacheExcept} from "./Ball"
import * as util from "../util"
import {HallUI} from "../hall/HallUI"
interface IBallItem
{
	id?: string;
	src: string;
	anchorX: number;
	anchorY: number;
}

/**
 * 负责载入所有图片，并且预先计算所有旋转好的图片
 */
export class GameImageLoader
{
	spr: createjs.Container = new createjs.Container();

	onComplete: Function;
	_loader: ImageLoader;

	private _cleared = false;
	private _items: ILoadItem[];
	private _ballItems: IBallItem[];
	private _ballItemProcessIndex = 0;
	//ui
	private _background: createjs.Shape;
	private _label: createjs.Text;
	private _iconTween: createjs.Tween;
	constructor(items: ILoadItem[], ballItems: IBallItem[])
	{
		this._items = items.slice();
		this._ballItems = ballItems.slice();

		for (let ballItem of this._ballItems)
		{
			if (!ballItem.id) ballItem.id = ballItem.src;
			this._items.push({
				id: ballItem.id,
				src: ballItem.src
			});
		}
		this._loader = new ImageLoader(this._items);
		this._loader.onComplete = () => this._onLoadComplete();
		this._loader.onError = () => this._onLoadError();
		this._loader.onProgress = (a, b) => this._onLoadProgress(a, b);
		//ui
		this._background = new createjs.Shape();
		{
			let g = this._background.graphics;
			g.beginFill('rgba(0,0,0,0.8)');
			g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
			g.endFill();
		}
		this._label = new createjs.Text('正在寻找果冻', `${23 * res.GLOBAL_SCALE}px SimHei`);
		this._label.color = 'rgba(255,255,255,1)';
		this._label.textAlign = 'center';
		this._label.x = GC.SCREEN_WIDTH / 2;
		this._label.y = GC.SCREEN_HEIGHT * 0.4;

		//icon
		let icon = new createjs.Bitmap(HallUI.instance.getPetImage(0));
		icon.set({ x: 256, y: 220, scaleX: 1.5, scaleY: 1.5 });
		this.spr.addChild(icon);

		let y0 = icon.y;
		let y1 = y0 - 20;
		this._iconTween = createjs.Tween.get(icon, { loop: true }).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(100).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(5000);

		this.spr.addChild(this._background);
		this.spr.addChild(this._label);
		this.spr.addChild(icon);
	}

	_onLoadProgress(n, total)
	{
		let pp = (n / total * 100) | 0;
		this.setText(`正在寻找果冻... (${pp}%)`);
	}

	_onLoadComplete()
	{
		this.setText(`载入游戏资源完成`);
		let ids = this._ballItems.map(item=>item.id);
		clearImageCacheExcept(ids);
		this._processBallImage();
	}

	_onLoadError()
	{
		this._iconTween.setPaused(true);
		this.setText(`载入游戏资源失败`);
	}

	private setText(text: string)
	{
		this._label.text = text;
	}

	private _processBallImage()
	{
		if (this._cleared) return;
		let ballItems = this._ballItems;
		if (this._ballItemProcessIndex >= ballItems.length)
		{
			if (this.onComplete)
			{
				this._iconTween.setPaused(true);
				this.setText('请等待游戏初始化完成.')
				this.onComplete();
			}
			return;
		}

		let item = ballItems[this._ballItemProcessIndex];
		let image = this._loader.getImage(item.id);
		util.assert(image, `image ${item.src} must be exists`);
		for (let i = 0; i < 360; ++i)
		{
			cacheImageRotate(item.id, image, item.anchorX, item.anchorY, i);
		}
		this._ballItemProcessIndex++;
		let pp = (this._ballItemProcessIndex / this._ballItems.length * 100) | 0;
		this.setText(`正在投放果冻...(${pp}%)`);
		setTimeout(() => this._processBallImage(), 20);
	}
}