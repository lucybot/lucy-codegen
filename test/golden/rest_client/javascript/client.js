(function() {
  var Swagger = {"swagger":"2.0","host":"localhost:3333","basePath":"/","info":{"title":"Pet Store"},"paths":{"/pets":{"get":{"responses":{"200":{"description":"OK"}}}}}}
  var matchSwaggerPath = function(path) {
    for (var templatedPath in Swagger.paths) {
      var regex = new RegExp(templatedPath.replace(/{\w+}/g, '\\w+'));
      if (path.match(regex)) return templatedPath;
    }
  }
  var Client = window.PetStoreClient = function(options) {
    options = options || {};
    this.host = options.host || Swagger.host;
    this.auth = options.auth || {};
    this.protocol = (Swagger.schemes || []).indexOf('https') === -1 ? 'http' : 'https';
  }

  var initRequestFromSwagger = function() {
    return function(args) {
      var request = {
        url: this.protocol + '://' + this.host + (Swagger.basePath === '/' ? '' : Swagger.basePath),
        data: {},
        headers: {},
      };
      for (var def in Swagger.securityDefinitions) {
        def = Swagger.securityDefinitions[def];
        if (def.type === 'basic') {
          request.headers.Authorization = 'Basic ' + this.auth.authorization;
        } else if (def.type === 'apiKey') {
          this.addParam(request, def, this.auth);
        } else if (def.type === 'oauth2' && def.flow === 'implicit') {
          request.data.access_token = args.oauth_token;
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
        request.data[param.name] = args[param.name];
      } else if (param.in === 'header') {
        request.headers[param.name] = args[param.name];
      } else if (param.in === 'path') {
        request.url = request.url.replace('{' + param.name + '}', args[param.name]);
      } else if (param.in === 'formData') {
        request.data[param.name] = args[param.name];
      } else if (param.in === 'body') {
        request.headers['Content-Type'] = 'application/json';
        request.data = JSON.stringify(args[param.name]);
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
    return $.ajax(request);
  }

  var METHODS = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch'];
  METHODS.forEach(function(m) {
    Client.prototype[m] = function(path, args, callback) {
      return this.request(path, m, args, callback);
    }
  })
})();
