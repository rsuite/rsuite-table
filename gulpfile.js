const less = require('gulp-less');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const gulp = require('gulp');

const STYLE_SOURCE_DIR = './src/less';
const STYLE_DIST_DIR = './dist/css';

function buildLess() {
  return gulp
    .src(`${STYLE_SOURCE_DIR}/index.less`)
    .pipe(sourcemaps.init())
    .pipe(less({ javascriptEnabled: true }))
    .pipe(postcss([require('autoprefixer')]))
    .pipe(sourcemaps.write('./'))
    .pipe(rename('rsuite-table.css'))
    .pipe(gulp.dest(`${STYLE_DIST_DIR}`));
}

function buildCSS() {
  return gulp
    .src(`${STYLE_DIST_DIR}/rsuite-table.css`)
    .pipe(sourcemaps.init())
    .pipe(postcss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(`${STYLE_DIST_DIR}`));
}

exports.build = gulp.series(buildLess, buildCSS);
