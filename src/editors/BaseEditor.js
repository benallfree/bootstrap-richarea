class BaseEditor
{
  static initField(field, layout) {
    
  }
  
  static getVueData() {
    throw new TypeError("Must implement");
  }
}

module.exports = BaseEditor;