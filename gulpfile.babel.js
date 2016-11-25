var gulp = require('gulp');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var clean = require('gulp-clean');
var webpack = require('gulp-webpack');
var fs = require('fs');
var file = require('gulp-file'); 
var _ = require('lodash');
let Q = require('q');
var plumber = require('gulp-plumber');
var async = require('async');

gulp.plumbedSrc = function( ){
  return gulp.src.apply( gulp, arguments )
    .pipe( plumber() );
}

function qpump(steps)
{
  let pump = require('pump');
  let d = Q.defer();
  pump(steps, function() { console.log('resolving'); d.resolve(); });
  return d.promise;
}

function merge(jobs,cb)
{
  let qs = [];
  if(jobs==undefined) throw new TypeError(jobs);
  jobs.forEach(function(steps_or_deferred_func) {
    if(_.isArray(steps_or_deferred_func))
    {
      qs.push(qpump(steps_or_deferred_func));
    } else {
      qs.push(steps_or_deferred_func());
    }
  });
  console.log("Initial state", qs);
  Q.all(qs).then(function(values) { console.log("setled state", values); cb(); });
}

function task(name, deps, jobs)
{
  gulp.task(name, deps, function(cb) {
    merge(jobs, cb);
  });
}

function packer()
{
  return webpack({
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
      }        
    });
}

task('js-compress', ['js', 'clean',], [
  [
    gulp.src('dist/**/*.js'),
    babel({
      presets: ['es2015']
    }),
    uglify(),
    rename({
      extname: ".min.js"
    }),
    gulp.dest('dist')
  ]
]);


task('sass-compress', ['sass', 'clean'], [
  [
    gulp.src('dist/**/*.css'),
    cleanCSS({compatibility: 'ie8'}),
    rename({
      extname: ".min.css"
    }),
    gulp.dest('dist')
  ],
]);


task('js', ['clean', 'codegen'], [
  [
    gulp.src('src/index.js'),
    packer(),
    rename('richarea.js'),
    gulp.dest('dist/'),
  ],
  [
    gulp.src('src/layouts.js'),
    packer(),
    rename('richarea-layouts.js'),
    gulp.dest('dist/')
  ],  
]);

task('sass', ['clean'], [
  [
    gulp.src('./src/sass/richarea.scss'),
    sass().on('error', sass.logError),
    gulp.dest('./dist'),
  ],
]);

task('images', ['clean'], [
  [
    gulp.src('./src/images/**/*'),
    gulp.dest('./dist/images'),
  ]
]);
 
gulp.task('watch', function () {
  return gulp.watch('src/**/*', ['default']);
});

task('clean', [], [
  [
    gulp.src('./dist', {read: false}),
    clean()
  ],
  [
    gulp.src('./build', {read: false}),
    clean()
  ],
]);

task('codegen', ['clean'], [
  [
    file('editor.js', 'module.exports = ' + JSON.stringify(fs.readFileSync('./src/templates/editor.html', 'utf8')) + ';', {src: true}),
    gulp.dest('build/')
  ],
  [
    file('viewer.js', 'module.exports = ' + JSON.stringify(fs.readFileSync('./src/templates/viewer.html', 'utf8')) + ';', {src: true}),
    gulp.dest('build/')
  ],
  require('./tasks/codegen-layouts'),
]);


gulp.task('thumbnails', ['clean', 'codegen', 'js', 'sass'], function (cb) {
  let RichAreaConfig
  var layouts = require('./build/layouts');
  let Thumbnailer = require('./src/codegen/Thumbnailer');

  let tasks = [];
  for(var id in layouts)
  {
    tasks.push(Thumbnailer.createAsync(layouts[id]));
  }
  async.parallelLimit(tasks, 10, function() {
    cb();
  });
});


gulp.task('default', ['clean', 'images', 'js', 'sass', 'codegen', 'js-compress', 'sass-compress']);