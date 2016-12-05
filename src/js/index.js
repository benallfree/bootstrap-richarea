require('./array.js');
require('./jquery.visibility.js');
window.RichArea = require('./RichArea');
window.RichAreaBaseEditor = require('./editors/BaseEditor');

let scripts = document.getElementsByTagName("script"),
src = scripts[scripts.length-1].src;
let parser = document.createElement('a');
parser.href = src;
let assetRoot = parser.pathname.replace(/\/richarea.js/, "");
RichArea.options = $.extend({
  mode: 'edit',
  assetRoot: assetRoot,
  layouts: [
    assetRoot + '/templates/layouts.html',
  ],
  editors: {},
});

(($ => {
  $(() => {
    $.fn.richarea = function(options)
    {
      let $e = $(this);

      options = $.extend({}, RichArea.options, options, {
        container: $e,
      });
      
      let ra = RichArea.create(options);
    }
  });
}))(jQuery);
