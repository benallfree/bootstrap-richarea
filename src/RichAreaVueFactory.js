class RichAreaVueFactory
{
  static create(options)
  {
    options = $.extend(true, {}, {
      assetRoot: '',
      layoutCategories: require('./categories.js'),
      imageUploadUrl: null,
      layouts: RichAreaConfig.layouts,
      items: [],
      extraLayouts: [],
      editors: {
        'edit-text': require('./editors/text'),
        'edit-textarea': require('./editors/textarea'),
        'edit-link': require('./editors/link'),
        'edit-image': require('./editors/image'),
      },
      mode: 'edit',
    },options);
    
    if(Object.keys(options.layouts).length==0)
    {
      throw new TypeError("You must define at least one layout.");
    }
    
    let localVueComponents = options.editors;
    
    options.extraLayouts.forEach(function(o) {
      options.layouts[o.id] = o;
    })
    
    // Fix up default asset paths
    for(let layout_id in options.layouts)
    {
      let layout = options.layouts[layout_id];
      for(let field_key in layout.fields)
      {
        let field = layout.fields[field_key];
        if(field.editor=='image')
        {
          field.defaultValue.originalImage = options.assetRoot + field.defaultValue.originalImage;
          field.defaultValue.croppedImage = options.assetRoot + field.defaultValue.croppedImage;
        }
      }
    }
    
    // Create Vue components
    Object.keys(options.layouts).forEach(function(cid) {
      let c = options.layouts[cid];
      localVueComponents['c'+c.id] = {
        props: ['item', 'config'],
        template: "<div class='layout-container'>"+c.template+"</div>",
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
      };
    });
    
    function ensureDefaultValues(item)
    {
      if(item instanceof Array)
      {
        item.forEach((item)=>{
          ensureDefaultValues(item);
        });
        return item;
      }
      $.extend(true, item, {data: {}});
      let layout = options.layouts[item.layout_id];
      if(!layout) return;
      let fields = layout.fields;
      Object.keys(fields).forEach((key)=> {
        if(key in item.data) return;
        item.data[key] = fields[key].defaultValue;
      });
      return item;
    }

    
    let items = ensureDefaultValues($.extend(true, [], options.items));

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
    
    let appData = $.extend(true, {
      content: null,
      itemsJson: null,
      currentIdx: null,
      $currentLayout: null,
      items: items,
      selectedCategory: 0,
    }, options);
    
    let app = new Vue({
      components: localVueComponents,
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
          if(!layout.categories) debugger;
          for(var i=0;i<layout.categories.length; i++)
          {
            let id = layout.categories[i];
            if(this.selectedCategory == id) return true;
          }
          return false;
        },
        notifyChange: function() {
          if(!options.onChange) return;
          options.onChange({html: this.content, data: this.items});
        },
        close: function()
        {
          $editor().find('.modal.in').modal('hide');
          this.calc();
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
          var o = ensureDefaultValues({layout_id: layout_id});
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
        // A little hack to wait for all images to finish loading before telling Webshot it's okay to take a screen shot.
        // http://phantomjs.org/api/webpage/handler/on-callback.html
        if (typeof window.callPhantom === 'function') {
          setTimeout(function() {
            window.callPhantom('takeShot');
          },2000);
        }
        
      }
    });      
  }
}

module.exports = RichAreaVueFactory;