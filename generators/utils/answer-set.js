var US = require('underscore');

var LUtils = require('../../langs/utils.js');

var VAR_KEYS_ONE_OF = [
  'userInput', 'serverInput', 'val'
]

var self = null;

var AnswerSet = function(answers, helper) {
  self = this;
  self.answers = answers;
  self.helper = helper;
}
module.exports = AnswerSet;

AnswerSet.prototype.getAnswerIfValid = function(question) {
  var variable = self.answers[question];
  if (!variable) return null;
  if (US.intersection(Object.keys(variable), VAR_KEYS_ONE_OF).length !== 1) {
    return null;
  }
  return variable;
}

AnswerSet.prototype.addAnswer = function(question, answer) {
  self.answers[question] = answer;
}

AnswerSet.prototype.getUserInputs = function() {
  var ret = [];
  for (var answer in self.answers) {
    if (self.answers[answer].userInput) {
      ret.push(answer);
    }
  }
  return ret;
}

AnswerSet.prototype.resolveAnswers = function(data) {
  if (!data) return;
  for (var key in data) {
    var val = data[key];
    var ans = self.resolveAnswer(val);
    if (ans === null) {
      delete data[key];
    } else {
      data[key] = ans;
    }
  }
}

AnswerSet.prototype.resolveAnswer = function(val) {
  if (val === null) return null;
  if (typeof val === 'object') {
    if (val.answer) {
      var answer = self.getAnswerIfValid(val.answer);
      if (answer) {
        return self.helper.variable('answers.' + val.answer);
      } else {
        return null;
      }
    } else if (val.join && Array.isArray(val.join)) {
      return self.helper.concat(val.join.map(function(v) {
        v = self.resolveAnswer(v);
        return v === null ? self.helper.nulltype() : v
      }));
    } else if (val.join && typeof val.join === 'object') {
      if (val.join.answer) {
        var joinAnswer = self.getAnswerIfValid(val.join.answer);
        if (joinAnswer && joinAnswer.val) {
          if (joinAnswer.val.length === 0) {
            return null;
          } else if (joinAnswer.val.length === 1) {
            return self.helper.literal(joinAnswer.val[0]);
          }
        }
      }
      var toJoin = self.resolveAnswer(val.join);
      if (toJoin === null) return null;
      return self.helper.join(LUtils.shift(toJoin, 2), val.on);
    } else if (val.form) {
      return self.helper.formItem(val.form, val.name);
    }
  } else {
    return self.helper.literal(val);
  }
}

