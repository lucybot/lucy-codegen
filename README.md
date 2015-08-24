# lucy-codegen
A library for auto-generating source code in different programming languages. Useful for creating SDKs and sample code.

## Supported Languages
* JavaScript
* NodeJS
* Ruby
* PHP

#### In Progress
* Java
* Python
* cURL

## Project Overview

### Generators
Each generator takes in a language and generates sample code for achieving some goal in that language

* Request: Generates code for making an HTTP request
* App: Generates code for serving a Single Page Application

### Languages
Languages are described in the ```langs/``` directory. Each language is expected to implement certain fields and functions. For instance, JavaScript has the following implementation:

```js
var JS = {
    name: 'javascript',
    label: 'JavaScript',
    extension: '.js',
    nulltype: 'null',
}

JS.comment = function(str) { return '// ' + str }

JS.for = function(iter) {
  return iter.group + '.forEach(function(' + iter.iterator + ', index) {';
}
JS.rof = function(iter) {
  return '});'
}
JS.if = function(cond) {
  return 'if(' + cond +') {'
}
JS.fi = function(cond) {
  return '}'
}
```

Languages are expected to implement the following fields and functions:
* ```name```: Should match the language's subdirectory
* ```label```: A human-readable label for this language
* ```extension```: The default file extension for this language
* ```nulltype```: A string that represents a null value
* ```comment(str)```: A comment block containing the given text
* ```for(cond)```: The opening of a for() loop
* ```rof(cond)```: The end of a for() loop
* ```if(cond)```: The opening of an if() statement
* ```fi(cond)```: The end of an if() statement
* ```variable(name)```: Turns JS syntax (e.g. ```js foo.bar[3].baz  ```) into syntax for this language
* ```literal(literal)```: Turn a JSON serializable object into code for describing it as a literal in this language
* ```concat(strings)```: Code to concatenate the provided strings
* ```jsonEncode(variable)```: Code to convert ```variable``` to a JSON string
* ```html```: A set of functions for generating HTML templates in this language (e.g. EJS for Node, ERB for Ruby)
* ```html.for(cond)```
* ```html.rof(cond)```
* ```html.if(cond)```
* ```html.fi(cond)```
* ```html.variable(name)```
* ```html.variableJS(name)```
* ```app```: A set of instructions for building code that serves a Single Page Application 
