app.get('/', function(req, res) {
<% if (languages.client === 'html-ejs') { -%>
  res.render('index');
<% } else { -%>
  res.redirect('<%- rootRedirect %>');
<% } -%>
})

<% for (var i = 0; i < routes.length; ++i) { -%>
<%- routes[i] %>
<% } -%>
<% if (languages.client === 'html-ejs') { -%>
app.all('*', function(req, res) {
  res.render(req.path.substring(1));
})
<% } -%>
