var FS = require('fs');
var EJS = require('ejs');

var Utils = require('../../utils.js');

var App = module.exports = {
  serverTmpl: FS.readFileSync(__dirname + '/static/server.js', 'utf8'),
  indexTmpl: FS.readFileSync(__dirname + '/static/index.html', 'utf8'),
  includeTmpl: FS.readFileSync(__dirname + '/repeated/include.html', 'utf8'),
  includeView: function(view, options) {
    var code = '';
    if (options.data) {
      code = EJS.render(App.includeTmpl, {view: view, options: options});
    } else {
      if (options.result && options.result !== 'result') code += '<% result = ' + options.result + '; -%>\n';
      code += '<% include ' + view + ' -%>';
    }
    return Utils.shift(code, options.indent);
  }
};

App.build = function(input, lucy, callback) {
  var files = [];
  var ejsInput = {
    Lucy: lucy,
    input: input,
    shift: Utils.shift,
  }

  var serverFile = {
    filename: 'server.js',
    contents: EJS.render(App.serverTmpl, ejsInput),
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
    contents: EJS.render(App.indexTmpl, ejsInput),
    snippets: {}
  }
  files.push(index);
  callback(null, files);
}

