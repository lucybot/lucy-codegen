var FS = require('fs');
var Path = require('path');
var Expect = require('chai').expect;
var Mkdirp = require('mkdirp');

var Languages = require('../langs/langs.js');
var TestUtils = require('./utils.js');

var ClientBuilder = require('../generators/swagger-codegen.js');

var SWAGGER = JSON.parse(FS.readFileSync(__dirname + '/data/swagger/petstore.json', 'utf8'));

describe('Swagger Client Generator', function() {
  it('should build php client', function(done) {
    ClientBuilder.build({
      language: 'php',
      swagger: SWAGGER,
    }, function(err, files) {
      Expect(err).to.equal(null);
      var outputDir = Path.join(__dirname, 'golden/swagger_client', 'php');
      TestUtils.checkGoldenFiles(outputDir, files);
      done();
    })
  });
});
