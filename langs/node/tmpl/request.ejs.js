request.<%- (req.method || 'get').toLowerCase() %>({
  url: <%- req.baseUrl %>,
<% if (req.query) { -%>
  qs: <%- shift(req.query, 2) %>,
<% } -%>
<% if (req.headers) { -%>
  headers: <%- shift(req.headers, 2) %>,
<% } -%>
<% if (req.body) { -%>
<%   if (req.contentType === 'application/json') { -%>
  body: JSON.stringify(<%- shift(req.body, 2) %>),
<%   } else if (req.bodyFormat === 'form') { -%>
  formData: <%- shift(req.body, 2) -%>,
<%   } else { -%>
  body: <%- shift(req.body, 2) %>,
<%   } -%>
<% } -%>
}, function(err, response, body) {
<% if (req.returns === 'json') { -%>
  body = JSON.parse(body);
<% } -%>
<% if (typeof returnCode === 'function') { -%>
  <%- returnCode('body') %>
<% } else { -%>
<%   if (req.sends === 'stdout') { -%>
  console.log(body);
<%   } else if (req.returns === 'json') { -%>
  res.json(body);
<%   } else { -%>
  res.send(body);
<%   } -%>
<% } -%>
})
