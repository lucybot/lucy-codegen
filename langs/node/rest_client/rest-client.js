var _ = require('lodash');
var FS = require('fs');
var Path = require('path');
var EJS = require('ejs');
var SwaggerCodegen = require('swagger-js-codegen').CodeGen;

var RESTClient = module.exports = {};

RESTClient.templates = {
  sampleCode: FS.readFileSync(__dirname + '/tmpl/sample-code.js', 'utf8'),
}

// Copied from https://github.com/wcandillon/swagger-js-codegen/blob/master/lib/codegen.js
var camelCase = function(id) {
    if(id.indexOf('-') === -1) {
        return id;
    }
    var tokens = [];
    id.split('-').forEach(function(token, index){
        if(index === 0) {
            tokens.push(token[0].toLowerCase() + token.substring(1));
        } else {
            tokens.push(token[0].toUpperCase() + token.substring(1));
        }
    });
    return tokens.join('');
};
var getPathToMethodName = function(m, path){
    if(path === '/' || path === '') {
        return m;
    }

    // clean url path for requests ending with '/'
    var cleanPath = path;
    if( cleanPath.indexOf('/', cleanPath.length - 1) !== -1 ) {
        cleanPath = cleanPath.substring(0, cleanPath.length - 1);
    }

    var segments = cleanPath.split('/').slice(1);
    segments = _.transform(segments, function (result, segment) {
        if (segment[0] === '{' && segment[segment.length - 1] === '}') {
            segment = 'by' + segment[1].toUpperCase() + segment.substring(2, segment.length - 1);
        }
        result.push(segment);
    });
    var result = camelCase(segments.join('-'));
    return m.toLowerCase() + result[0].toUpperCase() + result.substring(1);
};

RESTClient.build = function(input, callback) {
  var code = SwaggerCodegen.getNodeCode(input);
  callback(null, [{
    filename: 'client.js',
    contents: code,
  }]);
}

RESTClient.buildSampleCode = function(input, callback) {
  var operation = input.swagger.paths[input.path][input.method];
  input.methodName = operation['x-swagger-js-method-name'] || operation.operationId || getPathToMethodName(input.method, input.path);
  var code = EJS.render(RESTClient.templates.sampleCode, {input: input})
  callback(null, code);
}

