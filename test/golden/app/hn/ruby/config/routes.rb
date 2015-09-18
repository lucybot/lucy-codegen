Rails.application.routes.draw do
  get 'index' => 'main#index'
  get 'item' => 'main#item'
  get 'stories' => 'main#stories'
  post 'getItem' => 'main#getItem'
  post 'getStories' => 'main#getStories'
  root 'main#index'
end
