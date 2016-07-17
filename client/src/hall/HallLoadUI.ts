///<reference path="../../typings/tsd.d.ts"/>
import {GraphicConstant as GC} from "../resource"
export class HallLoadUI
{
	spr: createjs.Container = new createjs.Container();
	private _background: createjs.Shape;
	private _percentText: createjs.Text;
	//private _iconTween: createjs.Tween;

	constructor()
	{
		//this._background = new createjs.Shape();
		{
			//let g = this._background.graphics;
			//g.beginFill('rgba(0,0,0,0.8)');
			//g.drawRect(0, 0, GC.SCREEN_WIDTH, GC.SCREEN_HEIGHT);
			//g.endFill();
		}
		//this.spr.addChild(this._background);


		//text
		//let bitmap = new createjs.Bitmap('images/loading/未标题-2.png');
		//bitmap.set({ x: 70, y: 771 });
		//this.spr.addChild(bitmap);

		//text2
		this._percentText = new createjs.Text('(0%)', '33px SimHei', 'black');
		this._percentText.set({ x: 430, y: 755 });
		this.spr.addChild(this._percentText);

		//icon
		/*
		let icon = new createjs.Bitmap('images/loading/1.png');
		icon.set({ x: 256, y: 392, scaleX: 1.5, scaleY: 1.5 });
		this.spr.addChild(icon);

		let y0 = 392;
		let y1 = y0 - 20;
		this._iconTween = createjs.Tween.get(icon, { loop: true }).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(100).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(5000);
		*/
	}

	_onLoadProgress(n, total)
	{
		let pp = (n / total * 100) | 0;
		this._percentText.text = `(${pp}%)`;
	}

	_onLoadComplete()
	{
		//this._iconTween.setPaused(true);
	}

	_onLoadError()
	{
		//this._iconTween.setPaused(true);
		alert('载入失败，请刷新页面');
		location.reload(true);
	}
}