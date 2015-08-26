var EJS = require('ejs');
var Utils = require('../../utils.js');

var APIClient = module.exports = {};
Utils.initializeAPIClient(APIClient, __dirname);

APIClient.build = function(options, callback) {
  var files = [];
  var ejsInput = {
    input: options,
  }

  var tmplFiles = [{
    filename: 'client.js',
    template: 'client',
  }]

  tmplFiles.forEach(function(t) {
    files.push({
      filename: t.filename,
      contents: EJS.render(APIClient.templates[t.template], ejsInput),
    });
  });
  callback(null, files);
}
