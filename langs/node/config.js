var FS = require('fs');
var DeepExtend = require('deep-extend');

var JS = require('../javascript/config.js');

var Node = module.exports = DeepExtend({}, JS);

Node.name = 'node';
Node.label = 'NodeJS';

Node.html.variableJS = function(v) {
  return '<%- JSON.stringify(' + Node.variable(v) + ') %>'
}
Node.returnCode = function(input) {
  return "res.render('" + input.clientFile + "', {request: req.body, result: " + input.ret + "})";
}
Node.userInput = function(input) {
  return 'req.body.' + input.question;
}

Node.request = {
  template: FS.readFileSync(__dirname + '/tmpl/request.ejs.js', 'utf8'),
  setup: 'var request = require(\'request\');',
}

Node.redirect = function(input) {
  return "res.redirect('" + input.redirectPath + "')";
}

Node.app = require('./app/app.js');
