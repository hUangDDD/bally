
/**
 * 简单的ImageLoader
 * 在init的时候尝试载入图片
 * 图片载入完成后会调用回掉函数，让你处理图片（缩放或切切切），结果保存在result.
 * 所以，可以查看result来判断图片是不是载入，如果没有载入，则就不显示了吧
 */
export class MiniImageLoader<T>
{
	src:string;
	image:HTMLImageElement;
	private proc:(image:HTMLImageElement)=>T;
	result:T;
	constructor(src,proc:(image:HTMLImageElement)=>T)
	{
		this.src = src;
		this.proc = proc;
	}
	
	init()
	{
		if (!this.image)
		{
			this.image = new Image();
			this.image.src = this.src;
			this.image.onload = ()=>{
				this.onLoadSuccess();
			}
			this.image.onerror = ()=>{
				console.log('图片载入失败:' + this.src);
				this.image = null;//简单的重试机制，下一次init的时候重新载入吧!
			}
		}
	}
	
	private onLoadSuccess()
	{
		this.result = this.proc(this.image);
	}
}