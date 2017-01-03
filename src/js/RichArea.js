let LayoutParser = require('./LayoutParser');
let VueComponentFactory = require('./VueComponentFactory');
let changeCase = changeCase = require('change-case');
let md5 = require('md5');
let Q = require('q');
let Vue = require('vue');
let draggable = require('vuedraggable');
let _ = require('lodash');
Vue.component('draggable', draggable);

class RichArea
{
  static registerEditor(klass, options = {})
  {
    let name = klass.slug;
    console.log("Registering ", name);
    if(this.editors[name]) throw TypeError(`Editor ${name} is already registered with RichArea.`);
    this.editors[name] = klass;
    this.localVueComponents[name] = klass.getVueData();
    this.options.editors[name] = options;
  }
  
  static ensureLayoutsLoaded(options)
  {
    let layoutUrls = options.layoutUrls;
    let d = Q.defer();
    let qs = [];
    layoutUrls.forEach((url)=> {
      if(this.layoutUrls[url]) return;
      qs.push(LayoutParser.parse(url).then((layouts) => {
        // Init layout fields
        for(let layoutId in layouts)
        {
          let layout = layouts[layoutId];
          for(let field_key in layout.fields)
          {
            let field = layout.fields[field_key];
            if(!this.editors[field.editor]) {
              throw new TypeError(`Editor ${field.editor} has not been registered.`);
            }
            this.editors[field.editor].initField(field, layout, options);
          }
        }
        this.layoutUrls[url] = layouts;
        Object.keys(layouts).forEach((cid)=> {
          this.localVueComponents['c'+cid] = VueComponentFactory.createFromLayout(layouts[cid]);
          _.merge(this.layoutCategories, layouts[cid].categories);
        });
        _.merge(this.layouts, layouts);
      }));
    });
    Q.all(qs).then(function() { d.resolve(); }).fail(function(err) { d.reject(err); });
    if(options.extraLayouts)
    {
      let hash = md5(options.extraLayouts);
      if(this.layoutUrls[hash]) return;
      let layouts = LayoutParser.parseFromString(options.extraLayouts);
      this.layoutUrls[hash] = layouts;
      Object.keys(layouts).forEach((cid)=> {
        this.localVueComponents['c'+cid] = VueComponentFactory.createFromLayout(layouts[cid]);
        _.merge(this.layoutCategories, layouts[cid].categories);
      });
      _.merge(this.layouts, layouts);
    }
    return d.promise;
  }
  
  static create(options)
  {
    
    options = _.merge({}, {
      container: null,
      root: null,
      assetRoot: '',
      layoutUrls: [],
      extraLayouts: null,
      layouts: {},
      items: [],
      mode: 'edit',
      editors: this.options.editors,
    },options);
    
    if(!options.container)
    {
      throw new TypeError("RichArea must be attached to a DOM element container.");
    }
    if(options.layoutUrls.length==0)
    {
      throw new TypeError("RichArea must have at least one layout file defined.");
    }
    
    let templates = {
      edit: require("../templates/edit.html"),
      view: require("../templates/view.html"),
    };
    
    options.root = $("<div class='richarea'>"+templates[options.mode]+"</div>");
    $(options.container).append(options.root);
    this.ensureLayoutsLoaded(options).then(() =>{
      if(Object.keys(this.layouts).length==0)
      {
        throw new TypeError("You must define at least one layout.");
      }
      this.initVue(options);
    }).done();
  }

  static migrate(item)
  {
    if(!item.version)
    {
      item.version = 1;
      item.layoutId = item.layout_id;
      delete item.layout_id;
    }
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
    this.migrate(item);
    _.merge(item, {data: {}});
    let layout = this.layouts[item.layoutId];
    if(layout)
    {
      let fields = layout.fields;
      Object.keys(fields).forEach((key)=> {
        if(key in item.data) return;
        item.data[key] = fields[key].defaultValue;
      });
    } else {
      console.log(`Warning: Undefined layout for ${JSON.stringify(item)}`);
    }
    return item;
  } 
   
  static initVue(options)
  {
    let items = this.ensureDefaultValues(_.union([], options.items));

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
    
    let appData = _.merge({}, options, {
      content: null,
      itemsJson: null,
      currentIdx: null,
      $currentLayout: null,
      items: items,
      selectedCategory: 'default',
      layoutCategories: Object.keys(this.layoutCategories).sort(),
      layouts: this.layouts,
    });
    
    new Vue({
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
          return this.layouts[currentItem.layoutId];
        },
        config: function() {
          return options;
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
        titleize: (s)=> {
          return changeCase.title(s);
        }
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
        add: function(idx) {
          this.currentIdx = idx;
          let $modal = $editor().find('.layouts-modal');
          $modal.modal('show');
        },
        selectCat: function(k) {
          this.selectedCategory = k;
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
        close: function(e)
        {
          $editor().find('.modal.in').modal('hide');
          setTimeout(this.calc,0);
          e.preventDefault();
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
          let $li = $(event.target).closest('li');
          this.currentIdx = $li.index();
          this.$currentLayout = $li;
        },
        insert: function(layoutId)
        {
          let o = RichArea.ensureDefaultValues({version: 1, layoutId: layoutId});
          let idx = $sortable().find('li.active').index();
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
          this.items.splice(this.currentIdx,0,_.merge({}, this.items[this.currentIdx]));
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
        if($.prototype.sortable)
        {
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
        }
        if($.prototype.fullscreen)
        {
          $editor().find('.modal-fullscreen').fullscreen();
        }
        let e = $editor().find('.layout-settings .modal-dialog').get(0);
        var Draggable = require ('draggable');
        new Draggable (e, {
          handle: $(e).find('.modal-header').get(0),
        });

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
RichArea.options = {
  editors: {
    
  }
};
RichArea.editors = {};
RichArea.layoutUrls = {};
RichArea.layouts = {};
RichArea.layoutCategories = {};
RichArea.localVueComponents = {};

RichArea.registerEditor(require('./editors/TextEditor.js'));
RichArea.registerEditor(require('./editors/TextareaEditor.js'));
RichArea.registerEditor(require('./editors/LinkEditor.js'));
RichArea.registerEditor(require('./editors/DropdownEditor.js'));
RichArea.registerEditor(require('./editors/MarkdownEditor.js'));
RichArea.registerEditor(require('./editors/ImageEditor.js'));

module.exports = RichArea;