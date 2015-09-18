var FS = require('fs');
var Path = require('path');
var Mkdirp = require('mkdirp');
var Rmdir = require('rimraf');
var Expect = require('chai').expect;

var TestUtils = module.exports = {};

TestUtils.checkGoldenFiles = function(directory, files) {
  var dirs = files.filter(function(f) { return f.directory });
  files = files.filter(function(f) {return !f.directory});
  if (process.env.WRITE_GOLDEN) {
    if (FS.existsSync(directory)) Rmdir.sync(directory);
    Mkdirp.sync(directory);
    dirs.forEach(function(dir) {
      var filename = Path.join(directory, dir.filename);
      if (!FS.existsSync(filename)) Mkdirp.sync(Path.join(directory, dir.filename));
    });
    files.forEach(function(file) {
      FS.writeFileSync(Path.join(directory, file.filename), file.contents);
    });
  } else {
    files.forEach(function(file) {
      var golden = FS.readFileSync(Path.join(directory, file.filename), 'utf8');
      Expect(file.contents).to.equal(golden);
    })
  }
}

