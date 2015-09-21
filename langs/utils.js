var Path = require('path');
var FS = require('fs');
var EJS = require('ejs');

var Utils = {};
module.exports = Utils;

var RESERVED_WORDS = ['in'];

var isValidBoundary = function(c) {
  return !c || c == ' ' || c == '!';
}

Utils.parseIterator = function(str) {
  var parts = str.split(' in ');
  return {iterator: parts[0], group: parts[1]}
}

Utils.parseCond = function(str) {
  return str;
}

Utils.camelCase = function(input) {
  var ret = input.replace(/([A-Z]{2})/g, function(m, g) {return g.toLowerCase()})
         .replace(/^([\w])/, function(m, g) {return g.toLowerCase()})
         .replace(/[^\w\s-]/g, '')
         .replace(/[-\s]+(.)/g, function(match, group1) {return group1.toUpperCase()});
  return ret;
}

Utils.formatVariable = function(str, funcs) {
  var pieces = str.split('.');
  var ret = '';
  for (var i = 0; i < pieces.length; ++i) {
    var arrayMatch = pieces[i].match(/(.?\w+)(\[(\d+)\])?/);
    if (!ret) ret += funcs.varName(arrayMatch[1]);
    else ret = funcs.hashIndex(ret, arrayMatch[1]);
    if (arrayMatch[3]) {
      ret = funcs.arrayIndex(ret, parseInt(arrayMatch[3]));
    }
  }
  return ret;
}

Utils.replaceVars = function(str, varFunc) {
  return str.replace(/(.)?\b([A-Za-z]\w*(\.\w+)*)\b(.)?/g, function(match, group1, group2, group3, group4) {
    //console.log('match m:<' + match + '> 1:<' + group1 + '> 2:<' + group2 + '> 3:<' + group3 + '> 4:<' + group4 + '>');
    if (RESERVED_WORDS.indexOf(group2) !== -1) {
      return match;
    }
    if (!isValidBoundary(group1) || !isValidBoundary(group4)) {
      return match;
    }
    var ret = varFunc(group2);
    if (group1) ret = group1 + ret;
    if (group4) ret += group4;
    return ret;
  })
}

Utils.addIndent = function(code, numSpaces) {
  if (!numSpaces) return code;
  var lines = code.split('\n');
  var spaces = Array(Math.abs(numSpaces) + 1).join(' ');
  if (numSpaces > 0) {
    return lines.map(function(l) {return l ? spaces + l : l}).join('\n');
  } else {
    return lines.map(function(l) {
      if (l.indexOf(spaces) === 0) return l.substring(spaces.length);
      else return l;
    }).join('\n');
  }
}

Utils.shift = function(code, numSpaces) {
  if (!numSpaces) return code;
  var lines = code.split('\n');
  var spaces = Array(numSpaces + 1).join(' ');
  return lines.map(function(l, idx) {return (l && idx > 0) ? spaces + l : l}).join('\n');
}

Utils.resolveValue = function(field, inputs) {
  if (typeof field === 'undefined') return '';
  if (typeof field === 'function') return field(inputs);
  else if (typeof field === 'string') return field;
  else if (field.template) {
    inputs.addIndent = Utils.addIndent;
    return EJS.render(field.template, inputs);
  }
  else return '';
}

Utils.setRequestDefaults = function(params) {
  params.protocol = params.protocol || 'http';
  params.method = params.method || 'get';
  params.path = params.path || '/';
  params.baseUrl = '';
  if (!params.relative) {
    params.baseUrl = params.protocol + "://" + params.domain;
    if (params.port) {
      params.baseUrl += ':' + params.port;
    }
  }
  if (params.path.indexOf('/') !== 0) {
    params.path = '/' + params.path;
  }
  params.baseUrl += params.path;
}

Utils.getRequestLiterals = function(params, lang) {
  var contentType = params.contentType || (params.headers ? params.headers['Content-Type'] : '') || '';
  if (!contentType && typeof params.body === 'object') {
    contentType = 'application/json';
  }
  if (contentType) {
    params.headers = params.headers || {};
    params.headers['Content-Type'] = contentType;
  }
  var code = Utils.getKeysAsLiterals(params, ['baseUrl', 'path', 'query', 'headers', 'body'], lang)
  code.contentType = contentType;
  code.protocol = params.protocol;
  code.method = params.method;
  code.returns = params.returns;
  return code;
}

Utils.getKeysAsLiterals = function(obj, keys, lang) {
  if (!obj) return null;
  keys = keys || Object.keys(obj);
  var code = {};
  keys.forEach(function(key) {
    code[key] = lang.literal(obj[key]);
  })
  return code;
}

Utils.addTemplates = function(templates, dir) {
  FS.readdirSync(dir).forEach(function(f) {
    var extLoc = f.indexOf('.');
    if (extLoc === -1) extLoc = f.length;
    var name = f.substring(0, extLoc);
    templates[name] = FS.readFileSync(Path.join(dir, f), 'utf8');
  });
}

Utils.initializeLanguage = function(language) {
  language.templates = language.templates || {};
  var dir = Path.join(__dirname, language.name, 'tmpl');
  Utils.addTemplates(language.templates, dir);

  language.options = language.options || {};
  language.setOptions = function(opts) {
    opts = opts || {};
    for (key in language.options) {
      if (opts[key] !== undefined) language.options[key].value = opts[key];
      else language.options[key].value = language.options[key].default;
    }
  }
  language.setOptions();

  language.app = require('./' + language.name + '/app/app.js');
}

Utils.initializeApp = function(app, dir) {
  app.templates = app.templates || {};
  Utils.addTemplates(app.templates, Path.join(dir, 'tmpl'));

  var addCopyFiles = function(baseDir, subDir) {
    app.copyFiles = app.copyFiles || [];
    subDir = subDir || '';
    var workingDir = Path.join(baseDir, subDir);
    var files = FS.readdirSync(workingDir);
    files.forEach(function(f) {
      var filename = Path.join(subDir, f);
      if (FS.statSync(Path.join(baseDir, filename)).isDirectory()) {
        app.copyFiles.push({filename: filename, directory: true});
        addCopyFiles(baseDir, filename);
      } else {
        app.copyFiles.push({
          filename: filename,
          contents: FS.readFileSync(Path.join(baseDir, filename), 'utf8'),
          hidden: true,
        });
      }
    });
  }

  var copyDir = Path.join(dir, 'copy');
  if (FS.existsSync(copyDir)) addCopyFiles(copyDir);
}
