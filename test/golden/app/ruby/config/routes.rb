Rails.application.routes.draw do
  get 'index' => 'main#index'
  get 'language_list' => 'main#language_list'
  post 'get_languages' => 'main#get_languages'
  root 'main#index'
end
