require "net/http"

class MainController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def get_languages
    uri = URI("https://api.lucybot.com/v1/sample_code/languages")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    headers = {
      "apikey" => "foobar"
    }
    request = Net::HTTP::Get.new(uri.request_uri, headers)
    @result = JSON.parse(http.request(request).body)
    render :template => "main/language_list", :locals => {:result => @result}
  end
end
