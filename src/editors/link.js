module.exports = {
  props: ['item', 'fieldName'],
  template: `
    <div>
      <input class="form-control" type="text" v-model="item.data[fieldName].href"></input>
      <input class="form-control" type="text" v-model="item.data[fieldName].display"></input>
    </div>
  `
};
