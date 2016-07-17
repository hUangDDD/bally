import {HallUI} from "../HallUI"
import {GameStage} from "../../GameStage"
const EXTRA_HEIGHT = 40;
export class HorizontalPagePanel
{
	spr = new createjs.Container();

	private _hitArea = new createjs.Shape();
	private _pageWidth = 0;
	private _pageHeight = 0;
	private _pages: createjs.DisplayObject[] = [];

	//currentPage 决定了当前是哪一页，offsetPosition决定了偏移多少像素。
	//offsetPosition > 0表示向右拖动
	private _currentPage = 0;
	private _offsetPosition = 0;
	private _lastX = 0;
	private _moveTween: createjs.Tween;
	private _pointer: createjs.Bitmap[] = [];
	private EMPTY_POINT = HallUI.getImage('hall/new_pager_point_empty');
	private FULL_POINT = HallUI.getImage('hall/new_pager_point_full');
	//当mousedown事件中判断到，点击的point，则禁止当前的拖移操作
	private _forbidDragThisTime = false;
	constructor()
	{
		this._hitArea.hitArea = new createjs.Shape();
		this.spr.addChild(this._hitArea);
		this.spr.addEventListener('mousedown', e => this._onMouseDown(e as any));
		this.spr.addEventListener('pressup', e => this._onPressUp(e as any));
		this.spr.addEventListener('pressmove', e => this._onPressDrag(e as any));
	}
	setPos(x: number, y: number)
	{
		this.spr.x = x;
		this.spr.y = y;
		this._repaintMyMask();
	}
	setPageSize(width: number, height: number)
	{
		if (width !== this._pageWidth || height !== this._pageHeight)
		{
			this._pageWidth = width;
			this._pageHeight = height;

			let g = this._hitArea.hitArea["graphics"] as createjs.Graphics;
			g.clear();
			g.beginFill('rgba(0,0,0,0.2)');
			g.drawRect(0, 0, width, height + EXTRA_HEIGHT);
			g.endFill();
			this._repaintMyMask();
		}
	}

	private _repaintMyMask()
	{
		var mask = this.spr.mask;
		if (!mask)
		{
			mask = this.spr.mask = new createjs.Shape();
		}
		var g = mask.graphics;
		g.clear();
		g.beginFill('white')
		g.drawRect(this.spr.x, this.spr.y, this._pageWidth, this._pageHeight + 50);
		g.endFill();
	}

	/**
	 * 加入的page假定，bounds是 {0,0,pageWdith,pageHeight}
	 */
	addPage(page: createjs.DisplayObject)
	{
		page.y = 0;
		this.spr.addChild(page);
		this._pages.push(page);
		this._updateLayout();
		this._setPointCount(this._pages.length);
	}

