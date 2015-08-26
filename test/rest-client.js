var Util = require('util');
var FS = require('fs');
var Path = require('path');
var Expect = require('chai').expect;
var Mkdirp = require('mkdirp');
var Browser = require('node-horseman');

var Server = require('./rest_client/server.js');
var ClientBuilder = require('../generators/rest-client.js');
var Languages = require('../langs/langs.js');
var TestUtils = require('./utils.js');
var Utils = require('../langs/utils.js');

var SWAGGER = JSON.parse(FS.readFileSync(__dirname + '/rest_client/data/pets.swagger.json', 'utf8'));

describe('REST Client Generator', function() {
  before(function() {
    Server.listen(3333);
  });

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

  var checkPets = function(pets) {
    Expect(pets).to.be.an('array');
    Expect(pets).to.deep.equal([{name: 'Lucy', type: 'dog'}])
  }

  it('should be able to use node client', function(done) {
    var PetStore = require(Path.join(__dirname, 'golden/rest_client/node/index.js'));
    var store = new PetStore();
    store.get('/pets', function(err, pets) {
      Expect(err).to.equal(null);
      checkPets(pets);
      done();
    })
  });

  it('should be able to use JS client', function(done) {
    var browser = new Browser();
    browser.on('consoleMessage', function(msg) {
      var pets = JSON.parse(msg);
      checkPets(pets);
      done();
    });
    browser.on('error', console.log);
    browser.open('file://' + __dirname + '/rest_client/js_client.html', console.log);
  });
});
