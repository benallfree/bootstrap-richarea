let Q = require('q');
let _ = require('lodash');

class LayoutParser
{
  static parse(url)
  {
    let d = Q.defer();
    
    $.get(url, (layouts_html)=> {
      let layouts = this.parseFromString(layouts_html, url);
      d.resolve(layouts);
    });
    return d.promise;
  }
  
  static parseFromString(layouts_html, urlRoot = null)
  {
    if(urlRoot)
    {
      let parser = document.createElement('a');
      parser.href = urlRoot.replace(/\/[^\/]+$/, "");
      urlRoot = parser.href;
    }
    let imageRoot = urlRoot  + '/images';
    
    let layouts = {};
    var $tree = $('<div>');
    $tree.html(layouts_html);
    $tree.children('div').each((idx,e) => {
      var $e = $(e);
      var fields = {};
      var layoutId = $e.data('id');
      if(!layoutId)
      {
        throw new TypeError(`Layout ID must not be null for ${$e.html()}`);
      }
      $e.find('[data-editor]').each( (idx,e) => {
        var $e = $(e);
        var defaultValue = $e.data('default-value');
        fields[$e.data('field')] = {
          editor: $e.data('editor'),
          defaultValue: defaultValue,
        };
      });
      ['data-editor', 'data-field', 'data-default-value',].forEach(function(attr) {
        $e.find('['+attr+']').removeAttr(attr);
      });
      let html = $e.html().trim();
      let cats = $e.data('cat');
      let thumbnailUrl = $e.data('thumbnail');
      if(!cats)
      {
        throw new TypeError(`cats must not be null for ${$layoutId}`);
      }
      if(typeof(cats) == 'string')
      {
        cats = JSON.parse(cats.replace(/'/g, '"'));
      }
      let catsHash = {};
      cats.forEach(function(c) { catsHash[c]=true; });
      layouts[layoutId] = {
        id: layoutId,
        fields: _.merge({}, fields),
        categories: catsHash,
        template: html,
        assetRoot: urlRoot,
        thumbnailUrl: thumbnailUrl || `${imageRoot}/${layoutId}.png`,
      };
    });
    return layouts;
  }
}

module.exports = LayoutParser;