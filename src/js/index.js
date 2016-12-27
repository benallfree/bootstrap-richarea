let _ = require('lodash');

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
    assetRoot + '/templates/layouts.html',
  ],
  editors: {},
});

module.exports = ($) => {
  $.fn.richarea = function(options)
  {
    
    let $e = $(this);

    options = _.merge({}, RichArea.options, options, {
      container: $e,
    });
    
    RichArea.create(options);
  }
};
