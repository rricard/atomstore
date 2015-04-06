"use strict";

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

gulp.task('default', ['es6']);

gulp.task('es6', function() {
  return gulp.src("src/index.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('atomstore.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});