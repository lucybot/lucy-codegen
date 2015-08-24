var Languages = require('../langs/langs.js');

var APIClient = module.exports = {};

APIClient.build = function(options, callback) {
  var lang = Languages[options.language];
  if (!lang) return callback({user_message: 'Language ' + options.language + ' does not exist'});
  lang.apiClient.build(options, callback);
}
