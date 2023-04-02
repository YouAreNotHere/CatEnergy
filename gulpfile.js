function defaultTask(cb) {
    // place code for your default task here
    cb();
  }

  exports.default = defaultTask

const {src, dest, parallel, series, watch} = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require("gulp-sass")(require('sass'));
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require('gulp-clean-css');
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
//const runsequence = require("run-sequence");
//const gwatch = require("gulp-watch");
//const imagemin = require("gulp-imagemin");
//import gulp-imagemin from "gulp-imagemin";

let preprocessor = 'sass';

function browsersync(){
browserSync.init({
    server:{ baseDir: "app/"}
    })
}

function scripts(){
    return src('app/js/*.js')
    .pipe(plumber())
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream())
}

function cleandist(){
    return delete("dist/**/*", { force: true })
}

function buildcopy(){
    return src([
        "app/css/**/*.min.css",
        "app/js/**/*.min.js",
        "app/img/dest/**/*",
        "app/**/*.html"])
        .pipe(dest("dist"))
}

//function images(){
    //return src("app/img/src/**/*")
    //.pipe(imagemin())
   // .pipe(dest("app/img/dest/"))

//}

function startwatch(){
    watch(["app/**/*.js","!app/**/*.min.js"], scripts);
    watch(["app/sass/blocks/*.scss","!app/sass/blocks/*.min.scss"], styles);
    watch("app/**/*.html").on("change", browserSync.reload);
}

function styles(){
    return src("app/sass/blocks/*.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('app.min.css'))
    .pipe(cleanCSS( { level: { 1: { specialComments: 0 } }, format: 'beautify' } ))
    .pipe(autoprefixer({overrideBrowserslist:["last 10 versions"], grid:true}))
    .pipe(dest("app/css/"))
    .pipe(browserSync.stream())
}

function svgsprite(){
  let config = {
      shape: {
          dimension: {
              maxWidth: 500,
              maxHeight: 500
          },
          spacing: {
              padding: 0
          },
          transform: [{
              "svgo": {
                  "plugins": [
                      { removeViewBox: false },
                              { removeUnusedNS: false },
                              { removeUselessStrokeAndFill: true },
                              { cleanupIDs: false },
                              { removeComments: true },
                              { removeEmptyAttrs: true },
                              { removeEmptyText: true },
                              { collapseGroups: true },
                              { removeAttrs: { attrs: '(fill|stroke|style)' } }
                  ]
              }
          }]
      },
      mode: {
          symbol: {
              dest : '.',
              sprite: 'app/sprite.svg'
          }
      }
  };

  return src("app/img/src/footer/*.svg")
      .pipe(svgSprite(config)).on('error', function(error){ console.log(error); })
      .pipe(dest("app/"))
}

function svgSpriteBuil(){
	return src('app/img/src/**/*.svg')
	// minify svg
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		// remove all fill, style and stroke declarations in out shapes
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {xmlMode: true}
		}))
		// cheerio plugin create unnecessary string '&gt;', so replace it.
		.pipe(replace('&gt;', '>'))
		// build svg sprite
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: "app/sprite.svg",
					render: {
						scss: {
							dest:'app/sass/_sprite.scss',
						}
					}
				}
			}
		}))
		.pipe(dest('app/'));
};

  exports.browsersync = browsersync;
  exports.scripts = scripts;
  exports.default = parallel(scripts,styles, browsersync, startwatch);
  exports.styles = styles;
  exports.build = series(cleandist, styles, scripts, buildcopy);
  exports.svgsprite = svgsprite;
  exports.svgspritebuil = svgSpriteBuil;
//exports.images = images;
