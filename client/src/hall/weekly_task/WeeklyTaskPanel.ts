import {HallUI} from "../HallUI"
import {VerticalScrollPanel} from "../shared/VerticalScrollPanel"
import {TaskLine} from "./TaskLine"
import {GameLink} from "../../GameLink"
import {CutStyleProgressBar} from "../shared/CutStyleProgressBar"
/** 面板的位置 */
const BASE_POS = { x: 23, y: 204 - 46 };

export class WeeklyTaskPanel
{
	spr = new createjs.Container();
	private _taskPanel: VerticalScrollPanel;
	private _taskLines: TaskLine[] = [];
	private _taskProgress: CutStyleProgressBar;
	private _taskProgressText: createjs.Text;
	private _prizeIcons: createjs.Bitmap[] = [];
	private _petIcon: createjs.Bitmap;
	get taskLines() { return this._taskLines; }

	constructor()
	{
		let background = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_background'));
		background.set(BASE_POS);

		/*let title = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_title'));
		title.set({
			x: BASE_POS.x + 24,
			y: BASE_POS.y + 25
		});*/
/*
		let task_desc = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_desc'));
		task_desc.set({ x: BASE_POS.x + 23, y: BASE_POS.y + 100 });
*/
		let taskPanel = this._taskPanel = new VerticalScrollPanel();
		taskPanel.setPos({ x: 60, y: 428 - 46 });
		taskPanel.setSize(530, 416);
		//taskPanel.setVisualizeMask(true);



		//text
		//let progressTextBitmap = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_progress_text'))
		//progressTextBitmap.x = 77;
		//progressTextBitmap.y = 716;

		//text
		let taskProgressText = this._taskProgressText = new createjs.Text('0/100', '22px SimHei', 'white');
		taskProgressText.textAlign = 'center';
		taskProgressText.x = 119;
		taskProgressText.y = 860;

		//progress bg
		//let taskProgressBg = new createjs.Bitmap(HallUI.getImage('hall/weekly_task_progress_bg'));
		//taskProgressBg.x = 208;
		//taskProgressBg.y = 716;

		let taskProgress = this._taskProgress = new CutStyleProgressBar(HallUI.getImage('hall/weekly_task_progress'));
		taskProgress.x = 207;
		taskProgress.y = 834;
		taskProgress.percent = 1;

		let petIcon = this._petIcon = new createjs.Bitmap(null);
		petIcon.visible = false;
		petIcon.regX = 40;
		petIcon.regY = 40;
		petIcon.scaleX = 0.5;
		petIcon.scaleY = 0.5;
		Object.defineProperty(petIcon, 'image', {
			get: () =>
			{
				return HallUI.instance.getPetImage(GameLink.instance.currentPet);
			}
		});

		this.spr.addChild(background);
		this.spr.addChild(taskPanel.spr);
		this.spr.addChild(taskProgressText);
		this.spr.addChild(taskProgress);
		this.spr.addChild(petIcon);
		this._setTaskCount(1);
		this._taskLines[0].setNoTask();
		this.spr.visible = false;
	}
	setProgress(n: number, total: number)
	{
		this._taskProgressText.text = `${n}/${total}`;
		if (total != 0)
			this._taskProgress.percent = n / total;
		else
			this._taskProgress.percent = 0;
	}
	show(isShow = true)
	{
		if (!this.spr.visible && isShow)
		{
			//GameLink.instance.sendReqWeeklyTask();
			this._shakePetIcon();
		}
		this.spr.visible = isShow;
	}

	setTaskCount(n)
	{
		this._setTaskCount(n);
	}
	setPetProgress(pp: number)
	{
		let y = 849;
		let x0 = 222;
		let x1 = x0 + 337;
		let lastvisible = this._petIcon.visible;
		this._petIcon.visible = true;
		this._petIcon.x = x0 + (x1 - x0) * pp;
		this._petIcon.y = y;
		if (!lastvisible)
		{
			this._shakePetIcon();
		}
	}

