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
  Object.keys(Languages).forEach(function(lang) {
    lang = Languages[lang];
    if (!lang.restClient) return;
    it('should build client for ' + lang.name, function(done) {
      ClientBuilder.build({language: lang.name, swagger: SWAGGER, className: 'PetStore'}, function(err, files) {
        Expect(err).to.equal(null);
        var outputDir = Path.join(__dirname, 'golden/rest_client', lang.name);
        TestUtils.checkGoldenFiles(outputDir, files);
        done();
      });
    });

    it('should build sample code for ' + lang.name, function(done) {
      ClientBuilder.buildSampleCode({
        language: lang.name,
        swagger: SWAGGER,
        className: 'PetStore',
        packageName: __dirname + '/golden/rest_client/node/client.js',
        method: 'get',
        path: '/pets',
        answers: {type: 'dog'}
      }, function(err, code) {
        Expect(err).to.equal(null);
        var files = [{filename: 'code.js', contents: code}];
        var outputDir = Path.join(__dirname, 'golden/rest_client_sample_code', lang.name);
        TestUtils.checkGoldenFiles(outputDir, files);
        done();
      })
    })
  });
});

describe('NodeJS REST Client', function() {
  var client = null;
  before(function() {
    var PetStore = require('./golden/rest_client/node/client.js').PetStore;
    client = new PetStore('http://127.0.0.1:3333');
    Server.listen(3333);
  });

  var Pets = [
    {name: 'Lucy', type: 'dog'},
    {name: 'Taco', type: 'cat'},
    {name: 'Blaney', type: 'dog'},
  ]

  it('should return pets', function(done) {
    client.getPets().then(function(pets) {
      Expect(pets.body).to.deep.equal(Pets);
      done();
    }).fail(function(err) {
      console.log(err);
      Expect(err).to.equal(null);
      done();
    })
  })

  it('should return dogs', function(done) {
    client.getPets({type: 'dog'}).then(function(pets) {
      Expect(pets.body).to.deep.equal([Pets[0], Pets[2]]);
      done();
    }).fail(function(err) {
      console.log(err);
      Expect(err).to.equal(null);
      done();
    })
  })

  it('should return pet by name', function(done) {
    client.getPetByName({name: 'Taco'}).then(function(pet) {
      Expect(pet.body).to.deep.equal(Pets[1])
      done();
    }).fail(function(err) {
      console.log(err);
      Expect(err).to.equal(null);
      done();
    })
  })
})
