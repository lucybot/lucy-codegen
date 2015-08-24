# Built by LucyBot. www.lucybot.com
uri = URI("http://undefined/")
http = Net::HTTP.new(uri.host, uri.port)
uri.query = URI.encode_www_form({
  "q" => [
    "one",
    "two",
    "three"
  ]
})
request = Net::HTTP::Get.new(uri.request_uri)
@result = http.request(request).body
puts @result
