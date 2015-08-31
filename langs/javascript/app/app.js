var FS = require('fs');
var EJS = require('ejs');

var Utils = require('../../utils.js');

var App = module.exports = {
  startServer: function(opts) {return 'php -S 0.0.0.0:' + opts.port + ' -t ' + opts.directory},
  includeView: function(view, options) {
    var code = EJS.render(App.templates.include, {view: view, options: options});
    return Utils.shift(code, options.indent);
  }
}
Utils.initializeApp(App, __dirname);

App.build = function(input, lucy, callback) {
  var serverActions = input.actions.filter(function(a) {return a.forceServer});
  input.actions = input.actions.filter(function(a) {return !a.forceServer})
  var index = {
    filename: 'index.html',
    contents: EJS.render(App.templates.index, {input: input, Lucy: lucy, shift: Utils.shift}),
    snippets: {},
  }
  var files = [index];
  var setupSnippet = '';
  if (input.setup) setupSnippet += input.setup.code
  if (input.viewSetup) setupSnippet += input.viewSetup.code;
  if (setupSnippet) index.snippets.setup = setupSnippet;
  input.actions.forEach(function(action) {
    index.snippets[action.name] = action.code;
  });
  input.views.forEach(function(view) {
    index.snippets[view.name] = view.code;
  });
  serverActions.forEach(function(action) {
    var actionFile = {
      filename: action.name + '.php',
      contents: action.code,
      snippets: {}
    };
    actionFile.snippets[action.name] = action.code;
    files.push(actionFile);
  })
  callback(null, files);
}

