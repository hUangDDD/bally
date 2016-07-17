window.onerror = function (e)
{
	alert(e);
}


alert(navigator.userAgent);
//location.href = "http://output.jsbin.com/huligowapi/2";

function main()
{
	var point = { x: 0, y: 0 }
	var lastPoint;
	var canvas = document.getElementsByTagName('canvas')[0];
	var ctx = canvas.getContext('2d');
	function paint()
	{
		//ctx.clearRect(0,0,canvas.width,canvas.height);
		if (lastPoint)
		{
			ctx.fillStyle = 'white';
			ctx.beginPath();
			ctx.arc(lastPoint.x, lastPoint.y, 21, 0, Math.PI * 2);
			ctx.closePath();
			ctx.fill();
		}
		ctx.fillStyle = 'white';
		//ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'black';
		ctx.beginPath();
		ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
		lastPoint = { x: point.x, y: point.y };
	}

	paint();

	canvas.addEventListener('mousemove', function (e)
	{
		point.x = e.clientX;
		point.y = e.clientY;
		paint();
	})

	canvas.addEventListener('touchmove', function (e)
	{
		e.preventDefault();
		var touch = e.touches[0];
		point.x = touch.clientX;
		point.y = touch.clientY;
		paint();
	})
}
