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
  var ret;
  if (input.clientLanguage === 'html-erb') {
    ret = input.ret === '@result' ? '' : '@result = ' + input.ret + '\n'
    ret += 'render "' + input.clientFile + '"';
  } else {
    ret = "render :json => " + input.ret;
  }
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
      return varName + '["' + key + '"]';
    }
  })
}

Ruby.cond = function(cond) {
  return cond;
}

Ruby.for = function(cond) {
  return cond.group + ".each_index do | index | " + cond.iterator + " = " + cond.group + "[index]"
}

Ruby.rof = function(cond) {
  return "end";
}

Ruby.if = function(cond) {
  return "if " + Ruby.cond(cond);
}

Ruby.fi = function(cond) {
  return "end"
}

Ruby.jsonEncode = function(codeStr) {
  return codeStr + ".to_json";
}
