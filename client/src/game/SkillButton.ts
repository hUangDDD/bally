///<reference path="../../typings/tsd.d.ts"/>
import * as res from "../resource"
import * as GameRules from "./GameRules"
import {SoundManager} from "../SoundManager"
export class SkillButton
{
	spr: createjs.Container;
	onClick: Function;
	private _mask: createjs.Shape;
	private _maskRadius = 0;
	private _showEnergy = 0;
	private _mouseDown = false;
	private _iconBitmap: createjs.Bitmap;
	private _bg2: createjs.Bitmap;
	private _maxEnergy = 12;
	private _bg3: createjs.Bitmap;
	private _iconAnimation: createjs.Tween;
	constructor()
	{
		this.spr = new createjs.Container();
	}

	init(icon, bg1, bg2, bg3)
	{
		let width;
		let height;
		let bitmap1 = new createjs.Bitmap(bg1);
		bitmap1.regX = bg1.width / 2;
		bitmap1.regY = bg1.height / 2;

		width = bg1.width;
		height = bg1.height;

		let bitmap2 = new createjs.Bitmap(bg2);
		bitmap2.regX = bg2.width / 2;
		bitmap2.regY = bg2.height / 2;
		this._mask = bitmap2.mask = new createjs.Shape();
		this._maskRadius = Math.max(bg2.width, bg2.height) * 1.5;//1.5 === sqrt(2)
		this._bg2 = bitmap2;
		let iconBitmap = new createjs.Bitmap(icon);
		iconBitmap.regX = icon.width / 2;
		iconBitmap.regY = icon.height / 2;
		this._iconBitmap = iconBitmap;
		let iconY = -5;
		this._iconBitmap.y = iconY;

		let bitmap3 = new createjs.Bitmap(bg3);
		bitmap3.regX = bg3.width / 2;
		bitmap3.regY = bg3.height / 2;
		this._bg3 = bitmap3;
		this.spr.addChild(bitmap1);
		this.spr.addChild(bitmap2);
		this.spr.addChild(bitmap3);
		this.spr.addChild(iconBitmap);
		
		this.spr.mouseChildren = false;
		this.spr.addEventListener('mousedown', () =>
		{
			this._mouseDown = true;
			this._iconBitmap.y = iconY + 5 * res.GLOBAL_SCALE;
		});
		this.spr.addEventListener('pressup', () =>
		{
			this._mouseDown = false;
			this._iconBitmap.y = iconY;
			if (this.isEnergyFull())
			{
				if (this.onClick) this.onClick();
			}
		});
		let shape = new createjs.Shape();
		this.spr.hitArea = shape;
		{
			let g = shape.graphics;
			g.beginFill('white');
			g.drawRect(-width / 2, -height / 2, width, height);
			g.endFill();
		}
		let y0 = this._iconBitmap.y;
		let y1 = y0 - 20;
		this._iconAnimation = createjs.Tween.get(this._iconBitmap, { loop: true }).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(100).to({ y: y1 }, 100).to({ y: y0 }, 100).wait(5000 / 3);
		this._iconAnimation.setPaused(true);
		this._draw();
	}

	addEnergy(n)
	{
		let MAX_ENERGY = this.getMaxEnergy();
		if (n > 0 && this._showEnergy < MAX_ENERGY)
		{
			this._showEnergy += n;
			if (this._showEnergy > MAX_ENERGY)
			{
				this._showEnergy = MAX_ENERGY;
			}
			if (this._showEnergy === MAX_ENERGY)
			{
				SoundManager.playEffect('skillReady');
			}
			this._draw();
		}
	}

	clearEnergy()
	{
		if (this._showEnergy != 0)
		{
			this._showEnergy = 0;
			this._draw();
		}
	}

	isEnergyFull()
	{
		return this._showEnergy >= this.getMaxEnergy();
	}

	getMaxEnergy()
	{
		return this._maxEnergy;
	}
	setMaxEnergy(eng)
	{
		this._maxEnergy = eng | 0;
		if (this._maxEnergy == 0) this._maxEnergy = 1;
	}
	private _draw()
	{
		let g = this._mask.graphics;
		g.clear();
		if (this._showEnergy > 0)
		{
			this._bg2.visible = true;
			let percent = this._showEnergy / this.getMaxEnergy();
			let p0 = -Math.PI * 0.5;
			let p1 = p0 + percent * Math.PI * 2;
			g.beginFill('white');
			g.moveTo(0, 0);
			g.arc(0, 0, this._maskRadius, p0, p1, false);
			g.lineTo(0, 0);
			g.endFill();
		}
		else
		{
			this._bg2.visible = false;
		}
		this._bg3.visible = this._showEnergy >= this._maxEnergy;
		if (this._showEnergy >= this.getMaxEnergy())
		{
			this._iconAnimation.setPaused(false);
		}
		else
		{
			this._iconAnimation.setPosition(0, 0);
			this._iconAnimation.setPaused(true);
		}
	}
}