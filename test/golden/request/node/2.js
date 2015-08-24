// Built by LucyBot. www.lucybot.com
request.get({
  url: "http://undefined/",
  qs: {
    'q': [
      "one",
      "two",
      "three"
    ]
  },
}, function(err, response, body) {
  console.log(body);
})
