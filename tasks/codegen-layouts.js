module.exports = function()
{
  var gulp = require('gulp');
  var pump = require('pump');
  let Q = require('q');
  let fs = require('fs');
  var file = require('gulp-file'); 
  var plumber = require('gulp-plumber');

  let d = Q.defer();
  var layouts_html = fs.readFileSync('./src/templates/layouts.html', 'utf8');
  var layouts = {};

  require("jsdom").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }

    var $ = require("jquery")(window);
    var $tree = $('<div>');
    $tree.html(layouts_html);
    $tree.children('div').each((idx,e) => {
      var $e = $(e);
      var fields = {};
      var layout_id = $e.data('id');
      $e.find('[data-editor]').each( (idx,e) => {
        var $e = $(e);
        var defaultValue = $(e).data('default-value');
        fields[$(e).data('field')] = {
          editor: $(e).data('editor'),
          defaultValue: defaultValue,
        };
      });
      ['data-editor', 'data-field', 'data-default-value',].forEach(function(attr) {
        $e.find('['+attr+']').removeAttr(attr);
      });
      var html = $e.html().trim();
    
      layouts[layout_id] = {
        id: $e.data('id'),
        thumb: $e.data('thumb'),
        fields: $.extend(true, {}, fields),
        categories: $e.data('cat'),
        template: html,
      };
    });
    
    pump([
        file('layouts.js', 'module.exports = ' + JSON.stringify(layouts, null, '\t') + ';', { src: true }),
        gulp.dest('build/')
      ],
      function() {
        console.log('resolve***');
        d.resolve();
      }
    );    
  });
  return d.promise;
};