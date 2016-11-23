var gulp = require('gulp');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var pump = require('pump');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var clean = require('gulp-clean');

gulp.task('js-compress', ['assets', 'js', 'clean'], function (cb) {
  pump([
        gulp.src('dist/**/*.js'),
        babel({
          presets: ['es2015']
        }),
        uglify(),
        rename({
          extname: ".min.js"
        }),
        gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('sass-compress', ['assets', 'sass', 'clean'], function (cb) {
  pump([
        gulp.src('dist/**/*.css'),
        cleanCSS({compatibility: 'ie8'}),
        rename({
          extname: ".min.css"
        }),
        gulp.dest('dist')
    ],
    cb
  );
});


gulp.task('js', ['clean'], function(cb) {
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

gulp.task('sass', ['clean'], function () {
  return gulp.src('./src/sass/richarea.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/assets/css'));
});

gulp.task('assets', ['clean'], function () {
  return gulp.src('./assets/**/*')
    .pipe(gulp.dest('./dist/assets'));
});
 
 
gulp.task('sass:watch', function () {
  gulp.watch('./*.scss', ['sass']);
});

gulp.task('clean', function () {
    return gulp.src('./dist', {read: false})
        .pipe(clean());
});

gulp.task('default', ['clean', 'assets', 'js', 'sass', 'js-compress', 'sass-compress']);