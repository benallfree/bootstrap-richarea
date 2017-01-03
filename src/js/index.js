let _ = require('lodash');
require('../sass/richarea.scss')


let scripts = document.getElementsByTagName("script"),
src = scripts[scripts.length-1].src;
let parser = document.createElement('a');
parser.href = src;
let assetRoot = parser.href.replace(/\/[^\/]+$/, "")

let RichArea = require('./RichArea');

if(window && !window.RichArea) window.RichArea = RichArea;

_.merge(RichArea.options, {
  mode: 'edit',
  assetRoot: assetRoot,
  layoutUrls: [
    assetRoot + '/layouts/layouts.html',
  ],
  editors: {},
});

module.exports = RichArea;
// ($) => {
//   $.fn.richarea = function(options)
//   {
//
//     let $e = $(this);
//
//     options = _.merge({}, RichArea.options, options, {
//       container: $e,
//     });
//
//     RichArea.create(options);
//   }
// };
