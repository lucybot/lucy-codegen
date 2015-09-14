var App = require('express')();
App.use(require('cors')());

App.get('/pets', function(req, res) {
  res.json([{name: 'Lucy', type: 'dog'}]);
});

module.exports = {
  listen: function(port) {
    App.listen(port);
  }
}
