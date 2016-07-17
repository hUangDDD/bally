///<reference path="../typings/tsd.d.ts"/>



export function isPrimatyButton(e: createjs.MouseEvent)
{
	return e.nativeEvent.button == 0 || (window["TouchEvent"] && e.nativeEvent instanceof TouchEvent);
}

export function assert(test: any, msg?)
{
	if (!test)
	{
		let e = new Error('assert error');
		console.log(e);
		alert(msg);
	}
}
export function randomChoose<T>(arr: T[]): T
{
	let i = (Math.random() * arr.length) | 0;
	return arr[i];
}

export function clipImage(image: HTMLImageElement, x, y, width, height, scale?): HTMLCanvasElement
{
	let canvas = document.createElement('canvas');
	let cx = canvas.width = (width * scale) | 0;
	let cy = canvas.height = (height * scale) | 0;
	let ctx = canvas.getContext('2d');
	if (!scale || scale === 1)
	{
		ctx.drawImage(image, -x, -y);
	}
	else
	{
		ctx.drawImage(image, x, y, width, height, 0, 0, cx, cy);
	}
	return canvas;
}

export function cutRowImages(image: HTMLImageElement, n: number, scale?: number): HTMLCanvasElement[] 
{
	if (!scale) scale = 1;
	let ret = [];
	let width = (image.width / n) | 0;
	let height = image.height;
	for (let i = 0; i < n; ++i)
	{
		ret.push(clipImage(image, i * width, 0, width, height, scale));
	}
	return ret;
}

export function scaleImage(image: HTMLImageElement, scale?: number): HTMLCanvasElement 
{
	return clipImage(image, 0, 0, image.width, image.height, scale);
}
/**生成一个播放序列帧的Tween */
export function animTween(bitmap: createjs.Bitmap, arr: any[], time: number, autoRemove?: boolean)
{
	bitmap.image = arr[0];
	let obj = {
		_frame: 0,
		bitmap,
		arr
	};
	Object.defineProperty(obj, 'frame', {
		get: function () { return this._frame },
		set: function (val)
		{
			this._frame = val;
			this.bitmap.image = this.arr[val | 0];
		}
	});
	let tween = createjs.Tween.get(obj).to({ frame: arr.length - 1 }, time);
	if (autoRemove)
	{
		tween = tween.call(function (x: any)
		{
			if (x.parent) x.parent.removeChild(x);
		}, [bitmap])
	}
	return tween;
}

export function sqrDistance(a: { x: number; y: number; }, b: { x: number; y: number; }): number
{
	let dx = a.x - b.x;
	let dy = a.y - b.y;
	return dx * dx + dy * dy;
}

export function intToString(n)
{
	n = n | 0;
	let str = n.toString();
	let arr = [];
	let arr2 = [];
	for (let c of str) arr.push(c);
	for (let i = arr.length - 1, j = 0; i >= 0; --i, ++j)
	{
		if (j > 0 && j % 3 == 0 && arr[i] != '-')
		{
			arr2.push(',');
		}
		arr2.push(arr[i]);
	}
	return arr2.reverse().join('');
}
export function getParameterByName(name, url?)
{
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function shuffle(arr: any[])
{
	for (let i = 0; i < arr.length; ++i)
	{
		let j = (Math.random() * arr.length) | 0;
		if (i !== j)
		{
			let tmp = arr[i];
			arr[i] = arr[j];
			arr[j] = tmp;
		}
	}
}

export function getQueryString(): any
{
	let obj: any = {};
	let ss = location.search;
	if (ss && ss[0] == '?')
	{
		ss = ss.substr(1);
		for (let pair of ss.split('&'))
		{
			let pos = pair.indexOf('=');
			if (pos >= 0)
			{

				let left = decodeURIComponent(pair.substr(0, pos));
				let right = decodeURIComponent(pair.substr(pos + 1));
				obj[left] = right;
			}
		}
	}
	return obj;
}

export function encodeQueryString(obj: any) 
{
	let str = "";
	for (let key in obj)
	{
		str += encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&';
	}
	return str;
}