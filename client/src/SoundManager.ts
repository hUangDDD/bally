
export class SoundManager
{
	static ballBombSound = [
		{ id: 'ballbomb0', src: 'se09.mp3' },
		{ id: 'ballbomb1', src: 'se10.mp3' },
		{ id: 'ballbomb2', src: 'se11.mp3' },
		{ id: 'ballbomb3', src: 'se12.mp3' },
		{ id: 'ballbomb4', src: 'se13.mp3' },
		{ id: 'ballbomb5', src: 'se14.mp3' },
		{ id: 'ballbomb6', src: 'se15.mp3' },
		{ id: 'ballbomb7', src: 'se16.mp3' },
		{ id: 'ballbomb8', src: 'se17.mp3' },
		{ id: 'ballbomb9', src: 'se18.mp3' },
		{ id: 'ballbomb10', src: 'se19.mp3' },
		{ id: 'ballbomb11', src: 'se20.mp3' },
		{ id: 'ballbomb12', src: 'se21.mp3' },
		{ id: 'ballbomb13', src: 'se22.mp3' },
		{ id: 'ballbomb14', src: 'se23.mp3' },
		{ id: 'ballbomb15', src: 'se24.mp3' },
	];
	static init()
	{
		window['sound'] = this;
		let soundarr = [
			{ id: 'click', src: '格式工厂点击按钮.mp3' },
			{ id: 'linkBall', src: '格式工厂点击果冻.mp3' },
			{ id: 'skillReady', src: '格式工厂技能充能完毕.mp3' },
			{ id: 'nearTimeover', src: '格式工厂倒计时.mp3' },
			{ id: 'readygo', src: '格式工厂readygo.mp3' },
			{ id: 'openPet', src: '开启果冻.mp3' },
			{ id: 'timeover', src: 'jin1gle04.mp3' },
			//bgs
			{ id: 'bgMain', src: '格式工厂主界面.mp3' },
			{ id: 'bgGame', src: '格式工厂游戏中正常背音.mp3' },
			{ id: 'bgFever', src: '格式工厂狂热.mp3' },
			{ id: 'bgGameOver', src: '格式工厂评分界面.mp3' },
			{ id: 'bgPet', src: '格式工厂宠物培养界面.mp3' },
		];
		try
		{
			createjs.Sound.registerSounds(soundarr, '/sound/')
			createjs.Sound.registerSounds(this.ballBombSound, '/sound/爆破声音/');
		}
		catch (e)
		{
			alert('registerSounds error:' + e);
			alert(e['stack']);
		}

		createjs.Sound.addEventListener('fileload', (e: any) =>
		{
			if (e.id === this._currentBgId)
			{
				try
				{
					this._currentBg.play(null, null, null, -1);
				}
				catch (e)
				{

				}
			}
		});
		onDocumentVisibilityChanged((hidden) =>
		{
			this.background = hidden;
		});

		this.muted = localStorage.getItem('mutted') === 'true' ? true : false;
	}

	static playEffect(id: string)
	{
		if (this.muted || this.background) return;
		try
		{
			return createjs.Sound.play(id);
		}
		catch (e)
		{
			console.error('play sound error:', e);
		}

	}

	static playBallBomb(index: number)
	{
		if (this.muted || this.background) return;
		if (index < 0) index = 0;
		else if (index >= this.ballBombSound.length) index = this.ballBombSound.length - 1;
		this.playEffect(this.ballBombSound[index].id);
	}

	static _currentBg: createjs.AbstractSoundInstance;
	static _currentBgId: string;
	static playBg(id: string, noLoop?)
	{
		if (id === this._currentBgId) return;
		if (this._currentBg)
		{
			try
			{
				this._currentBg.stop();
			}
			catch (e)
			{

			}

			this._currentBg = null;
		}
		this._currentBgId = id;
		if (id)
		{
			let loop = noLoop ? undefined : -1;
			try
			{
				this._currentBg = createjs.Sound.play(id, null, 0, 0, loop);
			}
			catch (e)
			{
				console.error('play sound error:', e);
			}
			return this._currentBg;
		}
		return null;
	}
	static _background = false;
	static get background() { return this._background; }
	static set background(val)
	{
		this._background = val;
		createjs.Sound.volume = val ? 0 : 1;
	}
	static get muted() { return createjs.Sound.muted; }
	static set muted(val)
	{
		createjs.Sound.muted = val;
		localStorage.setItem('mutted', val.toString());
	}
}


function onDocumentVisibilityChanged(callback: (isHidden: boolean) => void)
{
	var hidden, visibilityChange;
	if (typeof document['webkitHidden'] !== "undefined")
	{
		hidden = "webkitHidden";
		visibilityChange = "webkitvisibilitychange";
	}
	else if (typeof document.hidden !== "undefined")
	{ // Opera 12.10 and Firefox 18 and later support 
		hidden = "hidden";
		visibilityChange = "visibilitychange";
	} else if (typeof document['mozHidden'] !== "undefined")
	{
		hidden = "mozHidden";
		visibilityChange = "mozvisibilitychange";
	} else if (typeof document.msHidden !== "undefined")
	{
		hidden = "msHidden";
		visibilityChange = "msvisibilitychange";
	}

	function handleVisibilityChange()
	{
		if (document[hidden])
		{
			callback(true)
		}
		else
		{
			callback(false);
		}
	}
	document.addEventListener(visibilityChange, handleVisibilityChange, false);
}