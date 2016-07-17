///<reference path="../../typings/tsd.d.ts"/>


/**
 * 非负整数n，转换成图片,剧中排列 
 * digits保存了图片，需要11个 0123456789,
 * 返回的bitmap已经调整好位置了，使得原点在整个字的中下。
 */
export function createDigitBitmap(n:number,digits:HTMLCanvasElement[],useComma:boolean):createjs.Bitmap[]
{
	let ret = [];
	if (n < 0) n = 0;
	let str = (n|0).toString();
	if (useComma)
	{
		let arr = [];
		let arr2 = [];
		for(let c of str)
		{
			arr.push(c);
		}
		arr = arr.reverse();
		for(let i=0;i<arr.length;++i)
		{
			if (i > 0 && i%3==0) arr2.push(',');
			arr2.push(arr[i]);
		}
		str = arr2.reverse().join('');
	}
	//暂时只考虑所有图片大小都是相同的情况
	let width = digits[0].width;
	let height = digits[0].height;
	let x = -(width * str.length)/2;
	let y = -height;
	for(let i=0;i<str.length;++i)
	{
		let c = str[i];
		let image;
		if (c == ',')
		{
			image = digits[10];
		}
		else
		{
			image = digits[(c as any)|0];
		}
		if (image)
		{
			let bitmap = new createjs.Bitmap(image);
			bitmap.x = x;
			bitmap.y = y;
			x += width;
			ret.push(bitmap);
		}
	}
	return ret;
}

/**
 * TweenJs用的辅助函数
 */
export function removeSelfCallback(obj:any)
{
	if (obj && obj.parent)
	{
		obj.parent.removeChild(obj);
	}
}


export function intToString(n) {
	n = n|0;
	let str = n.toString();
	let arr = [];
	let arr2 = [];
	for(let c of str) arr.push(c);
	for(let i=arr.length-1,j=0;i>=0;--i,++j)
	{
		if (j > 0 && j%3 ==0 && arr[i] != '-')
		{
			arr2.push(',');
		}
		arr2.push(arr[i]);
	}
	return arr2.reverse().join('');
}

export function circleSegmentIntersect(segmentP0,segmentP1,center,radius)
{
	let dot = (a,b) => a.x*b.x+a.y*b.y;
	let d = {
		x:segmentP1.x - segmentP0.x,
		y:segmentP1.y - segmentP0.y
	};
	let f = {
		x:segmentP0.x - center.x,
		y:segmentP0.y - center.y
	};
	let r = radius;
	let a = dot(d,d);
	let b = 2 * dot(f,d);
	let c = dot(f,f) - r*r;
	
	let discriminant = b*b-4*a*c;
	if (discriminant < 0) return false;
	
	discriminant = Math.sqrt(discriminant);
	
	let t1 = (-b-discriminant)/(2*a);
	let t2 = (-b+discriminant)/(2*a);
	if (t1 >= 0 && t1 <= 1) return true;
	if (t2 >= 0 && t2 <= 1) return true;
	return false;
}

/**
 * 用来辅助做tween的obj
 * 因为createjs.Tween只支持设置属性，所以ScoreTweenHelper将set value变成回掉函数
 * 
 * obj = new ScoreTweenHelper(初始数值, function(intValue){
 * 		//当调用obj.value = xxx的时候，调用这个回掉函数
 * })
 * 
 * Tween.get(obj).to({value: 目标数值 })
 * 
 */
export class ScoreTweenHelper
{
	_value = 0;
	_setter:Function;
	constructor(value:number,setter:(val:number)=>any)
	{
		this._value = value;
		this._setter = setter;
	}
	
	get value()
	{
		return this._value;
	}
	
	set value(val)
	{
		let iVal = val | 0;
		if (iVal !== (this._value|0))
		{
			this._setter(iVal);
		}
		this._value = val;
	}
	
}
