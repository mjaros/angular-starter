var path = require('path');
var del = require('del');
var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var revall = require('gulp-rev-all');
var connect = require('gulp-connect');
var mainBowerFiles = require('main-bower-files');
var gulpFilter = require('gulp-filter');
var watch = require('gulp-watch');

var paths = {
  app: './app',
  stylesheets: './app/stylesheets',
  javascripts: './app/javascripts',
  images: './app/images',
  templates: './app/templates',
  build: './www',
  assets: './www/assets'
};

var filters = {
  js: gulpFilter('*.js'),
  css: gulpFilter('*.css'),
  images: gulpFilter(['*.png', '*.jpg', '*.jpeg']),
  fonts: gulpFilter(['*.eot', '*.svg', '*.ttf', '*.woff'])
};

gulp.task('default', ['clean'], function() {
  gulp.start('watch', 'styles', 'js', 'images', 'fonts', 'vendor', 'templates');
});

gulp.task('build', ['clean'], function() {
  gulp.start('styles', 'js', 'images', 'fonts', 'vendor', 'rev', 'templates');
});

gulp.task('styles', function() {
  return gulp.src(paths.stylesheets + '/application.scss')
    .pipe(sass())
    .pipe(minifyCss({keepSpecialComments: 0}))
    .pipe(gulp.dest(paths.assets + '/stylesheets'));
});

gulp.task('js', function() {
  return gulp.src([paths.javascripts + '/application.js', paths.javascripts + '/**/*.js'])
    .pipe(concat('application.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.assets + '/javascripts'));
});

gulp.task('images', function() {
  return gulp.src(paths.images + '/**/*')
    .pipe(gulp.dest(paths.assets + '/images'));
});

gulp.task('fonts', function() {
  return gulp.src(paths.fonts + '/**/*')
    .pipe(gulp.dest(paths.assets + '/fonts'));
});

gulp.task('vendor', function() {
  return gulp.src(mainBowerFiles())
    .pipe(filters.js)
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.assets + '/javascripts'))
    .pipe(filters.js.restore())

    .pipe(filters.css)
    .pipe(concat('vendor.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest(paths.assets + '/stylesheets'))
    .pipe(filters.css.restore())

    .pipe(filters.fonts)
    .pipe(gulp.dest(paths.assets + '/fonts'))
    .pipe(filters.fonts.restore())

    .pipe(filters.images)
    .pipe(gulp.dest(paths.assets + '/images'));
});

gulp.task('templates', function() {
  return gulp.src([paths.app + '/index.html', paths.templates + '/**/*.html'], {base: paths.app})
    .pipe(gulp.dest(paths.build));
});

gulp.task('rev', ['images', 'styles', 'js', 'vendor', 'templates'], function() {
  return gulp.src(paths.build + '/**/*.*')
    .pipe(revall({
      ignore: ['rev-manifest.json'],
      transformFilename: function (file, hash) {
        var ext = path.extname(file.path);
        if (ext === '.html') {
          return path.basename(file.path, ext) + ext;
        } else {
          return path.basename(file.path, ext) + '-' + hash + ext;
        }
      }
    }))
    .pipe(gulp.dest(paths.build))
    .pipe(revall.manifest())
    .pipe(gulp.dest(paths.assets));
});

gulp.task('clean', function(done) {
  del(paths.build + '/**/*', done);
});

gulp.task('server', function() {
  connect.server({
    root: paths.build,
    livereload: true
  });
});

gulp.task('watch', ['server'], function() {
  watch(paths.build + '/**', {verbose: false}).pipe(connect.reload());
  gulp.watch(paths.stylesheets + '/**/*.scss', ['styles']);
  gulp.watch(paths.javascripts + '/**/*.js', ['js']);
  gulp.watch(paths.images + '/**/*.*', ['images']);
  gulp.watch([paths.templates + '/**/*.html', paths.app + '/index.html'], ['templates']);
});
