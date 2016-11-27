'use strict';
let gm = require('gm');
let fs = require('fs');
let Q = require('q');

let s = fs.readFileSync('./src/templates/layouts.html', 'utf8');
let sizes = {};

var regex = /(\/images\/.*?)&/g;

var matches, output = [];
while (matches = regex.exec(s)) {
  output.push(matches[1]);
}

let qs = [];
output.forEach(function(m) {
  if(sizes[m]) return;
  let d = Q.defer();
  gm('./src'+m).size(function(err, size) {
    console.log(m,size);
    sizes[m] = size;
    d.resolve();
  });
  qs.push(d.promise);
})
Q.all(qs).then(function() {
  let i = 0;
  s = s.replace(/(\/images\/.*?)&/g, function(match, path) {
    let s = sizes[path];
    console.log(path);
    i++;
    return 'http://lorempixel.com/'+s.width+'/'+s.height+'/?r='+i+'&';
  })
  fs.writeFileSync('./src/templates/layouts.html', s);
});