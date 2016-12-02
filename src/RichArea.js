let LayoutParser = require('./LayoutParser');
let VueComponentFactory = require('./VueComponentFactory');
let Q = require('q');

class RichArea
{
  static registerEditor(klass)
  {
    let name = klass.name;
    if(this.editors[name]) throw TypeError(`Editor ${name} is already registered with RichArea.`);
    this.editors[name] = klass;
    this.localVueComponents[name] = klass.getVueData();
  }
  
  static ensureLayouts(layoutUrls)
  {
    let d = Q.defer();
    let qs = [];
    layoutUrls.forEach((url)=> {
      if(this.layoutUrls[url]) return;
      qs.push(LayoutParser.parse(url).then((layouts) => {
        // Init layout fields
        for(let layout_id in layouts)
        {
          let layout = layouts[layout_id];
          for(let field_key in layout.fields)
          {
            let field = layout.fields[field_key];
            if(!this.editors[field.editor]) {
              throw new TypeError(`Editor ${field.editor} has not been registered.`);
            }
            this.editors[field.editor].initField(field, layout);
          }
        }
        this.layoutUrls[url] = layouts;
        Object.keys(layouts).forEach((cid)=> {
          this.localVueComponents['c'+cid] = VueComponentFactory.createFromLayout(layouts[cid]);
          $.extend(this.layoutCategorieslayouts, layouts[cid].categories);
        });        
        this.layouts = $.extend(true, {}, layouts, this.layouts);
      }));
    });
    Q.all(qs).then(function() { d.resolve(); }).fail(function(err) { d.reject(err); });
    return d.promise;
  }
  
  static create(options)
  {
    options = $.extend(true, {}, {
      container: null,
      root: null,
      assetRoot: '',
      imageUploadUrl: null,
      layouts: [],
      items: [],
      mode: 'edit',
    },options);
    
    if(!options.container)
    {
      throw new TypeError("RichArea must be attached to a DOM element container.");
    }
    if(options.layouts.length==0)
    {
      throw new TypeError("RichArea must have at least one layout file defined.");
    }
    
    let qs = [
      $.get(options.assetRoot + '/'+options.mode+'.html').then(function(html) {
        options.root = $("<div class='richarea'>"+html+"</div>");
        options.container.append(options.root);
      }),
      this.ensureLayouts(options.layouts).then(function() {
        if(Object.keys(options.layouts).length==0)
        {
          throw new TypeError("You must define at least one layout.");
        }
      }),
    ];
    Q.all(qs).then(()=> {
      this.initVue(options);
    }).done();
  }

  static ensureDefaultValues(item)
  {
    if(item instanceof Array)
    {
      item.forEach((item)=>{
        this.ensureDefaultValues(item);
      });
      return item;
    }
    $.extend(true, item, {data: {}});
    let layout = this.layouts[item.layout_id];
    if(!layout) throw new TypeError(`Undefined layout ${item.layout_id}`);
    let fields = layout.fields;
    Object.keys(fields).forEach((key)=> {
      if(key in item.data) return;
      item.data[key] = fields[key].defaultValue;
    });
    return item;
  } 
   
