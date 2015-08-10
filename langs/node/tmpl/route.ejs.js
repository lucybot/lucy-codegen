app.all('/<%- route %>', function(req, res) {
  if (!req.body) req.body = {};
<%- body %>
});
