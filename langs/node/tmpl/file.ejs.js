var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var app = express();
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
<% if (languages.client === 'html-ejs') { -%>
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
<% } -%>

<%- body %>

app.listen(process.env.PORT || 3333);
