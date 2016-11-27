module.exports = function(layout) {
  var fs = require('fs');
  var c = {
    css: fs.readFileSync('./dist/richarea.css', 'utf8'),
    js: fs.readFileSync('./dist/richarea.js', 'utf8'),
    layouts: fs.readFileSync('./dist/richarea-layouts.js', 'utf8'),
  }

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
    <style>
    ${c.css}
    </style>

    <script src="https://cdn.jsdelivr.net/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/jquery.ui/1.11.4/jquery-ui.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-migrate/3.0.0/jquery-migrate.min.js"></script>
    <script src="https://cdn.jsdelivr.net/tether/1.3.7/tether.min.js"></script>
    <script src="https://cdn.jsdelivr.net/jquery.cropit/0.5.1/jquery.cropit.js"></script>
    <script src="https://cdn.jsdelivr.net/jquery.actual/1.0.18/jquery.actual.min.js"></script>
    <script src="https://cdn.jsdelivr.net/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/vue/2.1.1/vue.min.js"></script>

    <script>
    ${c.js};
    ${c.layouts};
    // setTimeout(function() {
    //   window.callPhantom('takeShot');
    // },5000);
    </script>
  </head>
  <body>
    <script>
    $(function() {
      $('#richarea').richarea({
        items: [
          {"layout_id":${layout.id},},
        ],
        mode: 'view',
      });
    });
    </script>
  </body>
</html>
  `
}