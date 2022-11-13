// prettier-ignore
const gulp = require('gulp'),
      sass = require('gulp-sass')(require('sass')),
      autoPrefixer = require('gulp-autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),
      concat = require('gulp-concat'),
      connect = require('gulp-connect'),
      pug = require('gulp-pug'),
      imagemin = require('gulp-imagemin'),
      plumber = require('gulp-plumber'),
      zip = require('gulp-zip'),
      uglify = require('gulp-uglify');

const paths = {
  src: './src',
  build: './build',
  dist: './dist',
};

const sources = {
  html: [`${paths.src}/**/_*.+(pug|html)`, `${paths.src}/**/!(_)*.+(pug|html)`],
  fonts: [`${paths.src}/assets/fonts/*.*`, `${paths.src}/assets/webfonts/*.*`],
  img: [`${paths.src}/assets/img/**/!(_)*.+(png|jpg|jpeg|gif|svg|ico)`],
  css: [`${paths.src}/assets/styles/**/!(_)*.+(css|scss)`],
  js: [`${paths.src}/assets/js/**/!(_)*.js`],
  dist: [`${paths.build}/**/*.*`, './README.md'],
};

const tasks = {
  connect: 'connect',
  html: 'html',
  fonts: 'fonts',
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
  /**
   * this for watching only: _*.+(pug|html)
   * this for watching & compiling only: !(_)*.+(pug|html)
   * console.log(sources.html.filter(item => !item.includes('_*')));
   */

  return gulp
    .src(sources.html.filter(item => !item.includes('_*')))
    .pipe(plumber())
    .pipe(pug({ pretty: false }))
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());
});

// handel fonts
gulp.task(tasks.fonts, (done, dest = [`${paths.build}/assets/fonts`, `${paths.build}/assets/webfonts`]) => {
  for (let i = 0; i < dest.length; i++) {
    // prettier-ignore
    gulp
      .src(sources.fonts[i])
      .pipe(gulp.dest(dest[i]))
      .pipe(connect.reload());
  }

  done();
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
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest))
    .pipe(connect.reload());
});

// make compressed version to the client
gulp.task(tasks.dist, (_, dest = paths.dist) => {
  return gulp.src(sources.dist).pipe(zip('website.zip')).pipe(gulp.dest(dest));
});

// watch files
gulp.task(tasks.watch, done => {
  gulp.watch(sources.html, gulp.series(tasks.html, tasks.img));
  gulp.watch(sources.css, gulp.series(tasks.css));
  gulp.watch(sources.img, gulp.series(tasks.img));
  gulp.watch(sources.js, gulp.series(tasks.js));
  gulp.watch(sources.dist, gulp.series(tasks.dist));
  gulp.watch(sources.fonts, gulp.series(tasks.fonts));

  done();
});

// starting
gulp.task(tasks.start, gulp.series(tasks.html, tasks.fonts, tasks.img, tasks.css, tasks.css));
gulp.task(tasks.default, gulp.parallel('connect', 'watch', 'start'));
