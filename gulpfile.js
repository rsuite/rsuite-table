/* eslint-disable @typescript-eslint/no-var-requires */
const del = require('del');
const babel = require('gulp-babel');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const gulp = require('gulp');
const babelrc = require('./babel.config.js');
const STYLE_SOURCE_DIR = './src/less';
const STYLE_DIST_DIR = './dist/css';
const TS_SOURCE_DIR = ['./src/**/*.tsx', './src/**/*.ts', '!./src/**/*.d.ts'];
const ESM_DIR = './es';
const LIB_DIR = './lib';
const DIST_DIR = './dist';

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

function buildLib() {
  return gulp
    .src(TS_SOURCE_DIR)
    .pipe(babel(babelrc()))
    .pipe(gulp.dest(LIB_DIR));
}

function buildEsm() {
  return gulp
    .src(TS_SOURCE_DIR)
    .pipe(
      babel(
        babelrc(null, {
          NODE_ENV: 'esm'
        })
      )
    )
    .pipe(gulp.dest(ESM_DIR));
}

function copyTypescriptDeclarationFiles() {
  return gulp
    .src('./src/**/*.d.ts')
    .pipe(gulp.dest(LIB_DIR))
    .pipe(gulp.dest(ESM_DIR));
}

function copyLessFiles() {
  return gulp
    .src(['./src/**/*.less', './src/**/fonts/**/*'])
    .pipe(gulp.dest(LIB_DIR))
    .pipe(gulp.dest(ESM_DIR));
}

function copyFontFiles() {
  return gulp.src(`${STYLE_SOURCE_DIR}/fonts/**/*`).pipe(gulp.dest(`${STYLE_DIST_DIR}/fonts`));
}

function clean(done) {
  del.sync([LIB_DIR, ESM_DIR, DIST_DIR], { force: true });
  done();
}

exports.build = gulp.series(
  clean,
  gulp.parallel(buildLib, buildEsm, gulp.series(buildLess, buildCSS)),
  gulp.parallel(copyTypescriptDeclarationFiles, copyLessFiles, copyFontFiles)
);
