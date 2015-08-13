require "net/http"

class MainController < ApplicationController
  skip_before_filter :verify_authenticity_token
<% input.actions.forEach(function(action) { -%>

  def <%- action.name %>
    <%- shift(action.code, 4) %>
  end
<% }); -%>
end
