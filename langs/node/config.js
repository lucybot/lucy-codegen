var FS = require('fs');
var Util = require('util');
var EJS = require('ejs');

var JS = require('../javascript/config.js');
var Utils = require('../utils.js');
var readTmpl = Utils.readTmplFunc(__dirname, '.js');

var Node = module.exports = Util._extend({}, JS);

Node.name = 'node';
Node.label = 'NodeJS';

Node.variableJS = function(v) {
  return '<%- JSON.stringify(' + Node.variable(v) + ') %>'
}

Node.returnCode = function(input) {
  return "res.render('" + input.clientFile + "', {request: req.body, result: " + input.ret + "})";
}

Node.userInput = function(input) {
  return 'req.body.' + input.question;
}

Node.request = {
  template: readTmpl('request'),
  setup: 'var request = require(\'request\');'
}

Node.redirect = function(input) {
  return "res.redirect('" + input.redirectPath + "')";
}

Node.app = {
  serverTmpl: FS.readFileSync(__dirname + '/app/static/server.js', 'utf8'),
  indexTmpl: FS.readFileSync(__dirname + '/app/static/index.html', 'utf8'),
  includeTmpl: FS.readFileSync(__dirname + '/app/repeated/include.html', 'utf8'),
  includeView: function(view, options) {
    var code = '';
    if (options.data) {
      code = EJS.render(Node.app.includeTmpl, {view: view, options: options});
    } else {
      if (options.result && options.result !== 'result') code += '<% result = ' + options.result + '; -%>\n';
      code += '<% include ' + view + ' -%>';
    }
    return Utils.shift(code, options.indent);
  }
};

Node.app.build = function(input, lucy, callback) {
  var files = [];
  var ejsInput = {
    Lucy: lucy,
    input: input,
    shift: Utils.shift,
  }

  var serverFile = {
    filename: 'server.js',
    contents: EJS.render(Node.app.serverTmpl, ejsInput),
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
    contents: EJS.render(Node.app.indexTmpl, ejsInput),
    snippets: {}
  }
  files.push(index);
  callback(null, files);
}
