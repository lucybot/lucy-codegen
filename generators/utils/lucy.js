var Path = require('path');
var EJS = require('ejs');

var LUtils = require('../../langs/utils.js');
var AnswerSet = require('./answer-set.js');

var self = null;

var Lucy = function(language, answers) {
  self = this;
  self.resultVars = ['result'];
  self.language = language;
  self.answers = new AnswerSet(answers || {}, self);
  self.actionViewPairs = {};
  self.IncludeCount = 0;
}

module.exports = Lucy;

Lucy.prototype.setResult = function(str) {self.resultVars.unshift(str)};
Lucy.prototype.popResult = function(str) {return self.resultVars.shift()};
Lucy.prototype.result = function() {return self.resultVars[0]};

Lucy.prototype.literal = function(obj) {
  return self.language.literal(obj);
}

Lucy.prototype.variableJS = function(varStr) {
  return self.resolveVariable(varStr, self.language.html.variableJS);
}

Lucy.prototype.variable = function(varStr) {
  return self.resolveVariable(varStr, self.language.html.variable);
}

Lucy.prototype.join = function(toJoin, on) {
  on = on || '';
  return self.language.join(toJoin, on);
}

Lucy.prototype.concat = function(strs) {
  return self.language.concat(strs);
}

Lucy.prototype.nulltype = function() {
  return self.language.nulltype;
}

Lucy.prototype.resolveVariable = function(varStr, varFunc) {
  var lang = self.language;
  if (!varFunc) varFunc = lang.variable;
  if (varStr === 'index') {
    varStr = lang.index || varStr;
    return varFunc(varStr);
  } else if (varStr.indexOf('result.') === 0 || varStr === 'result') {
    varStr = varStr.replace('result', self.result());
    if (lang.result) {
      varStr = lang.result({str: varStr});
    }
    var ret = varFunc(varStr);
    return ret;
  } else if (varStr.indexOf('answers.') === 0) {
    var question = varStr.substring(8);
    var variable = self.answers.getAnswerIfValid(question);
    if (!variable) {
      return lang.nulltype;
    } else if (typeof variable.val !== 'undefined') {
      return lang.literal(variable.val);
    } else if (variable.userInput || variable.serverInput) {
      return LUtils.resolveValue(lang.userInput, {question: question});
    } else {
      return lang.nulltype;
    }
  } else {
    return varFunc(varStr);
  }
}

Lucy.prototype.for = function(iter) {
  iter = LUtils.parseIterator(iter);
  iter.iterator = self.resolveVariable(iter.iterator);
  iter.group = self.resolveVariable(iter.group);
  return self.language.html.for(iter);
}

Lucy.prototype.rof = function(iter) {
  return self.language.html.rof(iter);
}

Lucy.prototype.if = function(cond) {
  cond = LUtils.parseCond(cond);
  cond = LUtils.replaceVars(cond, self.resolveVariable);
  return self.language.html.if(cond);
}

Lucy.prototype.fi = function(cond) {
  return self.language.html.fi(cond);
}

Lucy.prototype.answer = function(question) {
  var variable = self.answers.getAnswerIfValid(question);
  if (!variable) return null;
  return variable.val;
}

Lucy.prototype.include = function(view, options) {
  if (++self.IncludeCount > 15) {
    throw new Error("Include stack exceeded. Did you include something recursively?");
  }
  options = options || {};
  options.loadImmediately = true;
  if (options.data) {
    self.actionViewPairs[options.data.action] = view;
    for (q in options.data.answers) {
      var answer = options.data.answers[q];
      if (typeof answer !== 'object') {
        options.data.answers[q] = self.language.literal(answer);
        answer = {val: answer};
      } else if (answer.variable) {
        options.data.answers[q] = self.resolveVariable(answer.variable, self.language.html.variableJS);
        answer = {serverInput: true}
      }
      self.answers.addAnswer(q, answer);
    }
  }
  return self.language.app.includeView(view, options);
}

Lucy.prototype.returnCode = function(toReturn, tabs) {
  var clientLanguage = self.language.name === 'php' ? 'html-php' : 'html';
  return self.language.returnCode({ret: toReturn, indent: tabs, clientLanguage: clientLanguage});
}

Lucy.prototype.form = function(options) {
  options.vars = options.vars || [];
  var form = self.language.startForm(options);
  options.vars.forEach(function(input) {
    self.answers.addAnswer(input, {serverInput: true});
  });
  return LUtils.addIndent(form, options.indent);
}

Lucy.prototype.mrof = function(options) {
  return self.language.endForm(options)
}

Lucy.prototype.request = function(options) {
  var lang = self.language;
  options.protocol = options.protocol || 'https';
  options.method = options.method || 'get';
  options.path = options.path || '/';
  options.baseUrl = options.protocol + '://' + options.domain;
  options.returns = options.returns || 'json';
  if (options.port) {
    options.baseUrl += ':' + options.port;
  }
  if (typeof options.path === 'string') {
    if (options.path.indexOf('/') !== 0) options.path = '/' + options.path;
    options.baseUrl += options.path;
    options.baseUrl = lang.literal(options.baseUrl);
  } else {
    options.path = self.answers.resolveAnswer(options.path);
    options.baseUrl = lang.concat([lang.literal(options.baseUrl + '/'), options.path]);
  }

  self.answers.resolveAnswers(options.query);
  self.answers.resolveAnswers(options.headers);
  self.answers.resolveAnswers(options.body);
  if (options.query && Object.keys(options.query).length === 0) {
    delete options.query;
  } else {
    options.query = self.language.literal(options.query, 0, true);
  }
  if (options.body && typeof(options.body) === 'string' && Object.keys(options.body).length === 0) {
    delete options.body;
  } else {
    options.body = self.language.literal(options.body, 0, true);
  }
  if (options.headers && Object.keys(options.headers).length === 0) {
    delete options.headers;
  } else {
    options.headers = self.language.literal(options.headers, 0, true);
  }
  return EJS.render(lang.templates.request, {
      req: options,
      shift: LUtils.shift,
      returnCode: self.returnCode
  });
}

Lucy.prototype.formItem = function(formId, name) {
  return self.language.formItem({formId: formId, name: name});
}

Lucy.prototype.code = {
  if: Lucy.prototype.if,
  fi: Lucy.prototype.fi,
  for: Lucy.prototype.for,
  rof: Lucy.prototype.rof,
  join: Lucy.prototype.join,
  concat: Lucy.prototype.concat,
  variable: Lucy.prototype.variable,
  variableJS: Lucy.prototype.variableJS,
  form: Lucy.prototype.form,
  request: Lucy.prototype.request,
  returnCode: Lucy.prototype.returnCode,
}
