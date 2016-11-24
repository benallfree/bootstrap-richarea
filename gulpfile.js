var gulp = require('gulp');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var pump = require('pump');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var clean = require('gulp-clean');
var webpack = require('gulp-webpack');
var replace = require('gulp-replace');
var fs = require('fs');
 
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
  var template = fs.readFileSync('./src/templates/editor.html', 'utf8');
  pump([
      gulp.src('src/index.js'),
      webpack({
        module: {
          loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
          ]
        }        
      }),
      rename('richarea.js'),
      replace(/__TPL__EDITOR_TEMPLATE/g, JSON.stringify(template)),
      gulp.dest('dist/')
    ],
    cb
  );
});

gulp.task('sass', ['clean', 'assets'], function () {
  return gulp.src('./src/sass/richarea.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/assets/css'));
});

gulp.task('assets', ['clean'], function () {
  return gulp.src('./src/assets/**/*')
    .pipe(gulp.dest('./dist/assets'));
});
 
gulp.task('watch', function () {
  return gulp.watch('src/**/*', ['default']);
});

gulp.task('clean', function () {
    return gulp.src('./dist', {read: false})
        .pipe(clean());
});



gulp.task('default', ['clean', 'assets', 'js', 'sass', 'js-compress', 'sass-compress']);