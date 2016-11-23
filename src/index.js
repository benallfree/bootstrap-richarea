RichAreaVueFactory = require('./RichAreaVueFactory');
(($ => {
  $(() => {
    $.prototype.richarea = function()
    {
      let $e = $(this);
      $e.hide();
      
      $e.after("<div class='richarea richarea-editor'>Hello Rich Area</div>");
    }
  });
}))(jQuery);