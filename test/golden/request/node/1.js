// Built by LucyBot. www.lucybot.com
request.post({
  url: "https://api.foo.com/bar/baz",
  qs: {
    'q': "Obama"
  },
  headers: {
    'Content-Type': "application/json",
    'apikey': "asdf"
  },
  body: JSON.stringify([{
      'a': 1,
      'b': 2
    }, {
      'a': 3,
      'b': 4
    }]),
}, function(err, response, body) {
  console.log(body);
})
