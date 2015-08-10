var Utils = require('../utils.js');
var FS = require('fs');
var EJS = require('ejs');

var PHP = {
    name: 'php',
    label: 'PHP',
    extension: '.php',
    comment: function(str) { return '// ' + str },
    nulltype: 'null',
};

module.exports = PHP;

var readTmpl = Utils.readTmplFunc(__dirname, '.php');

PHP.concat = function(arr) {
  return arr.join(' . ');
}

PHP.join = function(variable, on) {
  return "implode('" + on + "', " + variable + ")";
}

PHP.returnCode = function(input) {
  var ret = '';
  if (input.clientLanguage === 'html-php') {
    var assign = '$result = (object)' + input.ret + ';\n';
    ret = assign + PHP.redirect({redirectPath: input.clientFile + input.clientExtension}) + ";";
  } else {
    ret = 'echo json_encode(' + input.ret + ');';
  }
  return Utils.addIndent(ret, input.tabs);
}

PHP.userInput = function(input) {
  return '$_POST["' + input.question + '"]';
}

PHP.request = {
  template: readTmpl('request')
}

PHP.redirect = function(input) {
  return "require '" + input.redirectPath + "'"
}

PHP.literal = function(v, numSpaces, shallow) {
  numSpaces = numSpaces || 0;
  var spaces = Array(numSpaces + 1).join(' ');
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return JSON.stringify(v);
  } else if (typeof v === 'object') {
    var start = 'array(\n';
    var end = spaces + ')';
    var keys = Object.keys(v);
    return start +
        keys.map(function(key, idx) {
          var itemStart = spaces + "  ";
          if (Array.isArray(v)) {
            itemStart += key + ' => ';
          } else {
            itemStart += '"' + key + '" => '
          }
          var itemEnd = idx === keys.length - 1 ? '\n' : ',\n';
          return itemStart + (shallow ? v[key] : PHP.literal(v[key], numSpaces + 2)) + itemEnd;
        }).join('') + end;
  }
}

PHP.variable = function(v) {
  return "$" + v.replace(/\./g, '->');
}
PHP.displayVariable = function(v) {
  return "<?php echo " + PHP.variable(v) + " ?>";
}
PHP.variableJS = function(v) {
  return "<?php echo " + PHP.jsonEncode(PHP.variable(v)) + " ?>"; 
}

PHP.for = function(cond) {
  return "<?php foreach(" + cond.group + ' as $index=>' + cond.iterator + ") { ?>"
}
PHP.rof = function(cond) {
  return "<?php } ?>"
}
PHP.if = function(cond) {
  return "<?php if(" + cond + ") { ?>"
}
PHP.fi = function(cond) {
  return "<?php } ?>"
}

PHP.jsonEncode = function(codeStr) {
  return "json_encode(" + codeStr + ")";
}

PHP.app = {
  viewTmpl: FS.readFileSync(__dirname + '/app/repeated/view.php', 'utf8'),
  actionTmpl: FS.readFileSync(__dirname + '/app/repeated/action.php', 'utf8'),
  staticTmpl: FS.readdirSync(__dirname + '/app/static').map(function(file) {
    return {filename: file, tmpl: FS.readFileSync(__dirname + '/app/static/' + file, 'utf8')}
  }),
  includeTmpl: FS.readFileSync(__dirname + '/app/repeated/include.php', 'utf8'),
  includeView: function(view, options) {
    var code = '';
    if (options.data) {
      code = EJS.render(PHP.app.includeTmpl, {view: view, options: options});
    } else {
      code += '<?php\n'
      if (options.result) code += '  $result = $' + options.result + ';\n'
      code += '  require "' + view + '.php";\n';
      code += '?>'
    }
    return Utils.shift(code, options.indent);
  }
};
PHP.app.build = function(input, lucy, callback) {
  var files = [];
  var ejsInput = {
    Lucy: lucy,
    input: input,
    shift: Utils.shift,
  }
  input.actions.forEach(function(action, index) {
    ejsInput.actionIdx = index;
    var actionFile = {
      filename: action.name + '.php',
      contents: EJS.render(PHP.app.actionTmpl, ejsInput),
      snippets: {},
    };
    actionFile.snippets[action.name] = action.code;
    if (input.setup) actionFile.snippets.setup = input.setup.code;
    files.push(actionFile);
  });
  delete ejsInput.actionInput;
  input.views.forEach(function(view, index) {
    ejsInput.viewIdx = index;
    var viewFile = {
      filename: view.name + '.php',
      contents: EJS.render(PHP.app.viewTmpl, ejsInput),
      snippets: {},
    }
    viewFile.snippets[view.name] = view.code;
    files.push(viewFile);
  });
  delete ejsInput.viewIdx;
  for (filename in input.staticFiles) {
    var staticFile = {
      filename: filename + '.php',
      contents: EJS.render(input.staticFiles[filename], ejsInput),
      snippets: {}
    }
    files.push(staticFile);
  }
  PHP.app.staticTmpl.forEach(function(file) {
    var staticFile = {
      filename: file.filename,
      contents: EJS.render(file.tmpl, ejsInput),
      snippets: {},
    };
    files.push(staticFile);
  })
  callback(null, files);
}
