var FS = require('fs');
var Request = require('request');

var Swagger = JSON.parse(FS.readFileSync(__dirname + '/swagger.json', 'utf8'));
var matchSwaggerPath = function(path) {
  for (var templatedPath in Swagger.paths) {
    var regex = new RegExp(templatedPath.replace(/{\w+}/g, '\\w+'));
    if (path.match(regex)) return templatedPath;
  }
}
var producesJSON = function(operation) {
  if (!operation.produces && !Swagger.produces) return true;
  var produces = operation.produces || Swagger.produces || [];
  var mimetype = /application\/json/;
  var matches = false;
  produces.forEach(function(type) {
    if (type.match(mimetype)) matches = true; 
  });
  return matches;
}

var Client = module.exports = function(options) {
  options = options || {};
  this.host = options.host || Swagger.host;
  this.auth = options.auth || {};
  this.protocol = (Swagger.schemes || []).indexOf('https') === -1 ? 'http' : 'https';
}

var initRequestFromSwagger = function() {
  return function(args) {
    var request = {
      url: this.protocol + '://' + this.host + (Swagger.basePath === '/' ? '' : Swagger.basePath),
      qs: {},
      headers: {},
    };
    for (var def in Swagger.securityDefinitions) {
      def = Swagger.securityDefinitions[def];
      if (def.type === 'basic') {
        request.headers.Authorization = 'Basic ' + this.auth.authorization;
      } else if (def.type === 'apiKey') {
        this.addParam(request, def, this.auth);
      } else if (def.type === 'oauth2' && def.flow === 'implicit') {
        request.qs.access_token = args.oauth_token;
      } else if (def.type === 'oauth2') {
        request.headers.Authorization = 'Bearer ' + args.oauth_token;
      }
    }
    return request;
  }
}
Client.prototype.initRequest = initRequestFromSwagger(Swagger);

Client.prototype.addParam = function(request, param, args) {
  if (args[param.name] !== undefined) {
    if (param.in === 'query') {
      request.qs[param.name] = args[param.name];
    } else if (param.in === 'header') {
      request.headers[param.name] = args[param.name];
    } else if (param.in === 'path') {
      request.url = request.url.replace('{' + param.name + '}', args[param.name]);
    } else if (param.in === 'formData') {
      request.form = request.form || {};
      request.form[param.name] = args[param.name];
    } else if (param.in === 'body') {
      request.body = JSON.stringify(args[param.name]);
    }
  }
}
Client.prototype.addParams = function(request, params, args) {
  if (!params) return;
  var self = this;
  params.forEach(function(p) {
    self.addParam(request, p, args);
  })
}

Client.prototype.request = function(path, method, args, callback) {
  if (!callback) {
    callback = args;
    args = {};
  }
  
  var request = this.initRequest();
  request.method = method.toUpperCase();
  request.url += path;

  path = matchSwaggerPath(path);
  var operation = Swagger.paths[path];
  if (!operation) throw new Error('Path ' + path + ' not supported.');
  this.addParams(request, operation.parameters, args);
  operation = operation[method];
  if (!operation) throw new Error('Path ' + path + ' does not support ' + method.toUpperCase() + 'operation.');
  this.addParams(request, operation.parameters, args);

  request.json = producesJSON(operation);
  Request(request, function(err, response, body) {
    if (request.json && typeof body === 'string') {
      try {
        body = JSON.parse(body);
        console.log
      } catch (e) {}
    }
    callback(err, body);
  });
}

var METHODS = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch'];
METHODS.forEach(function(m) {
  Client.prototype[m] = function(path, args, callback) {
    return this.request(path, m, args, callback);
  }
})
