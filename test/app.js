var FS = require('fs');
var Path = require('path');
var Mkdirp = require('mkdirp');
var Rmdir = require('rimraf');
var Expect = require('chai').expect;

var TestUtils = require('./utils.js');

var App = require('../generators/app.js');
var Langs = require('../langs/langs.js');

var readData = function(file) {
  return FS.readFileSync(__dirname + '/data/app/' + file, 'utf8');
}

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
      all: readData('hn/actions/getItem.js'),
      view: 'item',
    },
    getStories: {
      all: readData('hn/actions/getStories.js'),
      view: 'stories',
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
    view: 'stories',
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
        if (err) throw err;
        TestUtils.checkGoldenFiles(__dirname + '/golden/app/hn/' + lang, files);
        done();
      })
    })

    it('should build code for ' + lang, function(done) {
      var opts = JSON.parse(JSON.stringify(buildOpts));
      opts.language = lang;
      for (action in opts.actions) opts.actions[action][lang] = opts.actions[action].all;
      for (view in opts.views) opts.views[view][lang] = opts.views[view].all;
      App.build(opts, function(err, files) {
        if (err) throw err;
        TestUtils.checkGoldenFiles(__dirname + '/golden/app/' + lang, files);
        done();
      })
    });
  });
});

