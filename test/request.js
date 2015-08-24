var Util = require('util');
var FS = require('fs');
var Path = require('path');
var Expect = require('chai').expect;
var Mkdirp = require('mkdirp');

var RequestBuilder = require('../generators/request.js');
var Languages = require('../langs/langs.js');
var Utils = require('../langs/utils.js');

var requests = [{
  domain: 'api.lucybot.com',
  path: 'request/languages',
}, {
  protocol: 'https',
  method: 'post',
  domain: 'api.foo.com',
  path: 'bar/baz',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'asdf'
  },
  query: {
    q: 'Obama'
  },
  body : [
    {a: 1, b: 2},
    {a: 3, b: 4},
  ]
}, {
  query: {
    q: ['one', 'two', 'three']
  }
}]

describe('Request Builder', function() {
  Object.keys(Languages).forEach(function(lang) {
    it('should build requests for ' + lang, function() {
      lang = Languages[lang];
      requests.forEach(function(r, requestIdx) {
        var req = JSON.parse(JSON.stringify(r));
        RequestBuilder.build({language: lang.name, request: req}, function(err, code) {
          Expect(err).to.equal(null);
          var goldenDir = Path.join(__dirname, 'golden/request', lang.name);
          var goldenFile = Path.join(goldenDir, requestIdx + lang.extension);
          if (process.env.WRITE_GOLDEN) {
            if (!FS.existsSync(goldenDir)) Mkdirp.sync(goldenDir);
            FS.writeFileSync(goldenFile, code);
          } else {
            golden = FS.readFileSync(goldenFile, 'utf8');
            Expect(code).to.equal(golden);
          }
        });
      });
    });
  })
})
