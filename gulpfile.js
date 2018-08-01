'use strict';
var gulp     = require('gulp'),
babel        = require('gulp-babel'),
minify       = require('gulp-minify'),
sass         = require('gulp-sass'),
postcss      = require('gulp-postcss'),
autopfx      = require('autoprefixer'),
rename       = require('gulp-rename'),
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
gulp.task('ES6', function() {
    return gulp.src(paths.src.js)
        .pipe(babel({presets: ['env']}))
        .pipe(minify({ ext: {
            src:'-debug.js',
            min:'.min.js'
          }
        }))
        .pipe(gulp.dest(paths.dist.js));
});
gulp.task('scss', function () {
    return gulp.src(paths.src.scss)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)) //outpu: expanded
        .pipe(postcss([ autopfx() ]))
        .pipe(rename({suffix: ".min"}))
        .pipe(gulp.dest(paths.dist.css));
});

// ----------------------WATCH------------------------------
gulp.task('watch', function () {
    gulp.watch(paths.src.js, ['ES6']);
    gulp.watch(paths.src.scss, ['scss']);
});
gulp.task('devel', ['ES6','scss','watch']);
