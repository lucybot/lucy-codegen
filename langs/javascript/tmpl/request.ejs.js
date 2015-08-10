var url = <%- req.baseUrl %>;
<% if (req.query) { -%>
url += '?' + $.param(<%- req.query %>);
<% } -%>
$.ajax({
  url: url,
  method: '<%- req.method.toUpperCase() %>',
<% if (req.headers) { -%>
  headers: <%- shift(req.headers, 2) %>,
<% } -%>
<% if (req.body) { -%>
<%   if (req.contentType === 'application/json') { -%>
  data: JSON.stringify(<%- shift(req.body, 2) %>),
<%   } else { -%>
  data: <%- shift(req.body, 2) %>,
<%   } -%>
<% } -%>
}).done(function(result) {
<% if (req.sends === 'stdout') { -%>
  console.log(result);
<% } else { -%>
<%   if (typeof returnCode === 'function') { -%>
<%- returnCode('result') %>
<%   } else { -%>
  $scope.result = result;
  $scope.$apply();
<%   } -%>
<% } -%>
}).fail(function(err) {
  throw err;
});
