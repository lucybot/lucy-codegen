var Path = require('path');
var Expect = require('chai').expect;

var TestUtils = require('./utils.js');
var App = require('../generators/app.js');
var Langs = require('../langs/langs.js');

var buildOpts = {
  actions: {
    get_languages: {
      all: 
        "<%- Lucy.code.request(" + JSON.stringify({
        protocol: 'https',
        domain: 'api.lucybot.com',
        path: 'v1/sample_code/languages',
        headers: {
          'apikey': {answer: 'apikey'},
        },
        returns: 'json'
      }) + ") %>",
      view: 'language_list'
    }
  },
  views: {
    language_list: {
      all:
        '<lucy for="l" in="result">\n' +
        '  <lucy if="l.foo">\n' +
        '    <p>foo</p>\n' +
        '  </lucy>\n' +
        '  <lucy if="!l.foo">\n' +
        '    <p>bar</p>\n' +
        '  </lucy>\n' +
        '  <lucy if="index != 2">\n' +
        '    <h2>{{ index }}. {{ l.label }}</h2>\n' +
        '  </lucy>\n' +
        '</lucy>'
    }
  },
  main: {
    view: 'language_list',
    data: {
      action: 'get_languages'
    }
  },
  answers: {
    apikey: {val: 'foobar'}
  },
}

describe('App Builder', function() {
  Object.keys(Langs).forEach(function(lang) {
    if (!Langs[lang].app) return;
    var opts = JSON.parse(JSON.stringify(buildOpts));
    opts.language = lang;
    for (action in opts.actions) {
      opts.actions[action][lang] = opts.actions[action].all;
    }
    for (view in opts.views) {
      opts.views[view][lang] = opts.views[view].all;
    }
    it('should build code for ' + lang, function() {
      App.build(opts, function(err, files) {
        Expect(err).to.equal(null);
        var outputDir = Path.join(__dirname, 'golden/app', lang);
        TestUtils.checkGoldenFiles(outputDir, files);
      });
    });
  });
});
