// Built by LucyBot. www.lucybot.com
var url = "https://api.foo.com/bar/baz";
url += '?' + $.param({
  'q': "Obama"
});
$.ajax({
  url: url,
  method: 'POST',
  headers: {
    'Content-Type': "application/json",
    'apikey': "asdf"
  },
  data: JSON.stringify([{
      'a': 1,
      'b': 2
    }, {
      'a': 3,
      'b': 4
    }]),
}).done(function(result) {
  console.log(result);
}).fail(function(err) {
  throw err;
});
