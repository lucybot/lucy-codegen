# Built by LucyBot. www.lucybot.com
uri = URI("https://api.foo.com/bar/baz")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
headers = {
  "Content-Type" => "application/json",
  "apikey" => "asdf"
}
uri.query = URI.encode_www_form({
  "q" => "Obama"
})
request = Net::HTTP::Post.new(uri.request_uri, headers)
request.body = [{
    "a" => 1,
    "b" => 2
  }, {
    "a" => 3,
    "b" => 4
  }].to_json
@result = http.request(request).body
puts @result
