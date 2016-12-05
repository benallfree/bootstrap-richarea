class VueComponentFactory
{
  static createFromLayout(c)
  {
    return {
      props: ['item', 'config'],
      template: "<div class='layout-container'>"+c.template+"</div>",
      filters: {
        embedify: (url)=> {
          function getId(url) {
            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            var match = url.match(regExp);

            if (match && match[2].length == 11) {
                return match[2];
            } else {
                return 'error';
            }
          }
          var myId = getId(url);

          return '//www.youtube.com/embed/'+myId;
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