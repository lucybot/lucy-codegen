var Util = require('util');
var FS = require('fs');
var Path = require('path');
var Expect = require('chai').expect;
var Mkdirp = require('mkdirp');

var ClientBuilder = require('../generators/api-client.js');
var Languages = require('../langs/langs.js');
var TestUtils = require('./utils.js');
var Utils = require('../langs/utils.js');

var SWAGGER = JSON.parse(FS.readFileSync(__dirname + '/resources/hacker_news.swagger', 'utf8'));

describe('API Client Generator', function() {
  Object.keys(Languages).forEach(function(lang) {
    it('should build client for ' + lang, function() {
      lang = Languages[lang];
      ClientBuilder.build({language: lang.name, swagger: SWAGGER}, function(err, files) {
        Expect(err).to.equal(null);
        var outputDir = Path.join(__dirname, 'golden/api_client', lang.name);
        TestUtils.checkGoldenFiles(outputDir, files);
      });
    });
  })
})
