let ComponentLoader = require('./ComponentLoader');
ComponentLoader.init();

class RichAreaVueFactory
{
  static create(options)
  {
    options = $.extend(true, {}, {
      componentCategories: [],
      userForms: [],
    },options);
    ComponentLoader.onInit(()=>{
      let items = ComponentLoader.ensureDefaultValues($.extend(true, [], options.items));

      function $editor()
      {
        return $(options.root).find('.richarea-editor');
      }
    
      function $sortable()
      {
        return $editor().find('.sortable');
      }
      
      let app = new Vue({
        el: $editor().get(0),
        data: {
          content: null,
          itemsJson: null,
          currentIdx: null,
          $currentComponent: null,
          items: items,
          components: ComponentLoader.components,
          componentCategories: options.componentCategories,
          selectedCategory: 0,
          forms: options.userForms,
        },
        computed: {
          currentItem: function() {
            return this.items[this.currentIdx];
          },
          currentComponent: function() {
            var currentItem = this.items[this.currentIdx];
            if(!currentItem) return null;
            return this.components[currentItem.component_id];
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
            this.isComponentSettingsInitialized=false;
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
          isComponentSettingsInitialized: false,
        },
        methods: {
          add: function() {
            this.currentIdx = null;
            let $modal = $editor().find('.components-modal');
            $modal.modal('show');
          },
          selectCat: function(cat) {
            this.selectedCategory = cat[0];
          },
          inActiveCategories: function(component)
          {
            if(this.selectedCategory==-1) return true;
            for(var i=0;i<component.categories.length; i++)
            {
              let id = component.categories[i];
              if(this.selectedCategory == id) return true;
            }
            return false;
          },
          calc: function()
          {
            this.calcContent();
            this.calcJson();
          },
          calcJson: function()
          {
            this.itemsJson = JSON.stringify(this.items);
          },
          calcContent: function()
          {
            this.$nextTick(()=>{
              var htmls = [];
              $sortable().find('.item .component-container').each(function(idx,e) {
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
            });
          },
          select: function(event)
          {
            var $li = $(event.target).closest('li');
            this.currentIdx = $li.index();
            this.$currentComponent = $li;
          },
          insert: function(component_id)
          {
            var o = ComponentLoader.ensureDefaultValues({component_id: component_id});
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
            let $modal = $editor().find('.component-settings');
            $modal.modal('show');
          },
          initCropper: function(event)
          {
            let $modal = $editor().find('.component-settings');
            $modal.on('show.bs.modal', ()=>{
              if(this.isComponentSettingsInitialized) return;
              $modal.find('.image-editor').invisible();
            });
            $modal.on('shown.bs.modal', ()=>{
              if(this.isComponentSettingsInitialized) return;
              $modal.find('.image-editor').each((idx,e)=> {
                let $e = $(e);
                let $r = $(e).find('.reference');
                let w = Math.floor($r.actual('width'));
                let h = Math.floor($r.actual('height'));
                let $export = $e.find('.export');
                let fieldName = $e.data('field');
                let shouldSave = false;
                $e.cropit({
                  exportZoom: $r.get(0).naturalWidth / w,
                  imageBackground: false,
                  imageBackgroundBorderWidth: 0,
                  initialZoom: 'fill',
                  width: w,
                  height: h,
                  maxZoom: 5,
                  onFileReadError: function() { console.log('onFileReadError', arguments); },
                  onImageError:  function() { console.log('onImageError', arguments); },
                  smallImage: 'allow', // Allow images that must be zoomed to fit
                  onImageLoaded: ()=>{
                    if(!this.isComponentSettingsInitialized)
                    {
                      $e.cropit('zoom', this.currentItem.data[fieldName].zoom);
                      $e.cropit('offset', this.currentItem.data[fieldName].offset);
                      this.isComponentSettingsInitialized = true;
                      $modal.find('.image-editor').visible();
                    } else {
                      shouldSave = true;
                      let $fileInput = $e.find('[type=file]');
                      let file = $fileInput.get(0).files[0];
                      fr = new FileReader();
                      fr.onload = ()=>{
                        $.post(options.imageUploadUrl, {
                          data: fr.result,
                        }, (data,status)=>{
                          console.log([data, status]);
                          if(status=='success' && data.status=='success')
                          {
                            this.items[this.currentIdx].data[fieldName].originalImage = data.url;
                            this.items[this.currentIdx].data[fieldName].croppedImage = data.url;
                          }
                        });
                      }
                      fr.readAsDataURL(file);
                      this.$currentComponent.find('[data-field='+fieldName+']').attr('src', $e.cropit('export'));
                    }
                  },
                  onZoomChange: ()=>{
                    if(!this.isComponentSettingsInitialized) return;
                    shouldSave = true;
                    this.items[this.currentIdx].data[fieldName].zoom = $e.cropit('zoom');
                    this.$currentComponent.find('[data-field='+fieldName+']').attr('src', $e.cropit('export'));
                  },
                  onOffsetChange: ()=>{
                    if(!this.isComponentSettingsInitialized) return;
                    shouldSave = true;
                    let o = $e.cropit('offset');
                    this.items[this.currentIdx].data[fieldName].offset = {x: Math.floor(o.x), y: Math.floor(o.y)};
                    this.$currentComponent.find('[data-field='+fieldName+']').attr('src', $e.cropit('export'));
                  },
                });
                $e.cropit('imageSrc', this.items[this.currentIdx].data[fieldName].originalImage);

                $modal.on('hide.bs.modal', ()=>{
                  if(!shouldSave) return;
                  $.post(options.imageUploadUrl, {
                    data: $e.cropit('export'),
                  }, (data,status)=>{
                    console.log([data, status]);
                    if(status=='success' && data.status=='success')
                    {
                      this.items[this.currentIdx].data[fieldName].croppedImage = data.url;
                    }
                  });
                });          
              });              
            });

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
          $editor().show();
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
          this.initCropper();
          if($.prototype.fullscreen)
          {
            $editor().find('.components-modal').fullscreen();
          }
        }
      });      
    });
  }
}

module.exports = RichAreaVueFactory;