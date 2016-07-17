importScripts('box2d.js');
importScripts('require.js');
importScripts('game.js');
var self = this;
var gamework;
var msg = [];
require(['GameWorkerMain'],function(work){
	work.main(self);
})


