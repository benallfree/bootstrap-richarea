require('./array.js');
require('./jquery.visibility.js');


window.RichAreaConfig = require('./RichAreaConfig.js');


(($ => {
  $(() => {
    $.fn.richarea = function(options)
    {
      options = $.extend(true,{
        mode: 'edit',
      }, options);
      
      let $e = $(this);
      
      $e.hide();
  
      let $root = null;
      if(options.mode=='view')
      {
        $root = $("<div class='richarea'>"+require('../build/viewer')+"</div>");
      } else {
        $root = $("<div class='richarea'>"+require('../build/editor')+"</div>");
      }
      $e.after($root);
  
      let RichAreaVueFactory = require('./RichAreaVueFactory');
      options = $.extend(true, {}, {
        root: $root,
        items: [],
      }, options)
      RichAreaVueFactory.create(options);

    }
  });
}))(jQuery);