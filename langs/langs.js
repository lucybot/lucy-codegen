var FS = require('fs');

var Langs = module.exports = {};

var dirs = FS.readdirSync(__dirname);
dirs.forEach(function(d) {
  if (!FS.statSync(__dirname + '/' + d).isDirectory()) return;
  Langs[d] = require('./' + d + '/config.js');
});
