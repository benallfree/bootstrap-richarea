let $ = require('jquery');
let Vue = require('vue');

class ComponentManager
{
  static init()
  {
    this.isInitializing = true;
    $(()=> {
      $.get('/components/snippets.html', (html)=> {
        var $tree = $('<div>');
        $tree.html(html);
        $tree.children('div').each((idx,e) => {
          var $e = $(e);
          var fields = {};
          var component_id = $e.data('id');
          $e.find('[data-editor]').each( (idx,e) => {
            var $e = $(e);
            var defaultValue = $(e).data('default-value');
            if(!defaultValue && $(e).data('editor')=='forms')
            {
              defaultValue = userForms[0].slug;
            }
            fields[$(e).data('field')] = {
              editor: $(e).data('editor'),
              defaultValue: defaultValue,
            };
          });
          this.components[component_id] = {
            id: $e.data('id'),
            thumb: $e.data('thumb'),
            fields: $.extend(true, {}, fields),
            categories: $e.data('cat'),
          };
          Vue.component('c'+component_id, {
            props: ['item', 'forms'],
            template: "<div class='component-container'>"+$(e).html()+"</div>",
            filters: {
              embedify: (url)=> {
                function getId(url) {
                  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  var match = url.match(regExp);

                  if (match && match[2].length == 11) {
                      return match[2];
                  } else {
                      return 'error';
                  }
                }
                var myId = getId(url);

                return '//www.youtube.com/embed/'+myId;
              },
              linebreak: function(v)
              {
                return v.replace("\n", "<br/>");
              }
            }
          });
        });
        this.isInitialized = true;
        this.callbacks.forEach(cb => cb());
      });
    });
  }
  
  static onInit(cb)
  {
    if(this.isInitialized) return cb();
    this.callbacks.push(cb);
  }
  
  static ensureDefaultValues(item)
  {
    if(!this.isInitialized)
    {
      throw new TypeError('ComponentManager.init() must finish first.');
    }
    if(item instanceof Array)
    {
      item.forEach((item)=>{
        this.ensureDefaultValues(item);
      });
      return item;
    }
    $.extend(true, item, {data: {}});
    let component = this.components[item.component_id];
    if(!component) return;
    let fields = component.fields;
    Object.keys(fields).forEach((key)=> {
      if(key in item.data) return;
      item.data[key] = fields[key].defaultValue;
    });
    return item;
  }
}

ComponentManager.callbacks = [];
ComponentManager.isInitialized = false;
ComponentManager.components = {};
ComponentManager.isInitializing = false;

module.exports = ComponentManager;