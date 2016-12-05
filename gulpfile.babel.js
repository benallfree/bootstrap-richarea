var gulp = require('gulp');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var del = require('del');
var webpack = require('gulp-webpack');
var fs = require('fs');
var file = require('gulp-file'); 
var _ = require('lodash');
let Q = require('q');
var plumber = require('gulp-plumber');
var async = require('async');
let pump = require('pump');
var mkdirp = require('mkdirp');
var download = require("gulp-download");

gulp.plumbedSrc = function( ){
  return gulp.src.apply( gulp, arguments )
    .pipe( plumber() );
}

function qpump(steps)
{
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

task('js-compress', ['js'], [
  [
    gulp.src(['./dist/richarea.js',]),
    babel({
      presets: ['es2015']
    }),
    uglify(),
    rename({
      extname: ".min.js"
    }),
    gulp.dest('./dist')
  ]
]);


task('sass-compress', ['sass'], [
  [
    gulp.src('./dist/richarea.css'),
    cleanCSS({compatibility: 'ie8'}),
    rename({
      extname: ".min.css"
    }),
    gulp.dest('./dist')
  ],
]);

gulp.task('js', function() {
  return gulp.src('./src/index.js')
    .pipe(packer())
    .pipe(rename('richarea.js'))
    .pipe(gulp.dest('./dist'))
  ;
});


gulp.task('sass', function() {
  return gulp.src('./src/sass/richarea.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'))
  ;
});


gulp.task('clean', function() {
  return del(['./dist/**/*', './build/**/*']);
});

// task('codegen', [], [
//   [
//     file('editor.js', 'module.exports = ' + JSON.stringify(fs.readFileSync('./src/templates/editor.html', 'utf8')) + ';', { src: true }),
//     gulp.dest('./build')
//   ],
//   [
//     file('viewer.js', 'module.exports = ' + JSON.stringify(fs.readFileSync('./src/templates/viewer.html', 'utf8')) + ';', { src: true }),
//     gulp.dest('./build')
//   ],
// ]);



task('static', [], [
  [
    gulp.src('./src/images/**/*'),
    gulp.dest('./dist/images'),
  ],
  [
    gulp.src('./src/templates/**/*'),
    gulp.dest('./dist'),
  ],
  
]);
 
gulp.task('watch', function () {
  return gulp.watch('src/**/*', ['default']);
});


gulp.task('thumbnails', ['js', 'sass'], function (cb) {
  let LayoutParser = require('./src/LayoutParser');
  let layouts = LayoutParser.parseFromFile('./src/templates/layouts.html');
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

gulp.task('lorem', function(cb) {
  let s = fs.readFileSync('./src/templates/layouts.html', 'utf8');
  let sizes = {};

  var regex = /(\d+x\d+\.png)/g;
  let matches = null;
  while (matches = regex.exec(s)) {
    sizes[matches[1]] = true;
  }
  let jobs = [];
  Object.keys(sizes).forEach(function(k) {
    let parts = k.split(/[\.x]/);
    let url = 'http://lorempixel.com/'+parts[0]+'/'+parts[1];
    let fname = parts[0]+'x'+parts[1]+'.png';
    console.log(url,fname);
    jobs.push([
      download(url),
      rename(fname),
      gulp.dest("./src/images"),
    ]);
  });
  merge(jobs,cb);
});


gulp.task('default', ['static', 'js', 'sass', 'js-compress', 'sass-compress']);