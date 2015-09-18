require "net/http"

class MainController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def getItem
    uri = URI("https://hacker-news.firebaseio.com/" + "v0/item/" + request[:itemID] + ".json")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    request = Net::HTTP::Get.new(uri.request_uri)
    @result = JSON.parse(http.request(request).body)
    render :template => "main/_item", :locals => {:result => @result}
  end

  def getStories
    uri = URI("https://hacker-news.firebaseio.com/v0/topstories.json")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    request = Net::HTTP::Get.new(uri.request_uri)
    @result = JSON.parse(http.request(request).body)
    render :template => "main/_stories", :locals => {:result => @result}
  end
end
