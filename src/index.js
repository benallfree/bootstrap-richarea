require('./array.js');

(($ => {
  $(() => {
    jQuery.fn.visible = function() {
        return this.css('visibility', 'visible');
    };

    jQuery.fn.invisible = function() {
        return this.css('visibility', 'hidden');
    };

    jQuery.fn.visibilityToggle = function() {
        return this.css('visibility', function(i, visibility) {
            return (visibility == 'visible') ? 'hidden' : 'visible';
        });
    };
    
    $.fn.richarea = function(options)
    {
      let $e = $(this);
      $e.hide();
    
      let $root = $("<div class='richarea'>"+__TPL__EDITOR_TEMPLATE+"</div>");
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