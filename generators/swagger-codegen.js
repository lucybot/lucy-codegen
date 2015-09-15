var Path = require('path');
var FS = require('fs');
var JSCodegen = require('swagger-js-codegen').CodeGen;
var Java = require('java');
var JAVA_DIR = Path.join(__dirname, '..', 'swagger-codegen', 'modules', 'swagger-codegen', 'target');
var dependencies = FS.readdirSync(JAVA_DIR + '/dependency');

dependencies.forEach(function(dependency){
  Java.classpath.push(Path.join(JAVA_DIR, 'dependency', dependency));
})

Java.classpath.push(Path.join(JAVA_DIR, 'classes'));
Java.classpath.push(Path.join(JAVA_DIR, 'test-classes'));

var SwaggerParser = Java.newInstanceSync('io.swagger.parser.SwaggerParser');
var getConfig = Java.import('io.swagger.codegen.Codegen').getConfigSync;
var langConfigs  = {
  'php': getConfig('php'),
}

for (var lang in langConfigs) {
  langConfigs[lang].setOutputDir('.');
}

var j_ClientOpts = Java.newInstanceSync('io.swagger.codegen.ClientOpts');

var Codegen = module.exports = {};

Codegen.build = function(options, callback) {
  if (options.language === 'node') {
    var client = {
      filename: 'client.js',
      contents: JSCodegen.getNodeCode(options),
    }
    var files = [client];
    files.push({
      filename: 'package.json',
      contents: JSON.stringify({
        name: options.packageName || 'swagger-client',
      }, null, 2),
    })
    callback(null, files);
  } else {
    // TODO: use async API
    var swaggerString = JSON.stringify(options.swagger);
    var j_swagger = SwaggerParser.parseSync(swaggerString);
    var j_optInput = Java.newInstanceSync('io.swagger.codegen.ClientOptInput');
    j_optInput.optsSync(j_ClientOpts);
    j_optInput.setConfigSync(langConfigs[options.language]);
    j_optInput.swaggerSync(j_swagger);
    var j_generator = Java.newInstanceSync('io.swagger.codegen.GatherGenerator');
    j_generator.optsSync(j_optInput).generateSync();
    var j_filemap = j_generator.getFilesSync();
    var j_entries = j_filemap.entrySetSync().iteratorSync();
    var filesOut = [];
    while(j_entries.hasNextSync()) {
      var j_pair = j_entries.nextSync();
      filesOut.push({
        filename: j_pair.getKeySync(),
        contents: j_pair.getValueSync(),
      })
    }
    if (options.language === 'php') {
      filesOut.push({
        directory: true,
        filename: 'SwaggerClient-php'
      })
      filesOut.push({
        directory: true,
        filename: 'SwaggerClient-php/lib'
      })
      filesOut.push({
        directory: true,
        filename: 'SwaggerClient-php/lib/Api'
      })
    }
    callback(null, filesOut);
  }
}

