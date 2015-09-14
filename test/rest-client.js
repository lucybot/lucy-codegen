var Util = require('util');
var FS = require('fs');
var Path = require('path');
var Expect = require('chai').expect;
var Mkdirp = require('mkdirp');
var Browser = require('node-horseman');

var Server = require('./data/rest_client/server.js');
var ClientBuilder = require('../generators/rest-client.js');
var Languages = require('../langs/langs.js');
var TestUtils = require('./utils.js');
var Utils = require('../langs/utils.js');

var SWAGGER = JSON.parse(FS.readFileSync(__dirname + '/data/swagger/hacker_news.json', 'utf8'));

describe('REST Client Generator', function() {
  before(function() {
    Server.listen(3333);
  });

  Object.keys(Languages).forEach(function(lang) {
    if (!Languages[lang].restClient) return;
    it('should build client for ' + lang, function() {
      lang = Languages[lang];
      ClientBuilder.build({language: lang.name, swagger: SWAGGER, className: 'LucyBot'}, function(err, files) {
        Expect(err).to.equal(null);
        var outputDir = Path.join(__dirname, 'golden/rest_client', lang.name);
        TestUtils.checkGoldenFiles(outputDir, files);
      });
    });
  })
});
