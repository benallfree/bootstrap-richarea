"use strict";

(function ($) {
  $(function () {
    $.prototype.richarea = function () {
      var $e = $(this);
      $e.hide();
      $e.after("<div class='richarea'>Hello Rich Area</div>");
    };
  });
})(jQuery);