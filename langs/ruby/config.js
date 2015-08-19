var Path = require('path');
var FS = require('fs');
var EJS = require('ejs');
var Utils = require('../utils.js');
var readTmpl = Utils.readTmplFunc(__dirname, '.rb');

var Ruby = module.exports = {
    name: 'ruby',
    label: 'Ruby',
    extension: '.rb',
    comment: function(str) {return '# ' + str},
    nulltype: 'nil',
};

Ruby.concat = function(arr) {
  return arr.join(' + ');
}

Ruby.join = function(variable, on) {
  return variable + ".join('" + on + "')";
}

Ruby.returnCode = function(input) {
  var ret = 'render :template => "main/' + Ruby.app.getPartialFromViewName(input.clientFile) + '", :locals => {:result => ' + input.ret + '}';
  return Utils.addIndent(ret, input.tabs);
}

Ruby.userInput = function(input) {
  return 'request[:' + input.question + ']';
}

Ruby.request = {
  template: readTmpl('request')
}

Ruby.literal = function(v, numSpaces, shallow) {
  numSpaces = numSpaces || 0;
  var spaces = Array(numSpaces + 1).join(' ');
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return JSON.stringify(v);
  } else if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    var start = typeof v[0] === 'object' ? '[' : '[\n';
    var end = typeof v[v.length - 1] == 'object' ? ']' : '\n' + spaces + ']';
    return start +
        v.map(function(elem, idx) {
          var itemStart = typeof(elem) === 'object' ? '' : spaces + '  ';
          var itemEnd = '';
          if (idx + 1 < v.length) {
            itemEnd = ',';
            if (typeof v[idx+1] !== 'object') {
              itemEnd += '\n'
            } else {
              itemEnd += ' ';
            }
          }
          return itemStart + (shallow ? elem : Ruby.literal(elem, numSpaces + 2)) + itemEnd
        }).join('') + end;
  } else if (typeof v === 'object') {
    var start = '{\n';
    var end = spaces + '}';
    var keys = Object.keys(v);
    return start +
        keys.map(function(key, idx) {
          var itemStart = spaces + "  ";
          var itemEnd = idx === keys.length - 1 ? '\n' : ',\n';
          return itemStart + '"' + key + '" => ' + (shallow ? v[key] : Ruby.literal(v[key], numSpaces + 2)) + itemEnd;
        }).join('') + end;
  }
}

Ruby.variable = function(v) {
  return Utils.formatVariable(v, {
    varName: function(str) {
      return str;
    },
    arrayIndex: function(varName, num) {
      return varName + '[' + num + ']';
    },
    hashIndex: function(varName, key) {
      return varName + '.' + key;
    }
  })
}
Ruby.displayVariable = function(v) {
  return "<%= " + Ruby.variable(v) + " %>";
}
Ruby.variableJS = function(v) {
  return "<%== " + Ruby.jsonEncode(Ruby.variable(v)) + " %>"; 
}

Ruby.cond = function(cond) {
  return cond;
}

Ruby.for = function(cond) {
  return '<% ' + cond.group + ".each_index do | index | " + cond.iterator + " = " + cond.group + ".fetch(index)" + ' %>'
}

Ruby.rof = function(cond) {
  return '<% end %>';
}

Ruby.if = function(cond) {
  return '<% if ' + Ruby.cond(cond) + ' %>';
}

Ruby.fi = function(cond) {
  return '<% end %>';
}

Ruby.jsonEncode = function(codeStr) {
  return codeStr + ".to_json";
}

Ruby.app = {
  copyFiles: [],
  routesTmpl: readTmpl('../app/static/routes'),
  controllerTmpl: readTmpl('../app/static/main_controller'),
  indexTmpl: FS.readFileSync(__dirname + '/app/static/index.html', 'utf8'),
  includeTmpl: FS.readFileSync(__dirname + '/app/repeated/include.html', 'utf8'),
  gemfile: FS.readFileSync(__dirname + '/app/static/Gemfile', 'utf8'),
  getPartialFromViewName: function(v) {
    return v.replace(/[A-Z][a-z]/g, function(whole) {
      return '_' + whole.toLowerCase();
    });
  },
  includeView: function(view, options) {
    var code = ''
    if (options.data) {
      code = EJS.render(Ruby.app.includeTmpl, {view: view, options: options});
    } else {
      var resultStr = options.result ? ', :result => ' + options.result : '';
      code += '<%= render "' + Ruby.app.getPartialFromViewName(view).substring(1) + '.html.erb"' + resultStr + ' %>';
    }
    return Utils.shift(code, options.indent);
  }
}

var addCopyFiles = function(baseDir, subDir) {
  subDir = subDir || '';
  var workingDir = Path.join(baseDir, subDir);
  var files = FS.readdirSync(workingDir);
  files.forEach(function(f) {
    var filename = Path.join(subDir, f);
    if (FS.statSync(Path.join(baseDir, filename)).isDirectory()) {
      Ruby.app.copyFiles.push({filename: filename, directory: true});
      addCopyFiles(baseDir, filename);
    } else {
      Ruby.app.copyFiles.push({
        filename: filename,
        contents: FS.readFileSync(Path.join(baseDir, filename), 'utf8'),
        hidden: true,
      });
    }
  });
}

addCopyFiles(__dirname + '/app/copy');

Ruby.app.build = function(input, lucy, callback) {
  var files = JSON.parse(JSON.stringify(Ruby.app.copyFiles));
  var ejsInput = {
    Lucy: lucy,
    input: input,
    shift: Utils.shift,
  }
  var controllerFile = {
    contents: EJS.render(Ruby.app.controllerTmpl, ejsInput),
    filename: 'app/controllers/main_controller.rb',
    snippets: {},
  }
  input.actions.forEach(function(a) {
    controllerFile.snippets[a.name] = a.code;
  });
  if (input.setup) controllerFile.snippets.setup = input.setup.code;
  files.push(controllerFile);

  files.push({
    filename: 'app/views/main',
    directory: true,
  })
  input.views.forEach(function(v) {
    var partialName = Ruby.app.getPartialFromViewName(v.name);
    var viewFile = {
      filename: 'app/views/main/' + partialName + '.html.erb',
      contents: v.code,
      snippets: {},
    };
    viewFile.snippets[v.name] = v.code;
    files.push(viewFile);
  });

  var routeFile = {
    contents: EJS.render(Ruby.app.routesTmpl, ejsInput),
    filename: 'config/routes.rb'
  }
  files.push(routeFile);

  var index = {
    contents: EJS.render(Ruby.app.indexTmpl, ejsInput),
    filename: 'app/views/main/index.html.erb',
  };
  files.push(index);

  var gemfile = {
    contents: EJS.render(Ruby.app.gemfile, ejsInput),
    filename: 'Gemfile',
    hidden: true,
  }
  files.push(gemfile);

  callback(null, files);
}
