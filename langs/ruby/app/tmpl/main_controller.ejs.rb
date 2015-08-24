require "net/http"

class MainController < ApplicationController
  skip_before_filter :verify_authenticity_token
<% if (input.setup) { -%>
  <%- shift(input.setup.code, 2) %>

<% } -%>
<% input.actions.forEach(function(action) { -%>

  def <%- action.name %>
    <%- shift(action.code, 4) %>
  end
<% }); -%>
end
