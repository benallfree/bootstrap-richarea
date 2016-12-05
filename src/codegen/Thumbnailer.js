'use strict'

let fs = require('fs');
let Q = require('q');

class Thumbnailer
{
  static createAsync(url, layout)
  {
    return function(cb)
    {
      console.log('Processing', layout.id);
    
      var webshot = require('webshot');

      var options = {
        screenSize: {
          width: 1024,
          height: 768
        },
        shotSize: {
          width: 1024,
          height: 768-140,
        },
        shotOffset: {
          top: 130,
        },
        // siteType: 'html',
        // userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
        phantomPath: './node_modules/.bin/phantomjs',
        takeShotOnCallback: true,
        errorIfJSException: true,
      };
    
      let src = `./build/images/${layout.id}.png`;
      let dst = `./src/assets/images/${layout.id}.png`;
    
      console.log(`${src}->${dst}`);
      webshot(url, src, options, function(err) {
        if(err)
        {
          console.log(err);
          cb();
          return;
        }
        var gm = require('gm');
        gm(src)
          .trim()
          .resize(320,240)
          .borderColor('#ffffff')
          .border(20,20)
          .noProfile()
          .write(dst, function(error) {
            if (error) {
              console.error(error);
              cb();
              return;
            }
            console.log('finished', src);
            // fs.unlink(src);
            cb();
          })
        ;
      });
    };
  }
}

module.exports = Thumbnailer;