var Path = require('path');
var FS = require('fs');

var Generators = module.exports = {};

FS.readdirSync(__dirname).forEach(function(f) {
  if (f === 'generators.js' || FS.statSync(Path.join(__dirname, f)).isDirectory()) return;
  Generators[Path.basename(f, '.js')] = require('./' + f);
})
