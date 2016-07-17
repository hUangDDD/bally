import {HallUI} from "../HallUI"
export class TaskLine
{
	spr = new createjs.Container();
	width = 0;
	height = 0;
	onClick: Function;
	idx = -1;
	task: any;
	//images
	private NORMAL_BACKGROUND = HallUI.getImage('hall/weekly_task_item_bg');
	private SATISFIED_BACKGROUND = HallUI.getImage('hall/weekly_task_item_bg(satisfied)');
	private UNKNOWN_BACKGROUND = HallUI.getImage('hall/weekly_task_item_bg(unknown)');
	private FINISHED_MASK = HallUI.getImage('hall/weekly_task_item_bg(finish mask)')


	private UNFINISH_POINT = HallUI.getImage('hall/weekly_task_item_point_empty');
	private FINISH_POINT = HallUI.getImage('hall/weekly_task_item_point_full');

	private PRIZE_DIAMOND = HallUI.getImage('hall/new_weekly_task_prize1');
	private PRIZE_COIN = HallUI.getImage('hall/new_weekly_task_prize0');
	private PRIZE_HEART = HallUI.getImage('hall/new_weekly_task_prize2');

	private _scaleContainer = new createjs.Container();
	private _background: createjs.Bitmap;
	//widget
	private _taskName: createjs.Text;
	private _points: createjs.Bitmap[];
	private _taskProgessText: createjs.Text;
	private _getPrizeText: createjs.Bitmap;
	private _finishedMask: createjs.Bitmap;
	private _prizeIcon: createjs.Bitmap;
	constructor()
	{
		let cc = this._scaleContainer;
		let background = this._background = new createjs.Bitmap(this.NORMAL_BACKGROUND);
		this.width = background.image.width;
		this.height = background.image.height;
		cc.addChild(background);

		//task name
		this._taskName = new createjs.Text('', '27px SimHei', 'white');
		this._taskName.set({ x: 27, y: 21 });
		cc.addChild(this._taskName);
		//points
		this._points = [];
		for (var i = 0; i < 5; ++i)
		{
			var pp = new createjs.Bitmap(null);
			pp.set({ x: 246 + 37 * i, y: 22 });
			cc.addChild(pp);
			this._points.push(pp);
		}
		//progress text
		this._taskProgessText = new createjs.Text('', '20px SimHei', 'white');
		this._taskProgessText.set({ x: 332, y: 28, textAlign: 'center' });
		cc.addChild(this._taskProgessText);

		//get prize text
		this._getPrizeText = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_get_prize_text'));
		this._getPrizeText.set({ x: 259, y: 19 });
		cc.addChild(this._getPrizeText);


		//prizeIcon
		this._prizeIcon = new createjs.Bitmap(null);
		this._prizeIcon.set({ x: 475, y: 35 });
		cc.addChild(this._prizeIcon);

		//finish mask
		this._finishedMask = new createjs.Bitmap(this.FINISHED_MASK);
		cc.addChild(this._finishedMask);

		this._scaleContainer.regX = this.width / 2;
		this._scaleContainer.regY = this.height / 2;
		this.spr.addChild(this._scaleContainer);
		let hitArea = new createjs.Bitmap(this.NORMAL_BACKGROUND);
		hitArea.regX = this.width / 2;
		hitArea.regY = this.height / 2;
		this.spr.hitArea = hitArea;
		this.spr.addEventListener('mousedown', e =>
		{
			this._setScale(0.9);
		})
		this.spr.addEventListener('pressup', e =>
		{
			this._setScale(1);
		})
		this.spr.addEventListener('click', e =>
		{
			if (this.onClick) this.onClick(this);
		});
		this.spr.setBounds(-this.width / 2, -this.height / 2, this.width, this.height);
	}
	private _hideAllExcept(arr: createjs.DisplayObject[])
	{
		var cc = this._scaleContainer;
		for (var i = 0; i < cc.children.length; ++i)
		{
			var spr = cc.children[i];
			if (spr === this._background || arr.indexOf(spr) >= 0)
			{
				spr.visible = true;
			}
			else
			{
				spr.visible = false;
			}
		}
	}

	setNoTask()
	{
		this.task = null;
		this._hideAllExcept([]);
		this._background.image = this.UNKNOWN_BACKGROUND;
	}

	setUnknownTask(showText?: boolean, prizeType?: string, prizeCount?: number)
	{
		this._hideAllExcept([]);
		this._background.image = this.UNKNOWN_BACKGROUND;
		this._setPrize(prizeType);
	}

	setFinishedTask(name: string)
	{
		this._hideAllExcept([this._taskName]);
		this._taskName.text = name;
		this._background.image = this.NORMAL_BACKGROUND;
		this._finishedMask.visible = true;
	}

	setSatisfisedTask(name: string)
	{
		this._hideAllExcept([this._taskName, this._getPrizeText]);
		this._taskName.text = name;
		this._background.image = this.SATISFIED_BACKGROUND;
	}

	setPointTask(name: string, pointCount: number, maxPointCount: number, prizeType?: 'diamond' | 'coin' | 'heart')
	{
		this._hideAllExcept([this._taskName]);
		this._taskName.text = name;
		this._background.image = this.NORMAL_BACKGROUND;

		for (var i = 0; i < this._points.length; ++i)
		{
			var pp = this._points[i];
			if (i >= maxPointCount)
			{
				pp.visible = false;
				continue;
			}
			pp.visible = true;
			pp.image = i < pointCount ? this.FINISH_POINT : this.UNFINISH_POINT;
		}
		this._setPrize(prizeType);
	}

	setProgressTask(name: string, progress: number, totalProgress: number, prizeType?: 'diamond' | 'coin' | 'heart')
	{
		this._hideAllExcept([this._taskName, this._taskProgessText]);
		this._background.image = this.NORMAL_BACKGROUND;
		this._taskName.text = name;
		this._taskProgessText.text = `${progress | 0}/${totalProgress | 0}`;
		this._setPrize(prizeType);
	}
	private _setPrize(prizeType: string, prizeCount?: number)
	{
		var image = null;
		switch (prizeType)
		{
			case 'diamond':
				image = this.PRIZE_DIAMOND;
				break;
			case 'coin':
				image = this.PRIZE_COIN;
				break;
			case 'heart':
				image = this.PRIZE_HEART;
				break;
		}
		if (!image)
		{
			this._prizeIcon.visible = false;
			return;
		}
		
		this._prizeIcon.visible = true;
		this._prizeIcon.image = image;
		this._prizeIcon.regX = image.width / 2;
		this._prizeIcon.regY = image.height / 2;
	}
	private _setScale(s)
	{
		this._scaleContainer.scaleX = s;
		this._scaleContainer.scaleY = s;
	}
}