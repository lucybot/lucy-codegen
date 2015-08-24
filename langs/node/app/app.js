var FS = require('fs');
var EJS = require('ejs');

var Utils = require('../../utils.js');

var App = module.exports = {
  includeView: function(view, options) {
    var code = '';
    if (options.data) {
      code = EJS.render(App.templates.include, {view: view, options: options});
    } else {
      if (options.result && options.result !== 'result') code += '<% result = ' + options.result + '; -%>\n';
      code += '<% include ' + view + ' -%>';
    }
    return Utils.shift(code, options.indent);
  }
};
Utils.initializeApp(App, __dirname);

App.build = function(input, lucy, callback) {
  var files = [];
  var ejsInput = {
    Lucy: lucy,
    input: input,
    shift: Utils.shift,
  }

  var serverFile = {
    filename: 'server.js',
    contents: EJS.render(App.templates.server, ejsInput),
    snippets: {},
  };
  input.actions.forEach(function(action) {
    serverFile.snippets[action.name] = action.code;
  });
  if (input.setup) serverFile.snippets.setup = input.setup.code;
  files.push(serverFile);

  files.push({
    filename: 'views',
    directory: true,
  });

  input.views.forEach(function(view) {
    var viewFile = {
      filename: 'views/' + view.name + '.ejs',
      contents: view.code,
      snippets: {},
    }
    viewFile.snippets[view.name] = view.code;
    files.push(viewFile);
  });
  var index = {
    filename: 'views/index.ejs',
    contents: EJS.render(App.templates.index, ejsInput),
    snippets: {}
  }
  files.push(index);
  callback(null, files);
}

