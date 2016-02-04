var FS = require('fs');
var EJS = require('ejs');

var Utils = require('../../utils.js');

var App = module.exports = {
  startServer: function(opts) {return 'php -S 0.0.0.0:' + opts.port + ' -t ' + opts.directory},
  includeView: function(view, options) {
    var code = '';
    if (options.data) {
      code = EJS.render(App.templates.include, {view: view, options: options});
    } else {
      if (options.result) {
        code += '<?php $result = $' + options.result + '; ?>';
      }
      var tmpl = options.templates.views[view];
      if (!tmpl) throw new Error("View " + view + " not found");
      var viewCode = EJS.render(tmpl.php, {Lucy: options.lucy});
      code += viewCode;
    }
    return Utils.shift(code, options.indent);
  }
};
Utils.initializeApp(App, __dirname);

App.build = function(input, lucy, callback) {
  var files = [];
  var ejsInput = {
    Lucy: lucy,
    input: input,
    shift: Utils.shift,
  }
  input.actions.forEach(function(action, index) {
    ejsInput.actionIdx = index;
    var actionFile = action.actionFile = {
      filename: action.name + '.php',
      contents: EJS.render(App.templates.action, ejsInput),
      snippets: {},
    };
    actionFile.snippets[action.name] = '<?php\n' + Utils.indent(action.code, 2) + '\n?>';

    if (input.setup) actionFile.snippets.setup = '<?php\n' + Utils.indent(input.setup.code, 2) + '\n?>';
    files.push(actionFile);
  });
  delete ejsInput.actionIdx;

  input.views.forEach(function(view, index) {
    ejsInput.viewIdx = index;
    var viewFile = {
      filename: view.name + '.php',
      contents: EJS.render(App.templates.view, ejsInput),
      snippets: {},
    }
    viewFile.snippets[view.name] = view.code;
    var copiedToAction = false;
    if (!input.languageOptions.useViewRedirect) {
      input.actions.forEach(function(a) {
        if (a.view === view.name) {
          copiedToAction = true;
          a.actionFile.contents += '\n' + viewFile.contents;
          a.actionFile.snippets[view.name] = viewFile.snippets[view.name];
        }
      })
    }
    if (!copiedToAction) files.push(viewFile);
  });
  delete ejsInput.viewIdx;


  for (filename in input.staticFiles) {
    var staticFile = {
      filename: filename + '.php',
      contents: EJS.render(input.staticFiles[filename], ejsInput),
      snippets: {}
    }
    files.push(staticFile);
  }
  var staticTmpls = [{
    filename: 'index.php',
    template: 'index',
  }];
  staticTmpls.forEach(function(f) {
    files.push({
      filename: f.filename,
      contents: EJS.render(App.templates[f.template], ejsInput),
    })
  })

  callback(null, files);
}

