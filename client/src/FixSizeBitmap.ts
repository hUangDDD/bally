/// <refrernce path="../typings/tsd.d.ts"/>


export function MakeSuitableSize(bitmap: createjs.Bitmap, width: number, height: number, defaultImage?: HTMLImageElement)
{
	var getImage = () => bitmap.image;
	var _scaleX = 1;
	var _scaleY = 1;
	function getScale()
	{
		let image = getImage();
		if (image && image.width > 0 && image.height > 0)
		{
			let sx = width / image.width;
			let sy = height / image.height;
			return Math.min(sx, sy);
		}
		return 0;
	}

	function setScaleX(val) { _scaleX = val; }
	function setScaleY(val) { _scaleY = val; }
	function getScaleX() { return getScale() * _scaleX; }
	function getScaleY() { return getScale() * _scaleY; }

	if (defaultImage)
	{
		var _image = bitmap.image;
		getImage = () =>
		{
			if (_image && _image.width > 0) return _image;
			return defaultImage;
		}
		Object.defineProperty(bitmap, 'image', {
			get: getImage, set: val => { _image = val; }
		});
	}

	Object.defineProperty(bitmap, 'scaleX', { get: getScaleX, set: setScaleX });
	Object.defineProperty(bitmap, 'scaleY', { get: getScaleY, set: setScaleY });
	Object.defineProperty(bitmap, 'regX', {
		get: () =>
		{
			let image = getImage();
			if (image && image.width > 0) return image.width / 2;
			return 0;
		}
	});
	Object.defineProperty(bitmap, 'regY', {
		get: () =>
		{
			let image = getImage();
			if (image && image.width > 0) return image.height / 2;
			return 0;
		}
	})
}