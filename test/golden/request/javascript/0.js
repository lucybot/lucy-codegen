// Built by LucyBot. www.lucybot.com
var url = "http://api.lucybot.com/request/languages";
$.ajax({
  url: url,
  method: 'GET',
}).done(function(result) {
  console.log(result);
}).fail(function(err) {
  throw err;
});
