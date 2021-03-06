var FS = require('fs');
var Path = require('path');
var EJS = require('ejs');

var Utils = require('../../utils.js');

var App = module.exports = {
  startServer: function(opts) {return 'bin/rails server -b 0.0.0.0 -p ' + opts.port},
  getPartialFromViewName: function(v) {
    var ret = v.replace(/[A-Z][a-z]/g, function(whole) {
      return '_' + whole.toLowerCase();
    });
    if (ret.indexOf('_') === 0) ret = ret.substring(1);
    return ret;
  },
  includeView: function(view, options) {
    var code = ''
    if (options.data) {
      code = EJS.render(App.templates.include, {view: view, options: options});
    } else {
      var resultStr = options.result ? ', :result => ' + options.result : '';
      code += '<%= render "' + App.getPartialFromViewName(view) + '.html.erb"' + resultStr + ' %>';
    }
    return Utils.shift(code, options.indent);
  }
}
Utils.initializeApp(App, __dirname);

App.build = function(input, lucy, callback) {
  var files = JSON.parse(JSON.stringify(App.copyFiles));
  var ejsInput = {
    Lucy: lucy,
    input: input,
    shift: Utils.shift,
  }
  var controllerFile = {
    contents: EJS.render(App.templates.main_controller, ejsInput),
    filename: 'app/controllers/main_controller.rb',
    snippets: {},
  }
  input.actions.forEach(function(a) {
    controllerFile.snippets[a.name] = a.code;
  });
  if (input.setup) controllerFile.snippets.setup = input.setup.code;
  files.push(controllerFile);

  files.push({
    filename: 'app/views/main',
    directory: true,
  })
  input.views.forEach(function(v) {
    var partialName = '_' + App.getPartialFromViewName(v.name);
    var viewFile = {
      filename: 'app/views/main/' + partialName + '.html.erb',
      contents: v.code,
      snippets: {},
    };
    viewFile.snippets[v.name] = v.code;
    files.push(viewFile);
  });

  var copyTemplates = [{
    filename: 'config/routes.rb',
    template: 'routes',
  }, {
    filename: 'app/views/main/index.html.erb',
    template: 'index',
  }, {
    filename: 'Gemfile',
    template: 'Gemfile',
    hidden: true,
  }];
  copyTemplates.forEach(function(t) {
    var file = {
      contents: EJS.render(App.templates[t.template], ejsInput),
      filename: t.filename,
      hidden: t.hidden,
    }
    files.push(file);
  })

  callback(null, files);
}
