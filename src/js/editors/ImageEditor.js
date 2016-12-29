class ImageEditor extends RichAreaBaseEditor
{
  
  static initField(field, layout, options)
  {
    field.defaultValue.originalImage = options.editors.ImageEditor.assetRoot + field.defaultValue.originalImage;
    field.defaultValue.croppedImage = options.editors.ImageEditor.assetRoot + field.defaultValue.croppedImage;
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
        $modal: null,
        $editor: null,
        $root: null,
        $referenceImage: null,
        $fileInput: null,
        shouldSave: false,
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
          let w = Math.floor(this.$referenceImage.actual('width'));
          let h = Math.floor(this.$referenceImage.actual('height'));
          this.$editor.cropit({
            exportZoom: this.$referenceImage.get(0).naturalWidth / w,
            imageBackground: false,
            imageBackgroundBorderWidth: 0,
            initialZoom: 'image',
            width: w,
            height: h,
            maxZoom: 5,
            onFileReadError: function() { console.log('onFileReadError', arguments); },
            onImageError:  function() { console.log('onImageError', arguments); },
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
        console.log(`mount ${this.item.layout_id}:${this.fieldName}`);
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
        console.log(`unmount ${this.item.layout_id}:${this.fieldName}`);
        this.$modal.off('show.bs.modal', this.showBsModal);
        this.$modal.off('shown.bs.modal', this.shownBsModal);
        this.$modal.off('hide.bs.modal', this.hideBsModal);
      },
      
    };
  }
}

module.exports = ImageEditor;