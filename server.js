var express = require('express');
var app = express();
app.use((req,resp,next)=>{
	console.log(`${req.method} ${req.path}`);
	next();
})

var mainhtml = 'game.html';
app.use('/test',express.static(__dirname+'/client/dist',{index:mainhtml}))
app.use('/test/1',express.static(__dirname+'/client/dist',{index:mainhtml}))
app.use('/test/2',express.static(__dirname+'/client/dist',{index:mainhtml}))
app.use('/test/3',express.static(__dirname+'/client/dist',{index:mainhtml}))
app.use('/test/4',express.static(__dirname+'/client/dist',{index:mainhtml}))
app.use(express.static(__dirname+'/client/dist',{index:mainhtml}));
app.listen(29999);