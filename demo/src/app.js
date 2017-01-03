window.$ = window.jQuery = require('jquery');
require('bootstrap');
require('bootstrap/dist/css/bootstrap.css');
require('bootstrap-modal-fullscreen');

$(function() {
  function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]) == variable) {
              return decodeURIComponent(pair[1]);
          }
      }
  }
  RichArea.create({
    container: document.getElementById('richarea'),
    layoutUrls: [
      '/richarea/layouts.html'
    ],
    items: [
      {layout_id: getQueryVariable('l') || 'richarea-34'}
    ],
    onChange: function(o)
    {
      $('#html').val(o.html);
      $('#data').val(JSON.stringify(o.data));
    }
  });
});
