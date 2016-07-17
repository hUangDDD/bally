/// <reference path="server/typings/tsd.d.ts"/>
var fs = require('fs');
var stream = fs.createReadStream('a.txt', { autoClose: false });
stream = process.stdin;
stream.on('data', function (data)
{
	console.log('read data:', data, 'length:', data.length);
});
stream.on('end', function ()
{
	console.log('stream end');
})
stream.on('error', function (err)
{
	console.log('stream error:', err);
})