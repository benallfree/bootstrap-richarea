var gulp = require('gulp');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var pump = require('pump');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');


gulp.task('js-compress', function (cb) {
  pump([
        gulp.src('src/index.js'),
        babel({
          presets: ['es2015']
        }),
        uglify(),
        rename('richarea.min.js'),
        gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('sass-compress', function (cb) {
  pump([
        gulp.src('dist/richarea.css'),
        cleanCSS({compatibility: 'ie8'}),
        rename('richarea.min.css'),
        gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('html-compress', function (cb) {
  pump([
        gulp.src('dist/richarea.html'),
        htmlmin({collapseWhitespace: true}),
        rename('richarea.min.html'),
        gulp.dest('dist')
    ],
    cb
  );
});



gulp.task('js', function(cb) {
  pump([
      gulp.src('src/index.js'),
      babel({
        presets: ['es2015']
      }),
      rename('richarea.js'),
      gulp.dest('dist/')
    ],
    cb
  );
});

gulp.task('sass', function () {
  return gulp.src('./src/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
});

gulp.task('html', function () {
  return gulp.src('./src/richarea.html')
    .pipe(gulp.dest('./dist'));
});
 
 
gulp.task('sass:watch', function () {
  gulp.watch('./*.scss', ['sass']);
});

gulp.task('default', ['html', 'js', 'sass', 'js-compress', 'sass-compress', 'html-compress']);