	_setPointCount(n)
	{
		const HALF_SIZE = 10;
		//if (n == this._pointer.length) return;
		if (this._pointer.length < n)
		{
			for (let i = this._pointer.length; i < n; ++i)
			{
				let bitmap = new createjs.Bitmap(this.EMPTY_POINT);
				bitmap.regX = HALF_SIZE;
				bitmap.regY = HALF_SIZE;
				this.spr.addChild(bitmap);
				this._pointer.push(bitmap);
			}
		}
		if (this._pointer.length > n)
		{
			for (let i = n; i < this._pointer.length; ++i)
			{
				this.spr.removeChild(this._pointer[i]);
			}
			this._pointer.length = n;
		}

		//layer
		let center = {
			x: this._pageWidth / 2,
			y: this._pageHeight + 20
		};
		const MAX_SPAN = 55;

		let span = MAX_SPAN;
		let x = center.x - (n - 1) / 2 * span;
		for (let i = 0; i < this._pointer.length; ++i)
		{
			this._pointer[i].x = x;
			this._pointer[i].y = center.y;
			x += span;
		}
	}
	_hitTestPoint(x, y)
	{
		if (y >= this._pageHeight)
		{
			let minDx = 9999;
			let cc = -1;
			for (let i = 0; i < this._pointer.length; ++i)
			{
				let pt = this._pointer[i];
				let dx = Math.abs(x - pt.x);
				if (dx < minDx)
				{
					minDx = dx;
					cc = i;
				}
			}
			return cc;
		}

		return -1;
	}
	_onMouseDown(e: createjs.MouseEvent)
	{
		this._lastX = e.stageX;
		let ptIndex = this._hitTestPoint(e.localX, e.localY);
		if (ptIndex >= 0 && ptIndex < this._pages.length)
		{
			this._forbidDragThisTime = true;
			if (ptIndex != this._currentPage)
			{
				this._stopTween();
				this._tweenToPage(ptIndex);
			}
			else
			{

			}
		}
		else
		{
			this._forbidDragThisTime = false;
		}
	}
	_onPressDrag(e: createjs.MouseEvent)
	{
		if (this._forbidDragThisTime) return;
		if (createjs.Tween.hasActiveTweens(this))
		{
			this._lastX = e.stageX;
			return;
		}
		let dx = e.stageX - this._lastX;
		if (Math.abs(dx) >= 100)
		{
			this._lastX = e.stageX;
			var newpage = this._currentPage;
			if (dx > 0)
				newpage = newpage - 1;
			else
				newpage = newpage + 1;
			if (newpage >= 0 && newpage < this._pages.length)
			{
				this._tweenToPage(newpage);
			}
		}
	}
	_onPressUp(e: createjs.MouseEvent)
	{
		if (this._forbidDragThisTime) return;
		/*
		if (this._offsetPosition != 0)
		{
			let newPage = this._calcNewPage();
			this._tweenToPage(newPage);
			//this._currentPage = newPage;
			//this._offsetPosition = 0;
			this._updateLayout();
			GameStage.instance.makeDirty();
		}
		*/
	}
	_stopTween()
	{
		if (this._moveTween)
		{
			this._moveTween.setPaused(true);
			this._moveTween = null;
		}
	}
	_tweenToPage(n)
	{
		if (this._moveTween)
		{
			this._moveTween.setPaused(true);
			this._moveTween = null;
		}
		const DURATION = 500;
		if (n == this._currentPage && this._offsetPosition == 0) return;
		this._offsetPosition = this._calcOffsetWithNewCurrent(n);
		this._currentPage = n;
		this._updateLayout();
		this._moveTween = createjs.Tween.get(this).to({ _offsetPosition: 0 }, DURATION, createjs.Ease.cubicOut);
		this._moveTween.addEventListener('change', () =>
		{
			this._updateLayout();
		})
	}

	/** 计算，当n变成currentPage，要保持当前界面位置的时候，需要把offsetPosition设置成什么值 */
	_calcOffsetWithNewCurrent(n)
	{
		if (n == this._currentPage) return this._offsetPosition;
		let offset = this._offsetPosition;
		//x == this._page[n] 当前应该的x坐标
		let x = offset + (n - this._currentPage) * this._pageWidth;
		return x;
	}
	/** 根据当前currentPage和offsetPosition，计算出是否要切换page */
	_calcNewPage()
	{
		//下面的算法没什么效率，但是比较直观
		//选择一个页面，切换到它所需要移动的距离最小（移动就是把offsetPosition变成0）。
		let idx = this._currentPage;
		let m = Math.abs(this._offsetPosition);
		if (!this._pages[idx]) return idx;
		for (let i = 0; i < this._pages.length; ++i)
		{
			if (i != idx)
			{
				let mm = Math.abs(this._calcOffsetWithNewCurrent(i));
				if (mm < m)
				{
					m = mm;
					idx = i;
				}
			}
		}

		return idx;
	}
	/** 无论何时，当offsetPosition或currentPage改变的时候，调用这个改变布局 */
	_updateLayout()
	{
		if (!this._pages[this._currentPage]) return;
		let offsetPosition = this._offsetPosition;
		if (offsetPosition === 0)
		{
			this._pages[this._currentPage].x = 0;
			for (let i = 0; i < this._pages.length; ++i)
			{
				this._pages[i].visible = i === this._currentPage;
				if (i < this._pointer.length)
				{
					this._pointer[i].image = i === this._currentPage ? this.FULL_POINT : this.EMPTY_POINT;
				}
			}
			return;
		}
		//drag left
		let pageWidth = this._pageWidth;
		if (offsetPosition < 0)
		{
			let n = ((-offsetPosition / pageWidth) + 1) | 0; //除了current额外需要显示的page个数
			for (let i = 0; i < this._pages.length; ++i)
			{
				let page = this._pages[i];
				let dist = i - this._currentPage;
				if (dist <= n && dist >= 0)
				{
					page.visible = true;
					page.x = offsetPosition + dist * pageWidth;
				}
				else
				{
					page.visible = false;
				}
			}
		}

		//drag right
		if (this._offsetPosition > 0)
		{
			let n = (offsetPosition / pageWidth + 1) | 0;
			for (let i = 0; i < this._pages.length; ++i)
			{
				let page = this._pages[i];
				let dist = this._currentPage - i;
				if (dist <= n && dist >= 0)
				{
					page.visible = true;
					page.x = offsetPosition - dist * pageWidth;
				}
				else
				{
					page.visible = false;
				}
			}
		}
	}
}