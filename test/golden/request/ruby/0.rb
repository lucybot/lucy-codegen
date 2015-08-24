# Built by LucyBot. www.lucybot.com
uri = URI("http://api.lucybot.com/request/languages")
http = Net::HTTP.new(uri.host, uri.port)
request = Net::HTTP::Get.new(uri.request_uri)
@result = http.request(request).body
puts @result
