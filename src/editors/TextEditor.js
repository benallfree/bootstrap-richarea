let BaseEditor = require('./BaseEditor');

class TextEditor extends BaseEditor
{
  static getVueData() {
    return {
      props: ['item', 'fieldName'],
      template: '<input class="form-control" type="text" v-model="item.data[fieldName]"/>',
    };
  };
}

module.exports = TextEditor;