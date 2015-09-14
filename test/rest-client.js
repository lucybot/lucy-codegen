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

var SWAGGER = JSON.parse(FS.readFileSync(__dirname + '/data/swagger/petstore.json', 'utf8'));

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
  });

  var checkPets = function(pets) {
    Expect(pets).to.be.an('array');
    Expect(pets).to.deep.equal([{name: 'Lucy', type: 'dog'}])
  }

  it('should be able to use Node client', function(done) {
     var LucyBot = require('./golden/rest_client/node/client.js').LucyBot;
     var client = new LucyBot('http://127.0.0.1:3333');
     client.getPets().then(function(pets) {
       checkPets(pets.body);
       done();
     }).fail(function(err) {
       console.log(err);
       Expect(err).to.equal(null);
       done();
     })
  })
});
