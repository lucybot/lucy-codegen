var Util = require('util');
var FS = require('fs');
var Path = require('path');
var Expect = require('chai').expect;
var Mkdirp = require('mkdirp');

var ClientBuilder = require('../generators/rest-client.js');
var Languages = require('../langs/langs.js');
var TestUtils = require('./utils.js');
var Utils = require('../langs/utils.js');

var SWAGGER = JSON.parse(FS.readFileSync(__dirname + '/resources/hacker_news.swagger', 'utf8'));

describe('REST Client Generator', function() {
  Object.keys(Languages).forEach(function(lang) {
    it('should build client for ' + lang, function() {
      lang = Languages[lang];
      ClientBuilder.build({language: lang.name, swagger: SWAGGER}, function(err, files) {
        Expect(err).to.equal(null);
        var outputDir = Path.join(__dirname, 'golden/rest_client', lang.name);
        TestUtils.checkGoldenFiles(outputDir, files);
      });
    });
  })

  it('should be able to use node client', function(done) {
    var HNClient = require(Path.join(__dirname, 'golden/rest_client/node/index.js'));
    var hn = new HNClient();
    hn.get('/topstories.json', function(err, stories) {
      Expect(err).to.equal(null);
      Expect(stories).to.be.an('array');
      done();
    })
  });
})
