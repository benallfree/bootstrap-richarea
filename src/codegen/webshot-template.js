module.exports = function(layout) {
  let assetRoot = 'file://'+process.cwd()+'/dist';
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags always come first -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/ionicons/2.0.1/css/ionicons.min.css">
    <link rel="stylesheet" href="${assetRoot}/richarea.css">

    <script src="https://cdn.jsdelivr.net/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/vue/2.1.1/vue.min.js"></script>

    <script src="${assetRoot}/richarea.js"></script>    
  </head>
  <body>
    <div id="richarea"></div>
    <script>
    $(function() {
      $('#richarea').richarea({
        assetRoot: '../dist',
        layouts: [
          '../dist/templates/layouts.html'
        ],
        items: [
          {layout_id: 'richarea-1'}
        ],
        mode: 'view',
      });
    });
    </script>
  </body>
</html>
  `
}