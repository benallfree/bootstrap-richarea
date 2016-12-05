class BaseEditor
{
  static initField(field, layout, options) {
    
  }
  
  static getVueData() {
    throw new TypeError("Must implement");
  }
}

module.exports = BaseEditor;