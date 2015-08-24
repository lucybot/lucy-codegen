var FS = require('fs');
var Path = require('path');
var Mkdirp = require('mkdirp');
var Rmdir = require('rimraf');
var Expect = require('chai').expect;

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
        if (err) {
          console.log(err);
          throw err;
        }
        var dirs = files.filter(function(f) { return f.directory });
        files = files.filter(function(f) {return !f.directory});
        var outputDir = Path.join(__dirname, 'golden/app', lang);
        if (process.env.WRITE_GOLDEN) {
          if (FS.existsSync(outputDir)) Rmdir.sync(outputDir);
          Mkdirp.sync(outputDir);
          dirs.forEach(function(dir) {
            var filename = Path.join(outputDir, dir.filename);
            if (!FS.existsSync(filename)) Mkdirp.sync(Path.join(outputDir, dir.filename));
          });
          files.forEach(function(file) {
            console.log('WRITING: ' + file.filename);
            FS.writeFileSync(Path.join(outputDir, file.filename), file.contents);
          });
        } else {
          files.forEach(function(file) {
            var golden = FS.readFileSync(Path.join(outputDir, file.filename), 'utf8');
            Expect(file.contents).to.equal(golden);
          })
        }
      });
    });
  });
});
