var Expect = require('chai').expect;

var Langs = require('../langs/langs.js');
var LangNames = Object.keys(Langs);
var LangUtils = require('../langs/utils.js');

var testAllLangs = function(tests, fnKey) {
  LangNames.forEach(function(l) {
    it('should work in ' + l, function() {
      tests.forEach(function(t) {
        var result = LangUtils.resolveValue(Langs[l][fnKey], t.input);
        Expect(result).to.equal(t[l]);
      })
    })
  })
}

describe('Variables', function() {
  var variables = [{
    input: 'foo.bar[3].baz',
    node: 'foo.bar[3].baz',
    javascript: 'foo.bar[3].baz',
    php: '$foo->bar[3]->baz',
    ruby: 'foo["bar"][3]["baz"]',
  }];
  testAllLangs(variables, 'variable');
});

describe('Literals', function() {
  var literals = [{
    input: 23,
    node: '23',
    javascript: '23',
    php: '23',
    ruby: '23',
  }, {
    input: "foo",
    node: '"foo"',
    javascript: '"foo"',
    php: '"foo"',
    ruby: '"foo"',
  }, {
    input: ['foo', 'bar', 'baz'],
    node: JSON.stringify(['foo', 'bar', 'baz'], null, 2),
    javascript: JSON.stringify(['foo', 'bar', 'baz'], null, 2),
    php: ['array(', '  0 => "foo",', '  1 => "bar",', '  2 => "baz"', ')'].join('\n'),
    ruby: JSON.stringify(['foo', 'bar', 'baz'], null, 2),
  }]
  testAllLangs(literals, 'literal');
});
