import {HallUI} from "./HallUI"
import {ImageButton} from "../ImageButton"
import {ProgressBarControl} from "./shared/ProgressBarControl"
import {SoundManager} from "../SoundManager"
import {DownloadAppConfirm} from "./confirm_dialog/DownloadAppConfirm"
import {GameLink} from "../GameLink"
const BASE_POS = { x: 50, y: 704 };
//每日任务的UI
export class DailyTaskBarUI
{
	spr: createjs.Container = new createjs.Container();
	width = 534;
	height = 88;
	private EMPTY_STAR_IMAGE = HallUI.getImage('hall/task_star0');
	private FULL_STAR_IMAGE = HallUI.getImage('hall/task_star1');
	private _btnConfig: ImageButton;
	private _starBitmap: createjs.Bitmap[] = [];
	private _progressBar: ProgressBarControl;
	private _progressText: createjs.Text;
	constructor()
	{
		this.spr.set(BASE_POS);
		let btnConfig = this._btnConfig = new ImageButton(HallUI.getImage('hall/gear'));
		btnConfig.set({ x: 45, y: 45 });

		let text = new createjs.Bitmap(HallUI.getImage('hall/daily_task_text'));
		text.set({ x: 100, y: 6 });

		for (let i = 0; i < 3; ++i)
		{
			let bitmap = new createjs.Bitmap(this.EMPTY_STAR_IMAGE);
			bitmap.set({
				x: 337 + i * 33,
				y: 6
			});
			this._starBitmap.push(bitmap);
		}
		//progress bar bg
		const PROGRESS_CENTER = { x: 275, y: 59 };
		let progress_background = new createjs.Bitmap(HallUI.getImage('hall/daily_task_progress_bg'));
		progress_background.set(PROGRESS_CENTER);
		progress_background.set({
			regX: progress_background.image.width / 2,
			regY: progress_background.image.height / 2
		});

		//progress bar
		const PROGRESS_BAR_WIDTH = 328;
		let _progressBar = this._progressBar = new ProgressBarControl();
		_progressBar.set({
			x: PROGRESS_CENTER.x - PROGRESS_BAR_WIDTH / 2,
			y: PROGRESS_CENTER.y - 13
		});
		_progressBar.maxWidth = PROGRESS_BAR_WIDTH;
		_progressBar.percent = 0.5;

		//progress text
		let _progressText = this._progressText = new createjs.Text('222/333', '25px SimHei', 'white');
		_progressText.set(PROGRESS_CENTER);
		_progressText.y -= 12;
		_progressText.textAlign = 'center';
		_progressText.shadow = new createjs.Shadow('#f0266f', 1, 2, 1);

		let downloadButton = new ImageButton(HallUI.instance.getImage('hall/download_button_image'));
		downloadButton.set({ x: 500, y: 50 });
		downloadButton.onClick = function ()
		{
			let dlg = new DownloadAppConfirm({
				onOk: function ()
				{
					GameLink.instance.sendTriggerEvent('DOWNLOAD_APP_AWARD');
				}
			});
			HallUI.instance.spr.addChild(dlg.spr);
		};

		this.spr.addChild(text);
		this.spr.addChild(btnConfig);
		for (let x of this._starBitmap) this.spr.addChild(x);
		this.spr.addChild(progress_background);
		this.spr.addChild(_progressBar);
		this.spr.addChild(_progressText);
		this.spr.addChild(downloadButton);
		this.setDailyTask({
			progress: 100,
			progressTotal: 200,
			finishedTaskCount: 1
		});

		btnConfig.image = SoundManager.muted ? HallUI.getImage('hall/sound_off') : HallUI.getImage('hall/sound_on');
		btnConfig.onClick = () =>
		{
			SoundManager.muted = !SoundManager.muted;
			btnConfig.image = SoundManager.muted ? HallUI.getImage('hall/sound_off') : HallUI.getImage('hall/sound_on');
		}
	}

	setDailyTask(obj: {
		progress: number,
		progressTotal: number,
		finishedTaskCount: number
	})
	{
		if (obj.progressTotal === 0)
		{
			this._progressText.text = '';
			this._progressBar.percent = 1;
		}
		else
		{
			this._progressText.text = `${obj.progress}/${obj.progressTotal}`;
			this._progressBar.percent = +(obj.progress / obj.progressTotal);
		}

		for (let i = 0; i < 3; ++i)
		{
			this._starBitmap[i].image = i < obj.finishedTaskCount ? this.FULL_STAR_IMAGE : this.EMPTY_STAR_IMAGE;
		}
	}

	setDailyTaskText(text: string)
	{
		this._progressText.text = text;
	}

	setDailyTaskPercent(p: number)
	{
		this._progressBar.percent = p;
	}

	setFinishedCount(n: number)
	{
		for (let i = 0; i < 3; ++i)
		{
			this._starBitmap[i].image = i < n ? this.FULL_STAR_IMAGE : this.EMPTY_STAR_IMAGE;
		}
	}

	show(isShow: boolean = true)
	{
		this.spr.visible = isShow;
	}
}