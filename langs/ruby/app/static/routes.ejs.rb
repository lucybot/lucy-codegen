Rails.application.routes.draw do
  get 'index' => 'main#index'
<% input.views.forEach(function(view) { -%>
  get '<%- view.name %>' => 'main#<%- view.name %>'
<% }) -%>
<% input.actions.forEach(function(action) { -%>
  post '<%- action.name %>' => 'main#<%- action.name %>'
<% }) -%>
  root 'main#index'
end
