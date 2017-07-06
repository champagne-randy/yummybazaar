// load modules/plugins
import gulp 			from 'gulp';
import gulpLoadPlugins 	from 'gulp-load-plugins';
const $ 				= gulpLoadPlugins();

// load file paths
import paths 			from '../paths';


// TODO: use $ to load plugins more elegantly
let browserify 		= require("browserify");
let source 			= require('vinyl-source-stream');
let tsify 			= require("tsify");
const tscConfig 	= require('../../tsconfig.json');
export default function buildScripts () {
	return  browserify({
				basedir: '.',
				debug: true,
				// TODO: use path module from core & paths.src.root to make src generic
				entries: ['src/main.ts'],
				exclude: tscConfig.exclude,
				sourceMaps: true,
				cache: {},
				packageCache: {}
			})
			.plugin(tsify)
			.bundle()
			.pipe(source('angular.app.js'))
			// TODO: use path module from core & paths.dist.root to make dest generic
			.pipe(gulp.dest('dist/assets'));
}







/*
// load TS options
// TODO: use es6 imports
const tscConfig 	= require('../../tsconfig.json');


// export task
export default function buildScripts () {
	return gulp
			.src(tscConfig.include)
			// TODO: use $ to import gulp-ignore more elegantly
			.pipe(require('gulp-ignore').exclude(tscConfig.exclude))
			.pipe($.sourcemaps.init())     
			.pipe($.typescript(tscConfig.compilerOptions))
			.pipe($.sourcemaps.write('.')) 
			.pipe(gulp.dest(paths.dist.root));
}
*/




