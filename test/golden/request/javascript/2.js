// Built by LucyBot. www.lucybot.com
var url = "http://undefined/";
url += '?' + $.param({
  'q': [
    "one",
    "two",
    "three"
  ]
});
$.ajax({
  url: url,
  method: 'GET',
}).done(function(result) {
  console.log(result);
}).fail(function(err) {
  throw err;
});
