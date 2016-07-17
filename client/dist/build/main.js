(function()
{
	var img1 = new Image();
	img1.src = 'images/loading/未标题-2.png';

	var img2 = new Image();
	img2.src = 'images/loading/1.png';
})();

window.onerror = function (e)
{
	alert(e);
}
require(['main'], function ()
{
	ballybally_main();
})
$(document).on('touchmove', function (e)
{
	e.preventDefault();
});
