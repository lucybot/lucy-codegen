var Languages = require('../langs/langs.js');

var RESTClient = module.exports = {};

RESTClient.build = function(options, callback) {
  var lang = Languages[options.language];
  if (!lang) return callback({user_message: 'Language ' + options.language + ' does not exist'});
  lang.restClient.build(options, callback);
}

RESTClient.buildSampleCode = function(options, callback) {
  var lang = Languages[options.language];
  if (!lang) return callback({user_message: 'Language ' + options.language + ' does not exist'});
  lang.restClient.buildSampleCode(options, callback);
}
