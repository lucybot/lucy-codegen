<%- Lucy.code.request({
  protocol: 'https',
  domain: 'hacker-news.firebaseio.com',
  path: {join: ['v0/item/', {answer: 'itemID'}, '.json']},
  returns: 'json'
}) %>

