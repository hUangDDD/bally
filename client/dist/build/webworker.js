var self = this;
var gamework;
var msg = [];
require(['GameWorkerMain'],function(work){
	work.main(self);
})
