var Utils = require('../utils.js');
var FS = require('fs');

var PHP = module.exports = {
    name: 'php',
    label: 'PHP',
    extension: '.php',
    comment: function(str) { return '// ' + str },
    nulltype: 'null',
};

Utils.initializeLanguage(PHP);

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

PHP.for = function(cond) {
  return "foreach(" + cond.group + ' as $index=>' + cond.iterator + ") {"
}
PHP.rof = function(cond) {
  return "}"
}
PHP.if = function(cond) {
  return "if(" + cond + ") {"
}
PHP.else = function(cond) {
  return '} else {';
}
PHP.fi = function(cond) {
  return "}"
}

PHP.html = {};
var formatForClient = function(func) {
  return function(input) {
    return '<?php ' + func(input) + ' ?>';
  }
}
var toFormat = ['for', 'rof', 'if', 'fi', 'else']
toFormat.forEach(function(f) {
  PHP.html[f] = formatForClient(PHP[f]);
});
PHP.html.variable = function(v) {
  return "<?php echo " + PHP.variable(v) + " ?>";
}
PHP.html.variableJS = function(v) {
  return "<?php echo " + PHP.jsonEncode(PHP.variable(v)) + " ?>"; 
}
PHP.html.variableEscaped = function(v) {
  return "<?php echo htmlspecialchars(" + PHP.variable(v) + ") ?>";
}


PHP.jsonEncode = function(codeStr) {
  return "json_encode(" + codeStr + ")";
}
PHP.concat = function(arr) {
  return arr.join(' . ');
}
PHP.join = function(variable, on) {
  return "implode('" + on + "', " + variable + ")";
}
PHP.returnCode = function(input) {
  var assign = '$result = (object)' + input.ret + ';\n';
  ret = assign + PHP.redirect({redirectPath: input.clientFile + '.php'}) + ";";
  return Utils.addIndent(ret, input.tabs);
}
PHP.userInput = function(input) {
  return '$_POST["' + input.question + '"]';
}
PHP.redirect = function(input) {
  return "require '" + input.redirectPath + "'"
}
