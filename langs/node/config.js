var FS = require('fs');
var DeepExtend = require('deep-extend');
var SwaggerCodegen = require('swagger-js-codegen').CodeGen;

var Utils = require('../utils.js');
var JS = require('../javascript/config.js');

var Node = module.exports = DeepExtend({}, JS);
Node.name = 'node';
Node.label = 'NodeJS';

Utils.initializeLanguage(Node);

Node.html.variableJS = function(v) {
  return '<%- JSON.stringify(' + Node.variable(v) + ') %>'
}
Node.returnCode = function(input) {
  return "res.render('" + input.clientFile + "', {request: req.body, result: " + input.ret + "})";
}
Node.userInput = function(input) {
  return 'req.body.' + input.question;
}
Node.redirect = function(input) {
  return "res.redirect('" + input.redirectPath + "')";
}

Node.restClient = {};
Node.restClient.build = function(input, callback) {
  var code = SwaggerCodegen.getNodeCode(input);
  callback(null, [{
    filename: 'client.js',
    contents: code,
  }]);
}
