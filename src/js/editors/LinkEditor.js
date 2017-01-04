let BaseEditor = require('./BaseEditor');
let changeCase = require('change-case');

class LinkEditor extends BaseEditor
{
  static getVueData()
  {
    return {
      props: ['item', 'fieldName'],
      template: `
        <div>
          <div v-for="(v,k) in item.data[fieldName]" class="row">
            <label class="col-xs-2 control-label">{{k | titlecase | titleize }}</label>
            <div class="col-xs-10">
              <input class="form-control" type="text" v-model="item.data[fieldName][k]"></input>
            </div>
          </div>
        </div>
      `,
      filters: {
        titlecase: (text)=> {
          let result = text.replace( /([A-Z])/g, " $1" );
          let finalResult = result.charAt(0).toUpperCase() + result.slice(1);
          return finalResult;
        },
        jsonify: (obj)=> {
          return JSON.stringify(obj);
        },                   
        titleize: (s)=> {
          return changeCase.title(s);
        }
      },      
    };
  }
}
LinkEditor.slug = 'LinkEditor'

module.exports = LinkEditor;