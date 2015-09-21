var FS = require('fs');

var Utils = require('../utils.js');

var JS = module.exports = {
    name: 'javascript',
    label: 'JavaScript',
    extension: '.js',
    nulltype: 'null',
}
Utils.initializeLanguage(JS);

JS.comment = function(str) { return '// ' + str }

JS.literal = function(v, numSpaces, shallow) {
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
              return itemStart + (shallow ? elem : JS.literal(elem, numSpaces + 2)) + itemEnd
            }).join('') + end;
      } else if (typeof v === 'object') {
        var start = '{\n';
        var end = spaces + '}';
        var keys = Object.keys(v);
        return start +
            keys.map(function(key, idx) {
              var itemStart = spaces + "  ";
              var itemEnd = idx === keys.length - 1 ? '\n' : ',\n';
              return itemStart + "'" + key + "': " + (shallow ? v[key] : JS.literal(v[key], numSpaces + 2)) + itemEnd;
            }).join('') + end;
      }
}

JS.for = function(iter) {
  return iter.group + '.forEach(function(' + iter.iterator + ', index) {';
}
JS.rof = function(iter) {
  return '});'
}
JS.if = function(cond) {
  return 'if(' + cond +') {'
}
JS.fi = function(cond) {
  return '}'
}
JS.else = function(cond) {
  return '} else {';
}
JS.variable = function(v) {
  return v;
}
JS.concat = function(arr) {
  return arr.join(' + ');
}
JS.join = function(variable, on) {
  return variable + ".join('" + on + "')";
}
JS.jsonEncode = function(input) {
  return "JSON.stringify(" + input + ")";
}
JS.returnCode = function(input) {
  return Utils.addIndent('callback(' + input.ret + ')', input.tabs);
}
JS.userInput = function(input) {
  return "request." + input.question;
}

JS.html = {};
var formatForClient = function(func) {
  return function(input) {
    return '<% ' + func(input) + ' %>';
  }
}
var toFormat = ['for', 'rof', 'if', 'fi', 'else']
toFormat.forEach(function(f) {
  JS.html[f] = formatForClient(JS[f]);
});
JS.html.variable = function(v) {
  return '<%= ' + JS.variable(v) + ' %>';
}
JS.html.variableJS = JS.variable;
JS.html.variableEscaped = function(v) {
  return '<%- ' + JS.variable(v) + ' %>';
}
