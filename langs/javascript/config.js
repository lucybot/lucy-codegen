var FS = require('fs');
var Render = require('ejs').render;

var Utils = require('../utils.js');

var readTmpl = Utils.readTmplFunc(__dirname, '.js');

var JS = module.exports = {
    name: 'javascript',
    label: 'JavaScript',
    extension: '.js',
}

JS.comment = function(str) { return '// ' + str }
JS.nulltype = 'null'
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

JS.returnCode = function(input) {
  return Utils.addIndent('callback(' + input.ret + ')', input.tabs);
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

JS.for = function(iter) {
  return '<% ' + iter.group + '.forEach(function(' + iter.iterator + ', index) { %>';
}
JS.rof = function(iter) {
  return '<% }); %>'
}
JS.if = function(cond) {
  return '<% if(' + cond +') { %>'
}
JS.fi = function(cond) {
  return '<% } %>'
}

JS.variable = function(v) {
  return v;
}
JS.displayVariable = function(v) {
  return "<%= " + v + " %>";
}
JS.variableJS = JS.variable;

JS.userInput = function(input) {
  return "request." + input.question;
}

JS.request = {
  template: readTmpl('request')
}

JS.app = {
  pageTmpl: FS.readFileSync(__dirname + '/app/static/index.html', 'utf8'),
  includeTmpl: FS.readFileSync(__dirname + '/app/repeated/include.html', 'utf8'),
  includeView: function(view, options) {
    var code = Render(JS.app.includeTmpl, {view: view, options: options});
    return Utils.shift(code, options.indent);
  }
}

JS.app.build = function(input, lucy, callback) {
  var serverActions = input.actions.filter(function(a) {return a.forceServer});
  input.actions = input.actions.filter(function(a) {return !a.forceServer})
  var index = {
    filename: 'index.html',
    contents: Render(JS.app.pageTmpl, {input: input, Lucy: lucy, shift: Utils.shift}),
    snippets: {},
  }
  var files = [index];
  var setupSnippet = '';
  if (input.setup) setupSnippet += input.setup.code
  if (input.viewSetup) setupSnippet += input.viewSetup.code;
  if (setupSnippet) index.snippets.setup = setupSnippet;
  input.actions.forEach(function(action) {
    index.snippets[action.name] = action.code;
  });
  input.views.forEach(function(view) {
    index.snippets[view.name] = view.code;
  });
  serverActions.forEach(function(action) {
    var actionFile = {
      filename: action.name + '.php',
      contents: action.code,
      snippets: {}
    };
    actionFile.snippets[action.name] = action.code;
    files.push(actionFile);
  })
  callback(null, files);
}
