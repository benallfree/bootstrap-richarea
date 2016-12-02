let BaseEditor = require('./BaseEditor');

class LinkEditor extends BaseEditor
{
  static getVueData()
  {
    return {
      props: ['item', 'fieldName'],
      template: `
        <div>
          <input class="form-control" type="text" v-model="item.data[fieldName].href"></input>
          <input class="form-control" type="text" v-model="item.data[fieldName].display"></input>
        </div>
      `
    };
  }
}

module.exports = LinkEditor;