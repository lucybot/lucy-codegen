var FS = require('fs');

var Generators = module.exports = {};

FS.readdirSync(__dirname).forEach(function(f) {
  if (f === 'generators.js' || FS.statSync(f).isDirectory()) return;
  Generators[FS.basename(f, '.js')] = require('./' + f);
})
