let fs = require('fs');
let Q = require('q');

class Thumbnailer
{
  static process(layout)
  {
    let d = Q.defer();
    console.log('Processing', layout.id);
    
    var webshot = require('webshot');

    var options = {
      screenSize: {
        width: 1024
        , height: 768
      },
      siteType: 'html',
      // phantomPath: './node_modules/.bin/phantomjs',
    };
    
    var template = require('./webshot-template')(layout);

    let src = `./build/images/${layout.id}.png`;
    let dst = `./src/images/${layout.id}.png`;
    
    console.log(`${src}->${dst}`);
    webshot(template, src, options, function(err) {
      if(err)
      {
        console.log(err);
        return;
      }
      var gm = require('gm');
      var canvasWidth = 1024;
      var canvasHeight = 768;
      gm(src).trim().size(function(error, size) {
        if (error) {
          console.error(error);
          return;
        }
        // current image size
        var imageWidth = 1024;
        var imageHeight = size.height;
        // center placement
        var x = (canvasWidth / 2) - (imageWidth / 2);
        var y = (canvasHeight / 2) - (imageHeight / 2);
        this.background('#ffffff')
        .resize(imageWidth, imageHeight)
        .gravity('Center')
        .extent(canvasWidth, canvasHeight)
        .resize(320,240)
        .borderColor('#ffffff')
        .border(20,20)
        .noProfile()
        .write(dst, function(error) {
          if (error) {
            console.error(error);
            return;
          }
          console.log('finished', src);
          fs.unlink(src);
          d.resolve();
        });
      });
    });
    return d.promise;    
  }
}

module.exports = Thumbnailer;