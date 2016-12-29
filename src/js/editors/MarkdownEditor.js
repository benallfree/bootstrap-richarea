let BaseEditor = require('./BaseEditor');

import 'simplemde/src/css/simplemde.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror-spell-checker/src/css/spell-checker.css'

import simplemde from 'simplemde'; // import from npm package
import marked from 'marked';
import toMarkdown from 'to-markdown';

jQuery.fn.visible = function() {
    return this.css('visibility', 'visible');
};

jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};

jQuery.fn.visibilityToggle = function() {
    return this.css('visibility', function(i, visibility) {
        return (visibility == 'visible') ? 'hidden' : 'visible';
    });
};

class MarkdownEditor extends BaseEditor
{
  static getVueData() {
    return {
      props: ['item', 'fieldName'],
      data() {
        return {
          isInitialized: false,
        };
      },
      template: `
        <div>
          <textarea class="form-control markdown-editor" rows="10" ref="area"></textarea>
        </div>
      `,
      methods: {
        showBsModal () {
          console.log(`before show ${this.item.layout_id}:${this.fieldName}`);
          if(this.isInitialized) return;
          this.$editor.invisible();
        },
        shownBsModal () {
          console.log(`on show ${this.item.layout_id}:${this.fieldName}`);
          if(this.isInitialized) return;
          this.mde = new simplemde({element: this.$refs.area })
          this.mde.value(toMarkdown(this.item.data[this.fieldName]));
          this.mde.codemirror.on('change', ()=>{
            this.item.data[this.fieldName] = marked(this.mde.value());
          });
          this.isInitialized = true;
        },
        hideBsModal () {
        },              
      },
      mounted() {
        console.log(`mount ${this.item.layout_id}:${this.fieldName}`);
        this.$root = $(this.$el);
        this.$modal = this.$root.closest('.modal');
        this.$editor = this.$root.find('.markdown-editor');
        this.$modal.on('show.bs.modal', this.showBsModal);
        this.$modal.on('shown.bs.modal', this.shownBsModal);
        this.$modal.on('hide.bs.modal', this.hideBsModal);
        
      },
      beforeDestroy () {
        console.log(`unmount ${this.item.layout_id}:${this.fieldName}`);
        this.$modal.off('show.bs.modal', this.showBsModal);
        this.$modal.off('shown.bs.modal', this.shownBsModal);
        this.$modal.off('hide.bs.modal', this.hideBsModal);
      },
    };
  }
}
MarkdownEditor.slug = 'MarkdownEditor'

module.exports = MarkdownEditor;