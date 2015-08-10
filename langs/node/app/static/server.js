var express = require('express');
var bodyParser = require('body-parser');
var busboy = require('busboy');
var request = require('request');
<% if (input.setup) { -%>
<%- input.setup.code %>
<% } -%>

var app = express();
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index');
})

<% input.actions.forEach(function(action) { -%>
app.post('/<%- action.name %>', function(req, res) {
  <%- shift(action.code, 2) %>
});

<% }); -%>
app.listen(process.env.PORT || 3333);
