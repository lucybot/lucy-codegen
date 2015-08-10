require "net/http"

class MainController < ApplicationController
  skip_before_filter :verify_authenticity_token
<% routes.forEach(function(r) { -%>
<%- r %>
<% }) -%>
end
