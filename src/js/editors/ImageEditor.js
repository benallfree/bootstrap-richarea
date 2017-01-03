let BaseEditor = require('./BaseEditor');
require('jquery.actual');
require('jquery-migrate');
require('cropit');

class ImageEditor extends BaseEditor
{
  
  static initField(field, layout, options)
  {
    let assetRoot = options.editors[this.slug].assetRoot || layout.assetRoot
    field.defaultValue.originalImage = assetRoot + field.defaultValue.originalImage;
    field.defaultValue.croppedImage = assetRoot + field.defaultValue.croppedImage;
  }

  static getVueData()
  {
    return {
      props: ['item', 'fieldName', 'config', 'layout'],
      template: `
        <div>
          <div :data-field="fieldName" class="image-editor">
            <input accept="image/gif,image/png,image/jpeg" class="cropit-image-input" type="file"></input>
            <img :src="layout.fields[fieldName].defaultValue.croppedImage" class="reference" style="width:100%; display: none"/>
            <div class="cropit-preview"></div>
            <input class="cropit-image-zoom-input" type="range"></input>
          </div>
        </div>
      `,
      data() {
        return {
          isCropperInitialized: false,
          $modal: null,
          $editor: null,
          $root: null,
          $referenceImage: null,
          $fileInput: null,
          shouldSave: false,
        };
      },
      computed: {
        field: function() {
          return this.item.data[this.fieldName];
        }
      },
      methods: {
        showBsModal: function() {
          if(this.isCropperInitialized) return;
          this.$editor.invisible();
        },
        shownBsModal: function() {
          this.shouldSave = false;
          if(this.isCropperInitialized) return;
          if(this.$referenceImage.get(0).naturalWidth==0 || this.$referenceImage.get(0).naturalHeight==0)
          {
            throw new TypeError(`Reference/placeholder image was not found ${this.$referenceImage.attr('src')}`);
          }
          let w = Math.floor(this.$referenceImage.actual('width'));
          let h = Math.floor(this.$referenceImage.actual('height'));
          this.$editor.cropit({
            exportZoom: (this.$referenceImage.get(0).naturalWidth / w) || 1,
            imageBackground: false,
            imageBackgroundBorderWidth: 0,
            initialZoom: 'image',
            width: w,
            height: h,
            maxZoom: 5,
            onFileReadError: function() { console.log('onFileReadError', arguments); },
            onImageError: this.onImageError,
            smallImage: 'allow', // Allow images that must be zoomed to fit
            onImageLoaded: this.onImageLoaded,
            onZoomChange: this.onZoomChange,
            onOffsetChange: this.onOffsetChange,
          });
          this.$editor.cropit('imageSrc', this.field.originalImage);

        },
        hideBsModal: function() {
          if(!this.config.editors.ImageEditor.uploadUrl) return;
          if(!this.shouldSave) return;
          $.post(this.config.editors.ImageEditor.uploadUrl, {
            data: this.$editor.cropit('export'),
          }, (data,status)=>{
            console.log([data, status]);
            if(status=='success' && data.status=='success')
            {
              this.field.croppedImage = data.url;
            }
          });
        },
        onImageError: function() {
          this.$editor.cropit('imageSrc', '');
          this.isCropperInitialized = true;
          this.$editor.visible();
          this.$editor.cropit('offset', {x: 0, y: 0});
        },
        onImageLoaded: function() {
          if(!this.isCropperInitialized)
          {
            let zoom = this.field.zoom == null ? this.$referenceImage.actual('width') / this.$referenceImage.get(0).naturalWidth : this.field.zoom;
            this.$editor.cropit('zoom', zoom);
            this.$editor.cropit('offset', this.field.offset);
            this.isCropperInitialized = true;
            this.$editor.visible();
          } else {
            this.shouldSave = true;
            let file = this.$fileInput.get(0).files[0];
            let fr = new FileReader();
            fr.onload = ()=>{
              if(!this.config.editors.ImageEditor.uploadUrl) return;
              $.post(this.config.editors.ImageEditor.uploadUrl, {
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
            this.field.croppedImage = this.$editor.cropit('export');
          }
        },
        onZoomChange: function() {
          if(!this.isCropperInitialized) return;
          this.shouldSave = true;
          this.field.zoom = this.$editor.cropit('zoom');
          this.field.croppedImage = this.$editor.cropit('export');
        },
        onOffsetChange: function() {
          if(!this.isCropperInitialized) return;
          this.shouldSave = true;
          let o = this.$editor.cropit('offset');
          this.field.offset = {x: Math.floor(o.x), y: Math.floor(o.y)};
          this.field.croppedImage = this.$editor.cropit('export');
        },        
      },
      mounted: function() {
        console.log(`mount ${this.item.layoutId}:${this.fieldName}`);
        this.$root = $(this.$el);
        this.$modal = this.$root.closest('.modal');
        this.$editor = this.$root.find('.image-editor');
        this.$referenceImage = this.$editor.find('.reference');
        this.$fileInput = this.$editor.find('[type=file]');
        this.$modal.on('show.bs.modal', this.showBsModal);
        this.$modal.on('shown.bs.modal', this.shownBsModal);
        this.$modal.on('hide.bs.modal', this.hideBsModal);
      },
      
      beforeDestroy: function() {
        console.log(`unmount ${this.item.layoutId}:${this.fieldName}`);
        this.$modal.off('show.bs.modal', this.showBsModal);
        this.$modal.off('shown.bs.modal', this.shownBsModal);
        this.$modal.off('hide.bs.modal', this.hideBsModal);
      },
      
    };
  }
}
ImageEditor.slug = 'ImageEditor';

module.exports = ImageEditor;