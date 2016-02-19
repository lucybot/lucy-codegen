var express = require('express');
var bodyParser = require('body-parser');
var busboy = require('busboy');
var request = require('request');
var app = express();


app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index');
})

app.post('/getItem', function(req, res) {
  request.get({
    url: "https://hacker-news.firebaseio.com/" + "v0/item/" + req.body.itemID + ".json",
  }, function(err, response, body) {
    body = JSON.parse(body);
    res.render('item', {request: req.body, result: body})
  })
});

app.post('/getStories', function(req, res) {
  request.get({
    url: "https://hacker-news.firebaseio.com/v0/topstories.json",
  }, function(err, response, body) {
    body = JSON.parse(body);
    res.render('stories', {request: req.body, result: body})
  })
});

app.listen(process.env.PORT || 3333);
