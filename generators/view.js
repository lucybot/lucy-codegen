var View = module.exports = {};

var Beautify = require('js-beautify');
var Utils = require('../langs/utils.js');
var HTMLParser = require('htmlparser2');
var ParseJS = require('jsonic');

// Note: [\s\S] is used inplace of '.' because JS won't match \n to '.'
var ESCAPE_REGEX =  /{{{([\s\S]*?)}}}/g;
var VARIABLE_REGEX = /{{([\s\S]*?)}}/g;

var parseOptions = function(attrs) {
  var options = {};
  if (attrs.resultvar) {
    options.result = attrs.resultvar;
  }
  if (attrs.result) {
    options.data = options.data || {};
    options.data.result = options.data.result || {};
    var resultObj = ParseJS(unquote(attrs.result));
    for (key in resultObj) {
      options.data.result[key] = resultObj[key];
    }
  }
  if (attrs.action) {
    options.data = options.data || {};
    options.data.action = attrs.action.replace(/\W/g, '');
  }
  if (attrs.view) {
    options.view = attrs.view.replace(/\W/g, '');
  }
  if (attrs.inputs) {
    options.data = options.data || {};
    options.data.answers = options.data.answers || {};
    var inputObj = ParseJS(unquote(attrs.inputs));
    for (key in inputObj) {
      options.data.answers[key] = inputObj[key];
    }
  }
  if (attrs.inputvars) {
    options.data = options.data || {};
    options.data.answers = options.data.answers || {};
    var inputObj = ParseJS(unquote(attrs.inputvars));
    for (key in inputObj) {
      options.data.answers[key] = {variable: inputObj[key]};
    }
  }
  if (attrs.indent) {
    options.indent = parseInt(attrs.indent);
  }
  return options;
}

var EJS = {};
EJS.tag = function(attrs, contents) {
  if ('for' in attrs) {
    return EJS.for(attrs) + contents + EJS.rof();
  } else if ('condition' in attrs) {
    return '';
  } else if ('if' in attrs) {
    return EJS.if(attrs) + contents + EJS.fi();
  } else if ('else' in attrs) {
    return EJS.else(attrs) + contents;
  } else if ('include' in attrs) {
    return EJS.include(attrs);
  } else if ('form' in attrs) {
    return EJS.form(attrs) + contents + EJS.mrof(attrs);
  } else if ('button' in attrs) {
    return EJS.button(attrs);
  } else {
    throw new Error("<lucy> tag must have attribute if, for, or include")
  }
}
EJS.variable = function(variable) {
  return '<%- Lucy.variableHTML("' + variable.trim() + '") %>';
}
EJS.escapeVariable = function(variable) {
  return '<%- Lucy.variableHTMLEscaped("' + variable.trim() + '") %>';
}
EJS.for = function(attrs) {
  return '<%- Lucy.for("' + attrs.for.trim() + ' in ' + attrs.in.trim() + '") %>';
}
EJS.rof = function() { return "<%- Lucy.rof() %>" }
EJS.if = function(attrs) {
  return '<%- Lucy.if("' + attrs.if.trim() + '") %>'
}
EJS.fi = function() { return "<%- Lucy.fi() %>" }
EJS.else = function(attrs) {
  return '<%- Lucy.else("' + attrs.else.trim() + '") %>'
}

EJS.button = function(attrs) {
  var opts = parseOptions(attrs);
  opts.button = attrs.button;
  opts.type = attrs.type;
  return '<%- Lucy.button(' + JSON.stringify(opts) + ') %>';
}

var getFormInput = function(attrs) {
  var input = {
    action: attrs.form.trim(),
    vars: attrs.vars.split(',').map(function(v) {return v.trim()}),
  }
  return JSON.stringify(input);
}
EJS.form = function(attrs) {
  return "<%- Lucy.form(" + getFormInput(attrs) + ") %>"
}
EJS.mrof = function(attrs) {
  return "<%- Lucy.mrof(" + getFormInput(attrs) + ") %>"  
}

var unquote = function(str) { return str.replace(/\\"/g, '"'); }

EJS.include = function(attrs) {
  var ejs = '<%- Lucy.include("' + attrs.include.trim().replace(/\W/g, '') + '"';
  var useOptions = attrs.result || attrs.resultvar || attrs.action || attrs.inputs || attrs.inputvars;
  var options = parseOptions(attrs);
  if (Object.keys(options).length > 0) ejs += ', ' + JSON.stringify(options);
  ejs += ') %>';
  return ejs;
}

View.translateToEJS = function(ltml, callback) {
  var ejs = '';
  var lucyTags = [];
  var addContent = function(text) {
    if (lucyTags.length === 0) ejs += text;
    else lucyTags[lucyTags.length - 1].$content += text;
  }
  var removeContent = function(text) {
    if (lucyTags.length === 0) {
      if (ejs.lastIndexOf(text) === ejs.length - text.length) {
        ejs = ejs.substring(0, ejs.length - text.length);
      }
    } else {
      var tag = lucyTags[lucyTags.length - 1];
      if (tag.$content.lastIndexOf(text) === (tag.$content.length - text.length)) {
        tag.$content =  tag.$content.substring(0, tag.$content.length - text.length);
      }
    }
  }
  var parser = new HTMLParser.Parser({
      onopentag: function(name, attrs){
        if (name === 'lucy') {
          attrs.$content = '';
          lucyTags.push(attrs);
        } else {
          var content = '<' + name;
          for (attr in attrs) {
            content += ' ' + attr + '="' + attrs[attr] + '"';
          }
          content += '>';
          addContent(content)
        }
      },
      ontext: function(text) {
        addContent(text);
      },
      onclosetag: function(name){
        if (name === 'lucy') {
          var attrs = lucyTags.pop();
          var tag = EJS.tag(attrs, attrs.$content);
          if ('else' in attrs) {
            if (tag.match(/\n\s*$/)) tag = tag.substring(0, tag.lastIndexOf('\n'));
            tag = Utils.addIndent(tag, -2);
            removeContent('  ');
          }
          addContent(tag);
        } else {
          addContent('</' + name + '>')
        }
      }
  }, {decodeEntities: true});
  ltml = Beautify.html(ltml, {indent_size: 2, unformatted: ['script']});
  parser.write(ltml);

  ejs = ejs
  .replace(ESCAPE_REGEX, function(whole, variable) {
    return EJS.escapeVariable(variable);
  })
  .replace(VARIABLE_REGEX, function(whole, variable) {
    return EJS.variable(variable);
  });
  parser.end();
  if (callback) callback(null, ejs);
}

