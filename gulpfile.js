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
    .pipe(sass())
    .pipe(concat('app.min.css'))
    .pipe(cleanCSS( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } ))
    .pipe(autoprefixer({overrideBrowserslist:["last 10 versions"], grid:true}))
    .pipe(dest("app/css/"))
    .pipe(browserSync.stream())
}


  exports.browsersync = browsersync;
  exports.scripts = scripts;
  exports.default = parallel(scripts,styles, browsersync, startwatch);
  exports.styles = styles;
  exports.build = series(cleandist, styles, scripts, buildcopy);
//exports.images = images;