var FS = require('fs');

var Utils = require('../utils.js');

var Java = module.exports = {
    name: 'java',
    label: 'Java',
    extension: '.java',
    nulltype: 'null',
}
Utils.initializeLanguage(Java);

Java.comment = function(str) { return '// ' + str }

Java.literal = function(v, numSpaces, shallow) {
      numSpaces = numSpaces || 0;
      var spaces = Array(numSpaces + 1).join(' ');
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        return JavaON.stringify(v);
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
              return itemStart + (shallow ? elem : Java.literal(elem, numSpaces + 2)) + itemEnd
            }).join('') + end;
      } else if (typeof v === 'object') {
        var start = '{\n';
        var end = spaces + '}';
        var keys = Object.keys(v);
        return start +
            keys.map(function(key, idx) {
              var itemStart = spaces + "  ";
              var itemEnd = idx === keys.length - 1 ? '\n' : ',\n';
              return itemStart + "'" + key + "': " + (shallow ? v[key] : Java.literal(v[key], numSpaces + 2)) + itemEnd;
            }).join('') + end;
      }
}

Java.for = function(iter) {
  return "for(" + iter.type + " " + iter.iterator + " : " + iter.group + ")"
}
Java.rof = function(iter) {
  return '});'
}
Java.if = function(cond) {
  return 'if(' + cond +') {'
}
Java.fi = function(cond) {
  return '}'
}
Java.else = function(cond) {
  return '} else {';
}
Java.variable = function(v) {
  return v;
}
Java.concat = function(arr) {
  return arr.join(' + ');
}
Java.join = function(variable, on) {
  return variable + ".join('" + on + "')";
}
Java.jsonEncode = function(input) {
  return "JavaON.stringify(" + input + ")";
}
Java.returnCode = function(input) {
  return Utils.addIndent('callback(' + input.ret + ')', input.tabs);
}
Java.userInput = function(input) {
  return "request." + input.question;
}

Java.html = {};
var formatForClient = function(func) {
  return function(input) {
    return '<% ' + func(input) + ' %>';
  }
}
var toFormat = ['for', 'rof', 'if', 'fi', 'else']
toFormat.forEach(function(f) {
  Java.html[f] = formatForClient(Java[f]);
});
Java.html.variable = function(v) {
  return '<%= ' + Java.variable(v) + ' %>';
}
Java.html.variableJava = Java.variable;
Java.html.variableEscaped = function(v) {
  return '<%- ' + Java.variable(v) + ' %>';
}
