
import {GraphicConstant as GC} from "./resource"
import {GameStage} from "./GameStage";
export interface ILoadItem
{
	id:string;
	src:string;
	defered?:boolean;
	width?:number;
	height?:number;
	
	img?:HTMLImageElement;
	loaded?:boolean;
	loadError?:boolean;
	//保存2个function用来removeEventListener(...)
	f1?:any;
	f2?:any;
}
let g_ImageCache:any = {};
export class ImageLoader
{
	private res:ILoadItem[];
	private deferedRes:ILoadItem[];
	onComplete:Function;
	onProgress:Function;
	onError:Function;
	private closed:boolean;
	spr:createjs.Container;
	constructor(res:ILoadItem[])
	{
		this.closed = true;
		this.init(res);
	}
	//点“重试”按钮的时候，调用这个函数
	init(res:ILoadItem[])
	{
		this.close();
		this.closed = false;
		this.res = res.filter(x=>!x.defered)
		this.deferedRes = res.filter(x=>x.defered);
		
		res = this.res;
		for(var i=0;i<res.length;++i)
		{
			let src = this.res[i].src;
			if (src in g_ImageCache)
			{
				res[i].img = g_ImageCache[src];
				res[i].loaded = true;
				res[i].loadError = false;
			}
			else
			{
				res[i].img = new Image();
				res[i].loaded = false;
				res[i].loadError = false;
				var f1 = this._imgComplete.bind(this,res[i]);
				var f2 = this._imgError.bind(this,res[i]);
				res[i].f1 = f1;
				res[i].f2 = f2;
				res[i].img.addEventListener("load",f1);
				res[i].img.addEventListener("error",f2);
				res[i].img.src = ImageLoader.wrapFileVersion(this.res[i].src);
			}
		}
		this._refreshUI();
		this._checkLoaded(); 
	}
	
	private loadDeferedImages()
	{
		this.deferedRes.forEach(item=>{
			item.img = new Image();
			item.img.src = ImageLoader.wrapFileVersion(item.src);
			
			if (typeof item.width == 'number') item.img.width = item.width;
			if (typeof item.height == 'number') item.img.height = item.height;
		});
	}
	
	static wrapFileVersion(src:string)
	{
		let src2 = src;
		if (window['FILE_VERSIONS'])
		{
			let fv = window['FILE_VERSIONS'];
			for(let i=0;i<fv.length;++i)
			{
				let name = fv[i][0];
				if (src2 == name)
				{
					src = src + "?q=" + fv[i][1];
					break;
				}
			}
		}
		return src;
	}
	
	getImage(id:string)
	{
		for(let i=0;i<this.res.length;++i)
		{
			if (this.res[i].id == id) return this.res[i].img;
		}
		for(let i=0;i<this.deferedRes.length;++i)
		{
			if (this.deferedRes[i].id == id) return this.deferedRes[i].img;
		}
		console.error("getImage error,id = " + id);
		return null;
	}
	
	close()
	{
		if (this.closed) return;
		var res = this.res;
		for(var i=0;i<this.res.length;++i)
		{
			res[i].img.removeEventListener("load",res[i].f1);
			res[i].img.removeEventListener("error",res[i].f2);
		}
	}
	
	private _imgComplete(item:ILoadItem)
	{
		item.loaded = true;
		//console.error(item.src + ", load ok");
		g_ImageCache[item.src] = item.img;
		this._checkLoaded();
	}
	
	private _imgError(item:ILoadItem)
	{
		item.loadError = true;
		console.error(item.src + ", load error");
		this._checkLoaded();
		/*
		if (this.spr.stage)
		{
			if (!window["bodyunload"])
			{
				alert(item.src + ",载入失败，要刷新页面才能解决问题")
			}
		}*/
	}
	
	private _checkLoaded()
	{
		if (this.closed) return;
		var loadedCount = 0;
		var hasError = false;
		for(var i=0;i<this.res.length;++i)
		{
			if (this.res[i].loaded) ++loadedCount;
			if (this.res[i].loadError) hasError = true;
		}
		if (loadedCount == this.res.length)
		{
			this.loadDeferedImages();
			setTimeout(()=> {
				if (this.onComplete) this.onComplete();
			}, 1);
			this.close();
		}
		else if (hasError)
		{
			if (this.onError) this.onError();
			this.close();
		}
		else
		{
			if (this.onProgress) this.onProgress(loadedCount,this.res.length);
		}
		this._refreshUI();
	}
	
	private _refreshUI()
	{
		if (!this.spr)
		{
			this.spr = new createjs.Container();
			this.spr.addChild(new createjs.Shape());
			this.spr.addChild(new createjs.Text());
		}
		{
			let shape = this.spr.getChildAt(0) as createjs.Shape;
			let g = shape.graphics;
			g.clear();
			g.beginFill('white');
			g.drawRect(0,0,GC.SCREEN_WIDTH,GC.SCREEN_HEIGHT);
			g.endFill();
		}
		{
			let textField = this.spr.getChildAt(1) as createjs.Text;
			let text = [];
			text.push("正在载入资源");
			for(let i=0;i<this.res.length;++i)
			{
				let item = this.res[i];
				text.push(`${item.loaded?"☑":"☐"} ${item.src}`);
			}
			textField.text = text.join("\n");
		}
		if (this.spr.stage)
		{
			GameStage.instance.makeDirty();
		}
	}
}
