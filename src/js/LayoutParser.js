'use strict'

let Q = require('q');

class LayoutParser
{
  static parse(url)
  {
    let d = Q.defer();
    
    $.get(url, (layouts_html)=> {
      let layouts = this.parseFromString(layouts_html, $);
      d.resolve(layouts);
    });
    return d.promise;
  }
  
  static parseFromString(layouts_html, $)
  {
    let layouts = {};
    var $tree = $('<div>');
    $tree.html(layouts_html);
    $tree.children('div').each((idx,e) => {
      var $e = $(e);
      var fields = {};
      var layout_id = $e.data('id');
      if(!layout_id)
      {
        throw new TypeError(`Layout ID must not be null for ${$e.html()}`);
      }
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
      let cats = $e.data('cat');
      if(!cats)
      {
        throw new TypeError(`cats must not be null for ${$layout_id}`);
      }
      if(typeof(cats) == 'string')
      {
        cats = JSON.parse(cats.replace(/'/g, '"'));
      }
      let catsHash = {};
      cats.forEach(function(c) { catsHash[c]=true; });
      layouts[layout_id] = {
        id: $e.data('id'),
        fields: $.extend(true, {}, fields),
        categories: catsHash,
        template: html,
      };
    });
    return layouts;
  }
}

module.exports = LayoutParser;