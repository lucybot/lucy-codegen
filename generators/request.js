var EJS = require('ejs');

var Languages = require('../langs/langs.js');
var Utils = require('../langs/utils.js');

var Request = module.exports = {};

Request.Languages = Object.keys(Languages).map(function(l) {
    return {id: l, label: Languages[l].label}
});

Request.getLanguages = function(callback) {
  if (callback) callback(null, Request.Languages);
  return Request.Languages
};

Request.build = function(options, callback) {
  var lang = Languages[options.language];
  var params = options.request;
  if (!lang) return callback({user_message: 'Unknown language: ' + options.language});
  if (!params) return callback({user_message: 'No request supplied'});
  var comment = Utils.resolveValue(lang.comment, "Built by LucyBot. www.lucybot.com");
  Utils.setRequestDefaults(params);
  var codeParams = Utils.getRequestLiterals(params, lang);
  codeParams.sends = 'stdout';
  var input = {
    req: codeParams,
    shift: Utils.shift
  }
  var code = EJS.render(lang.templates.request, input);
  callback(null, comment + '\n' + code);
}


