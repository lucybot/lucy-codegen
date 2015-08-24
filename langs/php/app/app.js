var FS = require('fs');
var EJS = require('ejs');

var Utils = require('../../utils.js');

var App = module.exports = {
  viewTmpl: FS.readFileSync(__dirname + '/repeated/view.php', 'utf8'),
  actionTmpl: FS.readFileSync(__dirname + '/repeated/action.php', 'utf8'),
  staticTmpl: FS.readdirSync(__dirname + '/static').map(function(file) {
    return {filename: file, tmpl: FS.readFileSync(__dirname + '/static/' + file, 'utf8')}
  }),
  includeTmpl: FS.readFileSync(__dirname + '/repeated/include.php', 'utf8'),
  includeView: function(view, options) {
    var code = '';
    if (options.data) {
      code = EJS.render(App.includeTmpl, {view: view, options: options});
    } else {
      code += '<?php\n'
      if (options.result) code += '  $result = $' + options.result + ';\n'
      code += '  require "' + view + '.php";\n';
      code += '?>'
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
  input.actions.forEach(function(action, index) {
    ejsInput.actionIdx = index;
    var actionFile = {
      filename: action.name + '.php',
      contents: EJS.render(App.actionTmpl, ejsInput),
      snippets: {},
    };
    actionFile.snippets[action.name] = action.code;
    if (input.setup) actionFile.snippets.setup = input.setup.code;
    files.push(actionFile);
  });
  delete ejsInput.actionInput;
  input.views.forEach(function(view, index) {
    ejsInput.viewIdx = index;
    var viewFile = {
      filename: view.name + '.php',
      contents: EJS.render(App.viewTmpl, ejsInput),
      snippets: {},
    }
    viewFile.snippets[view.name] = view.code;
    files.push(viewFile);
  });
  delete ejsInput.viewIdx;
  for (filename in input.staticFiles) {
    var staticFile = {
      filename: filename + '.php',
      contents: EJS.render(input.staticFiles[filename], ejsInput),
      snippets: {}
    }
    files.push(staticFile);
  }
  App.staticTmpl.forEach(function(file) {
    var staticFile = {
      filename: file.filename,
      contents: EJS.render(file.tmpl, ejsInput),
      snippets: {},
    };
    files.push(staticFile);
  })
  callback(null, files);
}

