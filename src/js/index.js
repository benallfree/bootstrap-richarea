let _ = require('lodash');
import '../sass/richarea.scss'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-modal-fullscreen'


let scripts = document.getElementsByTagName("script"),
src = scripts[scripts.length-1].src;
let parser = document.createElement('a');
parser.href = src;
let assetRoot = parser.href.replace(/\/[^\/]+$/, "")

let RichArea = require('./RichArea');

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
