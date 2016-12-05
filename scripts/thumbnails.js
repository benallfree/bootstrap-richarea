'use strict'

let path = require('path');
let fs = require('fs');
let layoutPath = path.resolve(process.cwd(), process.argv[2]);
if(!fs.existsSync(layoutPath))
{
  throw new TypeError(`Path ${layoutPath} was not found. Please supply a template path.`);
}
console.log(`Template path: ${layoutPath}`);
let url = process.argv[3];

let jsdom = require('jsdom');
let LayoutParser = require('../src/js/LayoutParser');
let async = require('async');

jsdom.env("", function(err, window) {
  if (err) {
      console.error(err);
      return;
  }

  var $ = require("jquery")(window);

  let layouts = LayoutParser.parseFromString(fs.readFileSync(layoutPath, 'utf8'), $);


  let Thumbnailer = require('../src/codegen/Thumbnailer');

  let tasks = [];
  for(var id in layouts)
  {
    tasks.push(Thumbnailer.createAsync(url+'?l='+id, layouts[id]));
  }
  async.parallelLimit(tasks, 10);
});
