let BaseEditor = require('./BaseEditor');

class ImageEditor
{
  
  static initField(field, layout)
  {
    field.defaultValue.originalImage = options.assetRoot + field.defaultValue.originalImage;
    field.defaultValue.croppedImage = options.assetRoot + field.defaultValue.croppedImage;
  }

  static getVueData()
  {
    return {
      props: ['item', 'fieldName', 'config'],
      template: `
        <div>
          <div :data-field="fieldName" class="image-editor">
            <input accept="image/gif,image/png,image/jpeg" class="cropit-image-input" type="file"></input>
            <img :src="item.data[fieldName].croppedImage" class="reference" style="width:100%; display: none"/>
            <div class="cropit-preview"></div>
            <input class="cropit-image-zoom-input" type="range"></input>
          </div>
        </div>
      `,
      data: {
        isCropperInitialized: false,
      },
      computed: {
        field: function() {
          return this.item.data[this.fieldName];
        }
      },
      mounted: function() {
        let $el = $(this.$el);
        let $modal = $el.closest('.modal');
        $modal.on('show.bs.modal', ()=>{
          if(this.isCropperInitialized) return;
          $modal.find('.image-editor').invisible();
        });
        $modal.on('shown.bs.modal', ()=>{
          if(this.isCropperInitialized) return;
  
          let $e = $el.find('.image-editor');
          let $r = $e.find('.reference');
          let w = Math.floor($r.actual('width'));
          let h = Math.floor($r.actual('height'));
          let shouldSave = false;
          $e.cropit({
            exportZoom: $r.get(0).naturalWidth / w,
            imageBackground: false,
            imageBackgroundBorderWidth: 0,
            initialZoom: 'image',
            width: w,
            height: h,
            maxZoom: 5,
            onFileReadError: function() { console.log('onFileReadError', arguments); },
            onImageError:  function() { console.log('onImageError', arguments); },
            smallImage: 'allow', // Allow images that must be zoomed to fit
            onImageLoaded: ()=>{
              if(!this.isCropperInitialized)
              {
                $e.cropit('zoom', this.field.zoom);
                $e.cropit('offset', this.field.offset);
                this.isCropperInitialized = true;
                $modal.find('.image-editor').visible();
              } else {
                shouldSave = true;
                let $fileInput = $e.find('[type=file]');
                let file = $fileInput.get(0).files[0];
                fr = new FileReader();
                fr.onload = ()=>{
                  if(!this.config.imageUploadUrl) return;
                  $.post(this.config.imageUploadUrl, {
                    data: fr.result,
                  }, (data,status)=>{
                    console.log([data, status]);
                    if(status=='success' && data.status=='success')
                    {
                      this.field.originalImage = data.url;
                      this.field.croppedImage = data.url;
                    }
                  });
                }
                fr.readAsDataURL(file);
                this.field.croppedImage = $e.cropit('export');
              }
            },
            onZoomChange: ()=>{
              if(!this.isCropperInitialized) return;
              shouldSave = true;
              this.field.zoom = $e.cropit('zoom');
              this.field.croppedImage = $e.cropit('export');
            },
            onOffsetChange: ()=>{
              if(!this.isCropperInitialized) return;
              shouldSave = true;
              let o = $e.cropit('offset');
              this.field.offset = {x: Math.floor(o.x), y: Math.floor(o.y)};
              this.field.croppedImage = $e.cropit('export');
            },
          });
          $e.cropit('imageSrc', this.field.originalImage);

          $modal.on('hide.bs.modal', ()=>{
            if(!shouldSave) return;
            if(!this.config.imageUploadUrl) return;
            $.post(this.config.imageUploadUrl, {
              data: $e.cropit('export'),
            }, (data,status)=>{
              console.log([data, status]);
              if(status=='success' && data.status=='success')
              {
                this.field.croppedImage = data.url;
              }
            });
          });          
        });
      }
    };
  }
}

module.exports = ImageEditor;