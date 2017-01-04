class VueComponentFactory
{
  static createFromLayout(c)
  {
    return {
      props: ['item', 'config'],
      template: "<div class='layout-container'>"+c.template+"</div>",
      filters: {
        embedify: (urlString)=> {
          let url = require('url');
          let parts = url.parse(urlString, true, true);
          let m = parts.pathname.match(/embed\/(.*)/);
          let id = parts.query.v || ((m && m.length == 2) ? m[1] : '');
          let list = parts.query.list
          let args = {
            pathname: '//www.youtube.com/embed/'+id,
          };
          if(list) args.query = {list: list};
          let ret = url.format(args);
          return ret;
        },
        linebreak: function(v)
        {
          return v.replace("\n", "<br/>");
        }
      }
    };    
  }
}

module.exports = VueComponentFactory;