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
      all: FS.readFileSync(__dirname + '/data/app/view.html', 'utf8'),
    }
  },
  main: {
    view: 'language_list',
    data: {
      action: 'get_languages'
    }
  },
  answers: {
    apikey: 'foobar',
    name: 'Lucy Goose',
    embeddedHTML: '<b>Bold</b>&nbsp;<i>Italic</i>',
    escapedHTML: 'I <3 <b>APIs</b>'
  },
}

var hnBuild = {
  actions: {
    getItem: {
      all: readData('hn/actions/getItem.js')
    },
    getStories: {
      all: readData('hn/actions/getStories.js')
    }
  },
  views: {
    item: {
      all: readData('hn/views/Item.html')
    },
    stories: {
      all: readData('hn/views/Stories.html')
    }
  },
  main: {
    view: 'getStories',
    data: {
      action: 'getStories'
    }
  }
}

describe('App Builder', function() {
  Object.keys(Langs).forEach(function(lang) {
    if (!Langs[lang].app) return;
    it('should build HN app in ' + lang, function(done) {
      var opts = JSON.parse(JSON.stringify(hnBuild));
      opts.language = lang;
      for (action in opts.actions) opts.actions[action][lang] = opts.actions[action].all;
      for (view in opts.views) opts.views[view][lang] = opts.views[view].all;
      App.build(opts, function(err, files) {
      
      })
    })
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