  static initVue(options)
  {
    let items = this.ensureDefaultValues($.extend(true, [], options.items));

    function $app()
    {
      return $(options.root).find('.richarea-app');
    }
    
    function $editor()
    {
      return $(options.root).find('.richarea-editor');
    }

    function $sortable()
    {
      return $editor().find('.sortable');
    }
    
    let appData = $.extend(true, options, {
      content: null,
      itemsJson: null,
      currentIdx: null,
      $currentLayout: null,
      items: items,
      selectedCategory: 'default',
      layoutCategories: this.layoutCategories,
      layouts: this.layouts,
    });
    
    let app = new Vue({
      components: this.localVueComponents,
      el: options.root.find('.richarea-app').get(0),
      data: appData,
      computed: {
        currentItem: function() {
          return this.items[this.currentIdx];
        },
        currentLayout: function() {
          var currentItem = this.items[this.currentIdx];
          if(!currentItem) return null;
          return this.layouts[currentItem.layout_id];
        },
        config: function() {
          return {
            assetRoot: this.assetRoot,
            imageUploadUrl: this.imageUploadUrl,
          }
        }
      },
      filters: {
        titlecase: (text)=> {
          let result = text.replace( /([A-Z])/g, " $1" );
          let finalResult = result.charAt(0).toUpperCase() + result.slice(1);
          return finalResult;
        },
        jsonify: (obj)=> {
          return JSON.stringify(obj);
        },                   
      },
      watch: {
        currentIdx: function(v)
        {
          this.$nextTick(function() {
            $sortable().find('.tools').hide();
            if(v==null) return;
            $sortable().find('li.active .tools').show();
          });
        },
        items: {
          handler: function(v, old)
          {
            this.calc();
          },
          deep: true,
        },
      },
      methods: {
        ensureDefaultValues: this.ensureDefaultValues,
        add: function(idx) {
          this.currentIdx = idx;
          let $modal = $editor().find('.layouts-modal');
          $modal.modal('show');
        },
        selectCat: function(cat) {
          this.selectedCategory = cat[0];
        },
        inActiveCategories: function(layout)
        {
          if(this.selectedCategory==-1) return true;
          return layout.categories[this.selectedCategory];
        },
        notifyChange: function() {
          if(!options.onChange) return;
          options.onChange({html: this.content, data: this.items});
        },
        close: function()
        {
          $editor().find('.modal.in').modal('hide');
          setTimeout(this.calc,0);
        },
        calc: function()
        {
          this.$nextTick(()=>{
            if($editor().find('.modal.layout-settings.in').length>0) return; // Suspend calculations while modal is one.
            this.calcContent();
            this.calcJson();
            this.notifyChange();
          });
        },
        calcJson: function()
        {
          this.itemsJson = JSON.stringify(this.items);
        },
        calcContent: function()
        {
          var htmls = [];
          $sortable().find('.item .layout-container').each(function(idx,e) {
            var $e = $(e).clone();
            $e.find('[data-render]').each(function(idx,e) {
              var $e = $(e);
              $e.replaceWith($e.data('render'));
            });
            ['data-editor', 'data-field', 'data-default-value',].forEach(function(attr) {
              $e.find('['+attr+']').removeAttr(attr);
            });
            var html = $e.html();
            htmls.push(html);
          });
          let $container = $('<div>').addClass('richarea');
          $container.html(htmls.join('\n'));
          this.content = $container.get(0).outerHTML;
        },
        select: function(event)
        {
          var $li = $(event.target).closest('li');
          this.currentIdx = $li.index();
          this.$currentLayout = $li;
        },
        insert: function(layout_id)
        {
          var o = this.ensureDefaultValues({layout_id: layout_id});
          var idx = $sortable().find('li.active').index();
          if(idx>=0)
          {
            this.items.splice(idx,0,o);
            this.currentIdx=idx;
          } else {
            this.items.push(o);
            this.currentIdx=this.items.length-1;
          }
        },
        edit: function(event)
        {
          let $modal = $editor().find('.layout-settings');
          $modal.modal('show');
        },
        
        duplicate: function(event)
        {
          this.items.splice(this.currentIdx,0,$.extend(true, {}, this.items[this.currentIdx]));
        },
        remove: function(event)
        {
          var ret = confirm('Are you sure you want to delete this item?');
          if(!ret) return;
          this.items.splice(this.currentIdx,1);
          this.currentIdx = null;
        },

      },
      mounted: function() {
        this.calc();
        $app().show();
        $sortable().sortable({
          placeholder: "alert alert-warning",
          items: 'li:not(.disabled)',
          handle: '.move',
          helper: 'clone',
          stop: (event,ui)=>
          {
            ui.placeholder.height(ui.item.height());
            ui.placeholder.width(ui.item[0].offsetWidth);
            var $e = $(ui.item);
            var oidx = $e.data('index');
            var nidx = $e.index();
            this.items.move(oidx,nidx);
            this.currentIdx=nidx;
            $sortable().sortable('cancel');
          },
          cursor: 'move'
        });
        if($.prototype.fullscreen)
        {
          $editor().find('.layouts-modal').fullscreen();
        }
        console.log('mount');
        // A little hack to wait for all images to finish loading before telling Webshot it's okay to take a screen shot.
        // http://phantomjs.org/api/webpage/handler/on-callback.html
        if (typeof window.callPhantom === 'function') {
          setTimeout(function() {
            window.callPhantom('takeShot');
          },10000);
        }
        
      }
    });      
  }
  
  static get(url) {

      if (URL.resolve(window.location, url).indexOf(FILE_PROTOCOL) === 0) {
          throw new Error("XHR does not function for file: protocol");
      }

      var request = new XMLHttpRequest();
      var response = Promise.defer();

      function onload() {
          if (xhrSuccess(request)) {
              response.resolve(request.responseText);
          } else {
              onerror();
          }
      }

      function onerror() {
          response.reject("Can't XHR " + JSON.stringify(url));
      }

      try {
          request.open(GET, url, true);
          if (request.overrideMimeType) {
              request.overrideMimeType(APPLICATION_JAVASCRIPT_MIMETYPE);
          }
          request.onreadystatechange = function () {
              if (request.readyState === 4) {
                  onload();
              }
          };
          request.onload = request.load = onload;
          request.onerror = request.error = onerror;
      } catch (exception) {
          response.reject(exception.message, exception);
      }

      request.send();
      return response.promise;
  };  
}
RichArea.editors = {};
RichArea.layoutUrls = {};
RichArea.layouts = {};
RichArea.layoutCategories = {};
RichArea.localVueComponents = {};

RichArea.registerEditor(require('./editors/TextEditor.js'));
RichArea.registerEditor(require('./editors/TextareaEditor.js'));
RichArea.registerEditor(require('./editors/LinkEditor.js'));

module.exports = RichArea;