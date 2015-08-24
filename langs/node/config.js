var FS = require('fs');
var Util = require('util');
var EJS = require('ejs');

var JS = require('../javascript/config.js');
var Utils = require('../utils.js');
var readTmpl = Utils.readTmplFunc(__dirname, '.js');

var Node = module.exports = Util._extend({}, JS);

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
  template: readTmpl('request'),
  setup: 'var request = require(\'request\');'
}

Node.redirect = function(input) {
  return "res.redirect('" + input.redirectPath + "')";
}

Node.app = require('./app/app.js');
