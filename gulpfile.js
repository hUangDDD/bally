var gulp = require('gulp');
var ts = require('gulp-typescript');


var clientProject = ts.createProject('client/tsconfig.json');
var serverProject = ts.createProject('server/tsconfig.json', { sortOutput: true });
gulp.task('client', function ()
{
	var tsResult = clientProject.src()
		.pipe(ts(clientProject));
	return tsResult.js.pipe(gulp.dest('client'));
});

gulp.task('server', function ()
{
	var tsResult = serverProject.src()
		.pipe(ts(serverProject));
	return tsResult.js.pipe(gulp.dest('server/dist'));
})

gulp.task('watch', ['client'], function ()
{
	gulp.watch([
		'shared/**/*.ts',
		'client/src/**/*.ts',
		'client/tsconfig.json',
		'client/typings/**/*.ts'], ['client']);

	//gulp.watch(['server/**/*.ts',
	//	'server/tsconfig.json',
	//	'server/typings/**/*.ts'], ['server']);

})