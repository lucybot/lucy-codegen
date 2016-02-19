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

app.post('/get_languages', function(req, res) {
  request.get({
    url: "https://api.lucybot.com/v1/sample_code/languages",
    headers: {
      'apikey': "foobar"
    },
  }, function(err, response, body) {
    body = JSON.parse(body);
    res.render('language_list', {request: req.body, result: body})
  })
});

app.listen(process.env.PORT || 3333);
