"use strict";

RichAreaVueFactory = require('./RichAreaVueFactory');
(function ($) {
  $(function () {
    $.prototype.richarea = function () {
      var $e = $(this);
      $e.hide();

      $e.after("<div class='richarea richarea-editor'>Hello Rich Area</div>");
    };
  });
})(jQuery);