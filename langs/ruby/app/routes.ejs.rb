Rails.application.routes.draw do
<% viewNames.forEach(function(r) { -%>
  get '<%- r %>' => 'main#<%- r %>'
<% }) -%>
<% routeNames.forEach(function(a) { -%>
  post '<%- a %>' => 'main#<%- a %>'
<% }) -%>
<% if (languages.client === 'html-erb') { -%>
  root 'main#index'
<% } else { -%>
  root 'main#<%- rootRedirect %>'
<% } -%>
end
