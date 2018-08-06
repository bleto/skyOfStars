'use strict';
var gulp     = require('gulp'),
babel        = require('gulp-babel'),
minify       = require('gulp-minify'),
sass         = require('gulp-sass'),
postcss      = require('gulp-postcss'),
autopfx      = require('autoprefixer'),
rename       = require('gulp-rename'),
browserSync  = require('browser-sync').create(),
paths = {
  src:{
    js:   'src/js/**/*.js',
    scss: 'src/scss/**/*.scss'
  },
  dist:{
    js:    'dist/js/',
    css:   'dist/css/',
  }
};
gulp.task('browser-sync',['ES6','scss'], function() {
    browserSync.init({
        server: "./",
        post: 3006
    });
});
gulp.task('ES6', function() {
    return gulp.src(paths.src.js)
        .pipe(babel({presets: ['env']}))
        .pipe(minify({ ext: {
            src:'-debug.js',
            min:'.min.js'
          }
        }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(browserSync.stream());
});
gulp.task('scss', function () {
    return gulp.src(paths.src.scss)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)) //outpu: expanded
        .pipe(postcss([ autopfx() ]))
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(browserSync.stream());
});

// ----------------------WATCH------------------------------
gulp.task('watch', function () {
    gulp.watch(paths.src.js, ['ES6']).on('change', browserSync.reload);
    gulp.watch(paths.src.scss, ['scss']).on('change', browserSync.reload);
});
gulp.task('devel', ['browser-sync','watch']);