	private _shakePetIcon()
	{
		if (this._petIcon.visible)
		{
			createjs.Tween.removeTweens(this._petIcon);
			let y = 849;
			createjs.Tween.get(this._petIcon).to({ y: y - 10 }, 100).to({ y: y }, 1000, createjs.Ease.getElasticOut(1, 0.2));
		}
	}
	iconTweens: createjs.Tween[] = [];
	setTaskPrize(prizeTypes: string[])
	{
		for (let t of this.iconTweens)
		{
			t.setPaused(true);
		}
		this.iconTweens.length = 0;
		let y = 849;
		let x0 = 222;
		let x1 = x0 + 327;
		let icons = this._prizeIcons;
		if (prizeTypes.length === 0)
		{
			for (let bmp of icons)
			{
				this.spr.removeChild(bmp);
			}
			icons.length = 0;
			return;
		}
		while (icons.length > prizeTypes.length)
		{
			this.spr.removeChild(icons.pop());
		}
		while (icons.length < prizeTypes.length)
		{
			let bmp = new createjs.Bitmap(null);
			icons.push(bmp);
			this.spr.addChildAt(bmp, this.spr.getChildIndex(this._petIcon));
		}
		let span = 0;
		if (prizeTypes.length >= 2)
			span = (x1 - x0) / (prizeTypes.length - 1);
		for (let i = 0; i < icons.length; ++i)
		{
			let bitmap = icons[i];
			let type = prizeTypes[i];
			let image;
			bitmap.set({ x: x0 + span * (i + 1), y: y });

			switch (type)
			{
				case 'coin':
					image = HallUI.getImage('hall/new_weekly_task_prize1');
					break;
				case 'diamond':
					image = HallUI.getImage('hall/new_weekly_task_prize0');
					break;
				case 'heart':
					image = HallUI.getImage('hall/new_weekly_task_prize2');
					break;
				default:
					image = null;
			}
			if (icons.length - 1 === i)
			{
				image = HallUI.getImage('hall/new_weekly_task_prize_final')
			}
			bitmap.image = image;
			if (image)
			{
				bitmap.scaleX = 0.8;
				bitmap.scaleY = 0.8;
				bitmap.regX = image.width / 2;
				bitmap.regY = image.height / 2;

				if (icons.length - 1 !== i)
				{
					bitmap.y = y - 5;
					let t = createjs.Tween.get(bitmap, { loop: true }).to({ y: y + 5 }, 1000).to({ y: y - 5 }, 1000);
					t.setPosition(Math.random() * 1000, createjs.Tween.NONE);
					this.iconTweens.push(t);
				}

			}
			else
			{
				bitmap.visible = false;
			}
		}
	}

	makeTaskVisible(idx: number)
	{
		const EACH_HEIGHT = 63;
		const SPAN = 10;
		let y0 = idx * (EACH_HEIGHT + SPAN) + SPAN;
		let y1 = y0 + EACH_HEIGHT;

		let panelHeight = this._taskPanel.height;
		let pos = this._taskPanel.position;
		let pos2 = pos + panelHeight;
		let newpos;
		if (y1 > pos2)
		{
			newpos = y1 + 10 - panelHeight;
		}
		else if (pos > y0)
		{
			newpos = y0 - 10;
		}
		else
		{
			return;
		}
		this._taskPanel.position = newpos;
	}

	private _setTaskCount(n: number)
	{
		const EACH_HEIGHT = 70;
		const SPAN = 10;
		if (this._taskLines.length > n)
		{
			for (let i = n; i < this._taskLines.length; ++i)
			{
				this._taskPanel.removeChild(this._taskLines[i].spr);
			}
		}
		else if (this._taskLines.length < n)
		{
			for (let i = this._taskLines.length; i < n; ++i)
			{
				let task = new TaskLine();
				task.setUnknownTask(false);
				task.spr.set({
					x: 10 + task.width / 2,
					y: i * (EACH_HEIGHT + SPAN) + SPAN + task.height / 2
				});
				task.idx = this._taskLines.length;
				this._taskLines.push(task);
				this._taskPanel.addChild(task.spr);
				task.onClick = (item) =>
				{
					this._onClickItem(item);
				}
			}
		}
		this._taskPanel.contentHeight = n * (EACH_HEIGHT + SPAN) + SPAN;
		this._taskLines.length = n;
	}


	private _onClickItem(line: TaskLine)
	{
		if (line.task && line.task.status === 'satisfied')
		{
			GameLink.instance.sendReqEndWeeklyTask();
		}
		else if (!line.task && this.taskLines.length === 1)
		{
			GameLink.instance.sendReqWeeklyTask();
		}
		else if (line.task && line.task.status === 'running')
		{
			HallUI.instance.showGameReadyPanel();
		}
		else
		{
			let text = new createjs.Text('完成上个冒险解锁', '42px SimHei', '#142d3e');
			text.textAlign = 'center';
			text.x = 320;
			text.y = 600;
			text.alpha = 1;

			HallUI.instance.spr.addChild(text);
			createjs.Tween.get(text).to({ alpha: 0, y: 350 }, 1000).call(() =>
			{
				if (text.parent) text.parent.removeChild(text);
			});
		}
	}
}
