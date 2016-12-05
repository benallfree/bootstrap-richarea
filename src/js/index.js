require('./array.js');
require('./jquery.visibility.js');
let RichArea = require('./RichArea');

(($ => {
  $(() => {
    $.fn.richarea = function(options)
    {
      options = $.extend(true,{
        mode: 'edit',
      }, options);
      
      let $e = $(this);
      
      options = $.extend(true, {}, {
        container: $e,
      }, options)
      let ra = RichArea.create(options);
    }
  });
}))(jQuery);