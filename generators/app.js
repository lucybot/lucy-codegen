var View = require('./view.js');
var Lucy = require('./utils/lucy.js');
var Languages = require('../langs/langs.js');

var Async = require('async');
var EJS = require('ejs');

var App = module.exports = {};

var fixAnswers = function(answers, callback) {
  for (q in answers) {
    var type = typeof answers[q];
    if (type !== 'object' || Array.isArray(answers[q])) {
      answers[q] = {val: answers[q]}
    }
  }
  if (callback) callback(null, answers);
}

App.build = function(options, callback) {
  fixAnswers(options.answers);
  var language = Languages[options.language];
  if (!language || !language.app) return callback({error: "Language " + options.language + " not supported."});
  var langOpts = options.languageOptions = options.languageOptions || {};
  if (langOpts[options.language]) {
    language.setOptions(langOpts[options.language]);
  }
  var ejsViews = {};
  Async.parallel(Object.keys(options.views).map(function(viewName) {
    if (viewName === 'setup') return function(callback) {
      ejsViews[viewName] = ejsViews[viewName] || {};
      var viewObj = options.views[viewName];
      ejsViews[viewName][options.language] = viewObj[options.language] || viewObj.all;
      callback()
    }
    return function(callback) {
      var viewObj = options.views[viewName];
      View.translateToEJS(viewObj[options.language] || viewObj.all, function(err, view) {
        if (err) {
          callback(err);
        } else {
          ejsViews[viewName] = ejsViews[viewName] || {};
          ejsViews[viewName][options.language] = view;
          callback();
        }
      });
    }
  }), function(err) {
    if (err) return callback(err);
    var actionArray = [];
    var viewArray = [];
    var lucy = new Lucy(language, options.answers, {views: ejsViews, actions: options.actions});
    for (viewName in ejsViews) {
      var ejs = ejsViews[viewName][options.language];
      try {
        var view = {
          name: viewName,
          code: EJS.render(ejs, {Lucy: lucy}).trim(),
        };
      } catch (e) {
        console.log(ejs);
        throw e;
      }
      if (viewName === 'setup') options.viewSetup = view;
      else viewArray.push(view);
    }
    for (actionName in options.actions) {
      var action = options.actions[actionName];
      var ejs = action[options.language] || action.all;
      lucy.returnCode = function(toReturn, indent) {
        var clientFile = options.actions[actionName].view;
        return language.returnCode({
          ret: toReturn,
          tabs: indent,
          clientFile: clientFile,
          Lucy: lucy,
        });
      };
      try {
        action = {
          name: actionName,
          code: EJS.render(ejs, {Lucy: lucy}).trim(),
          forceServer: action.forceServer,
          view: action.view,
        }
      } catch (e) {
        console.log(ejs);
        throw e;
      }
      if (actionName === 'setup') options.setup = action;
      else actionArray.push(action);
    }
    options.views = viewArray;
    options.actions = actionArray;
    language.app.build(options, lucy, function(err, files) {
      if (language.setOptions) language.setOptions();
      callback(err, files);
    })
  });
}

