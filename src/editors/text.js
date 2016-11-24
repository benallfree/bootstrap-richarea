module.exports = {
          props: ['item', 'fieldName'],
          template: '<input class="form-control" type="text" v-model="item.data[fieldName]"/>',
        };