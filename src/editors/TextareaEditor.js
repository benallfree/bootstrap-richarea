let BaseEditor = require('./BaseEditor');

class TextareaEditor extends BaseEditor
{
  static getVueData() {
    return {
      props: ['item', 'fieldName'],
      template: '<textarea class="form-control" rows="3" v-model="item.data[fieldName]"></textarea>',
    };
  }
}

module.exports = TextareaEditor;