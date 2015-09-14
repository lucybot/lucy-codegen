var App = require('express')();
App.use(require('cors')());

var Pets = [
  {name: 'Lucy', type: 'dog'},
  {name: 'Taco', type: 'cat'},
  {name: 'Blaney', type: 'dog'},
]

App.get('/pets', function(req, res) {
  if (!req.query.type) return res.json(Pets);
  res.json(Pets.filter(function(p) {return p.type === req.query.type}));
});

App.get('/pet/:name', function(req, res) {
  res.json(Pets.filter(function(p) {return p.name === req.params.name})[0]);
});

module.exports = {
  listen: function(port) {
    App.listen(port);
  }
}

if (require.main === module) {
  module.exports.listen(3333);
}
