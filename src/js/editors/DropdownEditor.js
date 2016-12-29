let BaseEditor = require('./BaseEditor');

class DropdownEditor extends BaseEditor
{
  static getVueData() {
    return {
      props: ['item', 'fieldName'],
      template: `
      <select class="form-control" v-model="item.data[fieldName].value">
        <template v-for="(v,k) in item.data[fieldName].options">
          <option :value="k">{{ v }}</option>
        </template>
      `,
    };
  };
}
DropdownEditor.slug = 'DropdownEditor'

module.exports = DropdownEditor;