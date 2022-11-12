// prettier-ignore
const gulp = require('gulp'),
      sass = require('gulp-sass')(require('sass')),
      autoPrefixer = require('gulp-autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),
      concat = require('gulp-concat'),
      connect = require('gulp-connect'),
      pug = require('gulp-pug'),
      imagemin = require('gulp-imagemin'),
      terser = require('gulp-terser'),
      plumber = require('gulp-plumber'),
      zip = require('gulp-zip'),
      fs = require('fs');

const paths = {
  src: './src',
  build: './build',
  dist: './dist',
};

const sources = {
  html: [`${paths.src}/**/!(_)*.pug`, `${paths.src}/**/!(_)*.html`],
  img: [`${paths.src}/assets/img/**/!(_)*.+(png|jpg|jpeg|gif|svg|ico)`],
  css: [`${paths.src}/assets/styles/**/!(_)*.+(css|scss)`],
  js: [`${paths.src}/assets/js/**/!(_)*.js`],
  dist: [`${paths.build}/**/*.*`, './README.md'],
};

const tasks = {
  connect: 'connect',
  html: 'html',
  img: 'img',
  css: 'css',
  js: 'js',
  dist: 'dist',
  start: 'start',
  watch: 'watch',
  default: 'default',
};

// connect to server
gulp.task(tasks.connect, (done, root = paths.build) => {
  connect.server({
    root,
    livereload: true,
    port: 8000,
  });

  done();
});

// handel html
gulp.task(tasks.html, (_, dest = paths.build) => {
  return gulp
    .src(sources.html)
    .pipe(plumber())
    .pipe(pug({ pretty: false }))
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());
});

// handel images
gulp.task(tasks.img, (_, dest = `${paths.build}/assets/img`) => {
  return gulp.src(sources.img).pipe(plumber()).pipe(imagemin()).pipe(gulp.dest(dest)).pipe(connect.reload());
});

// handel css
gulp.task(tasks.css, (_, dest = `${paths.build}/assets/css`) => {
  return gulp
    .src(sources.css)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('all.min.css'))
    .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoPrefixer({ cascade: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());
});

// handel js
gulp.task(tasks.js, (_, dest = `${paths.build}/assets/js`) => {
  return gulp
    .src(sources.js)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('all.min.js'))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());
});

// make compressed version to the client
gulp.task(tasks.dist, (_, dest = paths.dist) => {
  // copy all in build to dist zipped
  return gulp.src(sources.dist).pipe(zip('website.zip')).pipe(gulp.dest(dest));
});

// watch files
gulp.task(tasks.watch, done => {
  gulp.watch(sources.html, gulp.series(tasks.html, tasks.img));
  gulp.watch(sources.css, gulp.series(tasks.css));
  gulp.watch(sources.img, gulp.series(tasks.img));
  gulp.watch(sources.js, gulp.series(tasks.js));
  gulp.watch(sources.dist, gulp.series(tasks.dist));

  done();
});

// starting
gulp.task(tasks.start, gulp.series(tasks.html, tasks.img, tasks.css, tasks.css));
gulp.task(tasks.default, gulp.parallel('connect', 'watch', 'start'));
