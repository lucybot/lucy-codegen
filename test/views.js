var Expect = require('chai').expect;

var translateToEJS = require('../generators/view.js').translateToEJS;

describe('EJS translation', function() {
  it('should leave html untouched', function() {
    var ltml =
      '<h2>Hello World</h2>\n' +
      '<p>hola</p>';
    var ejs = ltml;
    Expect(translateToEJS(ltml)).to.equal(ejs);
  });

  it('should change if tag', function() {
    var ltml =
      '<lucy if="foo">\n' +
      '  <h2>FOO!!</h2>\n' +
      '</lucy>'
    var ejs =
      '<%- Lucy.if("foo") %>\n' +
      '  <h2>FOO!!</h2>\n' +
      '<%- Lucy.fi() %>';
    Expect(translateToEJS(ltml)).to.equal(ejs);
  });

  it('should change for tag', function() {
    var ltml =
      '<lucy for="thing" in="things">\n' +
      '  <h2>{{ index }}</h2>\n' +
      '</lucy>';
    var ejs =
      '<%- Lucy.for("thing in things") %>\n' +
      '  <h2><%- Lucy.variable("index") %></h2>\n' +
      '<%- Lucy.rof() %>'
    Expect(translateToEJS(ltml)).to.equal(ejs);
  });

  it('should change include', function() {
    var ltml =
      '<lucy include="myView" resultvar="foo"></lucy>\n' +
      '<lucy include="myView"\n' +
      '      action="myAction"\n' +
      '      inputs="{q: \'obama\'}"\n' +
      '      inputvars="{user: result.user}">\n' +
      '</lucy>'
    var includeOptions = {
      data: {
        action: "myAction",
        answers: {
          q: "obama",
          user: {variable: 'result.user'}
        }
      }
    }
    var ejs =
      '<%- Lucy.include("myView", {"result":"foo"}) %>\n' +
      '<%- Lucy.include("myView", ' + JSON.stringify(includeOptions) + ') %>';
    Expect(translateToEJS(ltml)).to.equal(ejs);
  });

  it('should allow quotes in attrubutes', function() {
    var ltml =
      '<lucy include="myView"\n' +
      '      action="myAction"\n' +
      '      inputs="{q: \'obama\', esc: &quot;bar&quot;, quot: \'he said &quot;cool!&quot;\'}"\n' +
      '      inputvars="{user: result.user}">\n' +
      '</lucy>';
    var includeOptions = {
      data: {
        action: "myAction",
        answers: {
          q: "obama",
          esc: "bar",
          quot: 'he said "cool!"',
          user: {variable: 'result.user'}
        }
      }
    }
    var ejs = '<%- Lucy.include("myView", ' + JSON.stringify(includeOptions) + ') %>';
    Expect(translateToEJS(ltml)).to.equal(ejs);
  });

  it('should preserve inner tags and attrs', function() {
    var ltml =
      '<lucy for="thing" in="things">\n' +
      '  <h2>{{ index }}</h2>\n' +
      '  <h3 class="head">head</h3>\n' +
      '  <div class="div" attr="val">\n' +
      '    <p class="small">small</p>\n' +
      '  </div>\n' +
      '</lucy>';
    var ejs =
      '<%- Lucy.for("thing in things") %>\n' +
      '  <h2><%- Lucy.variable("index") %></h2>\n' +
      '  <h3 class="head">head</h3>\n' +
      '  <div class="div" attr="val">\n' +
      '    <p class="small">small</p>\n' +
      '  </div>\n' +
      '<%- Lucy.rof() %>'
    Expect(translateToEJS(ltml)).to.equal(ejs);
  })

  it('should handle sibling tags', function() {
    var ltml =
      '<lucy if="foo"></lucy>\n' +
      '<lucy if="bar"></lucy>';
    var ejs =
      '<%- Lucy.if("foo") %><%- Lucy.fi() %>\n' +
      '<%- Lucy.if("bar") %><%- Lucy.fi() %>';
    Expect(translateToEJS(ltml)).to.equal(ejs);
  });

  it('should handle nested tags', function() {
    var ltml =
      '<lucy for="thing" in="things">\n' +
      '  Thing:\n' +
      '  <lucy if="thing.hasStuff">\n' +
      '    {{ thing.stuff }}\n' +
      '  </lucy>\n' +
      '  End Thing\n' +
      '</lucy>'
    var ejs =
      '<%- Lucy.for("thing in things") %>\n' +
      '  Thing:\n' +
      '  <%- Lucy.if("thing.hasStuff") %>\n' +
      '    <%- Lucy.variable("thing.stuff") %>\n' +
      '  <%- Lucy.fi() %>\n' +
      '  End Thing\n' + 
      '<%- Lucy.rof() %>'
    Expect(translateToEJS(ltml)).to.equal(ejs);
  });

  it('should handle complex nesting and siblings', function() {
    var ltml =
      '<lucy if="one"></lucy>\n' +
      '<lucy if="two">\n' +
      '  <lucy for="three" in="foo">\n' +
      '    <lucy if="four"></lucy>\n' +
      '    <lucy if="five">\n' +
      '      <lucy if="six"></lucy>\n' +
      '      <lucy include="view"></lucy>\n' +
      '    </lucy>\n' +
      '  </lucy>\n' +
      '  <lucy if="seven"></lucy>\n' +
      '  <lucy if="eight">\n' +
      '    <lucy if="nine"></lucy>\n' +
      '  </lucy>\n' +
      '</lucy>';
    var ejs =
      '<%- Lucy.if("one") %><%- Lucy.fi() %>\n' +
      '<%- Lucy.if("two") %>\n' +
      '  <%- Lucy.for("three in foo") %>\n' +
      '    <%- Lucy.if("four") %><%- Lucy.fi() %>\n' +
      '    <%- Lucy.if("five") %>\n' +
      '      <%- Lucy.if("six") %><%- Lucy.fi() %>\n' +
      '      <%- Lucy.include("view") %>\n' +
      '    <%- Lucy.fi() %>\n' +
      '  <%- Lucy.rof() %>\n' +
      '  <%- Lucy.if("seven") %><%- Lucy.fi() %>\n' +
      '  <%- Lucy.if("eight") %>\n' +
      '    <%- Lucy.if("nine") %><%- Lucy.fi() %>\n' +
      '  <%- Lucy.fi() %>\n' +
      '<%- Lucy.fi() %>';
    Expect(translateToEJS(ltml)).to.equal(ejs);
  });

  it('should throw errors for bad js objects in include', function() {
    var jsObj = '';
    var run = function() {
      var ltml = '<lucy include="myView" result="' + jsObj + '"></lucy>'
      translateToEJS(ltml);
    }
    jsObj = "{query: 'Obama'}";
    Expect(run).to.not.throw(Error);
    jsObj = '{q: }';
    Expect(run).to.throw(Error);
  });
});
