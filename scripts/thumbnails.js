'use strict'

let jsdom = require('jsdom');
let LayoutParser = require('../src/js/LayoutParser');
let fs = require('fs');
let async = require('async');

jsdom.env("", function(err, window) {
  if (err) {
      console.error(err);
      return;
  }

  var $ = require("jquery")(window);

  let layouts = LayoutParser.parseFromString(fs.readFileSync(__dirname + '/../src/assets/templates/layouts.html', 'utf8'), $);


  let Thumbnailer = require('../src/codegen/Thumbnailer');

  let tasks = [];
  for(var id in layouts)
  {
    tasks.push(Thumbnailer.createAsync(layouts[id]));
  }
  async.parallelLimit(tasks, 10);
});
