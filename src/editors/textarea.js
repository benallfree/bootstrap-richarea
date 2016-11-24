module.exports = {
  props: ['item', 'fieldName'],
  template: '<textarea class="form-control" rows="3" v-model="item.data[fieldName]"></textarea>',
};