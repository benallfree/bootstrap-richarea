require('./array.js');
require('./jquery.visibility.js');
let _ = require('lodash');

window.RichArea = require('./RichArea');
window.RichAreaBaseEditor = require('./editors/BaseEditor');

let scripts = document.getElementsByTagName("script"),
src = scripts[scripts.length-1].src;
let parser = document.createElement('a');
parser.href = src;
let assetRoot = parser.href.replace(/\/[^\/]+$/, "")

_.merge(RichArea.options, {
  mode: 'edit',
  assetRoot: assetRoot,
  layoutUrls: [
    assetRoot + '/templates/layouts.html',
  ],
  editors: {},
});

(($ => {
  $(() => {
    $.fn.richarea = function(options)
    {
      let $e = $(this);

      options = _.merge({}, RichArea.options, options, {
        container: $e,
      });
      
      let ra = RichArea.create(options);
    }
  });
}))(jQuery);
